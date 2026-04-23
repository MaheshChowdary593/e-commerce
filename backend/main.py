import uuid
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import schemas, database, auth
import razorpay
import os
import json
from database import get_db
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Shopsea API")

# Configure CORS origins
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Razorpay client
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_YOUR_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "rzp_test_YOUR_KEY_SECRET")

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

@app.post("/api/auth/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db = Depends(get_db)):
    if db.login.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "name": user.name,
        "hashed_password": hashed_password,
        "role": "user",
        "is_blocked": False,
        "created_at": datetime.utcnow()
    }
    db.login.insert_one(new_user)
    return schemas.User(**new_user)

@app.post("/api/auth/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db = Depends(get_db)):
    user_dict = db.login.find_one({"email": user_credentials.email})
    if not user_dict:
        raise HTTPException(status_code=400, detail="Invalid Credentials")
    
    if not auth.verify_password(user_credentials.password, user_dict["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid Credentials")
        
    # Use 'id' from user_dict, falling back to stringified '_id' if 'id' is missing
    user_id = user_dict.get("id") or str(user_dict["_id"])
    
    access_token_expires = auth.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=schemas.User)
def get_me(current_user: schemas.User = Depends(auth.get_current_user)):
    return current_user



# Synthetic subcategories for better browsing
SUB_CATEGORIES = [
    {"name": "Shirts", "query": "shirt"},
    {"name": "Jeans", "query": "jeans"},
    {"name": "Pants", "query": "pants|track pant", "exclude": "shirt|shoe|boot"},
    {"name": "Footwear", "query": "shoe|sneaker|sandal|boot|slipper", "exclude": "shirt|t-shirt|top|short|pant|polo|neck|jean"},
    {"name": "Accessories", "query": "wallet|bag|belt|watch|perfume|handbag|sunglasses", "exclude": "shorts|shirt|t-shirt|top|pant|jeans|shoe|footwear|bottom"},
    {"name": "Boxers", "query": "boxer"},
    {"name": "Toys", "query": "toy"},
    {"name": "Fashion", "query": "clothing|accessories"}
]

# Global cache for categories to prevent repeated slow queries 
CACHED_CATEGORIES = None


@app.get("/api/categories", response_model=List[schemas.Category])
def get_categories(response: Response, db = Depends(get_db)):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    global CACHED_CATEGORIES
    # Force reset for this deployment to apply exclusion logic to sample images
    # CACHED_CATEGORIES = None 
    if CACHED_CATEGORIES:
        print(f"Returning CACHED categories: {[c.name for c in CACHED_CATEGORIES]}")
        return CACHED_CATEGORIES

    print("Generating fresh categories...")
    results = []
    for index, cat in enumerate(SUB_CATEGORIES):
        # Fetch one representative product for the image using the index
        query = {
            "$or": [
                {"title": {"$regex": cat["query"], "$options": "i"}},
                {"category": {"$regex": cat["query"], "$options": "i"}},
                {"brand": {"$regex": cat["query"], "$options": "i"}}
            ]
        }
        # Apply exclusion if present
        if "exclude" in cat:
            query["title"] = {"$not": {"$regex": cat["exclude"], "$options": "i"}}

        # Use find_one with sort to make it deterministic and maybe use index better
        sample_prod = db.products.find_one(query)
        image_url = None
        if sample_prod:
            mapped = map_product(sample_prod)
            image_url = mapped.image_url
            
        results.append(schemas.Category(
            id=str(index),
            name=cat["name"],
            slug=cat["name"].lower().replace(" & ", "-").replace(" ", "-"),
            description=f"Browse {cat['name']}",
            image_url=image_url
        ))
    
    CACHED_CATEGORIES = results
    return results

import admin_routes
from utils.product_utils import map_product
from utils.mistral_utils import parse_query_with_mistral

app.include_router(admin_routes.router)

@app.get("/api/products", response_model=List[schemas.Product])
def get_products(
    response: Response,
    category: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    db = Depends(get_db)
):
    query = {}
    if category:
        # Normalize requested category for better matching
        norm_cat = category.lower().rstrip('s').rstrip('es')
        
        # Check if it matches any        # Fetch products based on category keywords
        sub_cat = next((c for c in SUB_CATEGORIES if norm_cat in c["name"].lower() or c["query"] in norm_cat), None)
        
        if sub_cat:
            # Search in title, brand, or broad category using the sub-cat query
            query["$or"] = [
                {"title": {"$regex": sub_cat["query"], "$options": "i"}},
                {"category": {"$regex": sub_cat["query"], "$options": "i"}},
                {"brand": {"$regex": sub_cat["query"], "$options": "i"}}
            ]
            if "exclude" in sub_cat:
                query["title"] = {"$not": {"$regex": sub_cat["exclude"], "$options": "i"}}
        else:
            # Fallback to standard category search
            query["category"] = {"$regex": category, "$options": "i"}

        print(f"Executing Query for {category}: {query}")
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
            
    print(f"GET /api/products: cat={category}, query={query}")
    products = list(db.products.find(query).sort("created_at", -1).skip(skip).limit(limit))
    print(f"Found {len(products)} products")
    return [map_product(p) for p in products]

@app.get("/api/products/search", response_model=List[schemas.Product])
def search_products(
    q: Optional[str] = None,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    limit: int = 20,
    skip: int = 0,
    user_id: Optional[str] = None,
    db = Depends(get_db)
):
    print(f"GET /api/products/search: q={q}, limit={limit}, skip={skip}")
    
    query = {}
    and_clauses = []
    
    if q:
        # Store search history
        if user_id:
            history_entry = {
                "user_id": user_id,
                "query": q,
                "timestamp": datetime.utcnow()
            }
            db.search_history.insert_one(history_entry)
            
        # Clean and split query into individual keywords
        keywords = [word.rstrip('s').rstrip('es') for word in q.lower().split() if len(word) > 2]
        if not keywords:
            keywords = [q.lower().strip()]
            
        # Robust Keyword Matching: EVERY keyword must match at least one field
        for kw in keywords:
            and_clauses.append({
                "$or": [
                    {"title": {"$regex": kw, "$options": "i"}},
                    {"category": {"$regex": kw, "$options": "i"}},
                    {"brand": {"$regex": kw, "$options": "i"}}
                ]
            })
        
    if category:
        norm_cat = category.lower().rstrip('s').rstrip('es')
        sub_cat = next((c for c in SUB_CATEGORIES if norm_cat in c["name"].lower() or c["query"] in norm_cat), None)
        
        if sub_cat:
            cat_or = {
                "$or": [
                    {"title": {"$regex": sub_cat["query"], "$options": "i"}},
                    {"category": {"$regex": sub_cat["query"], "$options": "i"}},
                    {"brand": {"$regex": sub_cat["query"], "$options": "i"}}
                ]
            }
            if "exclude" in sub_cat:
                excluded = {"title": {"$not": {"$regex": sub_cat["exclude"], "$options": "i"}}}
                and_clauses.append(cat_or)
                and_clauses.append(excluded)
            else:
                and_clauses.append(cat_or)
        else:
            and_clauses.append({"category": {"$regex": category, "$options": "i"}})
        
    if brand:
        and_clauses.append({"brand": {"$regex": brand, "$options": "i"}})
        
    if and_clauses:
        query["$and"] = and_clauses
        
    print(f"Mongo Flexible Search Query: {query}")
    
    if price_min is None and price_max is None:
        # Optimized path to prevent fetching thousands of products into memory
        cursor = db.products.find(query).sort("created_at", -1).skip(skip).limit(limit)
        products_slice = [map_product(p) for p in cursor]
        print(f"Optimized search returning slice of {len(products_slice)}")
        return products_slice

    # We fetch products matching the text query, then apply price filters in memory
    # because DB has inconsistently formatted string prices with commas/rupee symbols
    cursor = db.products.find(query)
    
    filtered_products = []
    for p in cursor:
        mapped = map_product(p)
        
        # apply price filtering manually
        if price_min is not None and mapped.final_price < price_min:
            continue
        if price_max is not None and mapped.final_price > price_max:
            continue
            
        filtered_products.append(mapped)
        
    # Apply pagination on the filtered results
    products_slice = filtered_products[skip : skip + limit]
    
    print(f"Found {len(filtered_products)} total after filters, returning slice of {len(products_slice)}")
    return products_slice

@app.get("/api/products/recommendations", response_model=List[schemas.Product])
def get_recommendations(
    current_user: Optional[schemas.User] = Depends(auth.get_current_user_optional),
    db = Depends(get_db)
):
    recommendations = []
    
    if current_user:
        # Get user's search history
        user_history = list(db.search_history.find({"user_id": current_user.id}).sort("timestamp", -1).limit(5))
        if user_history:
            # Extract keywords from history
            last_query = user_history[0]["query"]
            sample_prod = db.products.find_one({"title": {"$regex": last_query, "$options": "i"}})
            
            if sample_prod:
                cat = sample_prod.get("category")
                recommendations = list(db.products.find({"category": cat}).limit(10))
                
    if not recommendations:
        # Fallback to trending (highest rated)
        recommendations = list(db.products.find().sort("average_rating", -1).limit(10))
        
    return [map_product(p) for p in recommendations]

@app.get("/api/search/history", response_model=List[str])
def get_search_history(current_user: schemas.User = Depends(auth.get_current_user), db = Depends(get_db)):
    # Fetch unique recent search queries
    history = list(db.search_history.find(
        {"user_id": current_user.id}
    ).sort("timestamp", -1).limit(20))
    
    # Return unique queries in order
    seen = set()
    unique_queries = []
    for h in history:
        q = h["query"]
        if q not in seen:
            unique_queries.append(q)
            seen.add(q)
            
    return unique_queries[:15]

@app.get("/api/search/related-categories", response_model=List[schemas.Category])
def get_related_categories(current_user: schemas.User = Depends(auth.get_current_user), db = Depends(get_db)):
    # Get last 10 unique searches
    history = list(db.search_history.find(
        {"user_id": current_user.id}
    ).sort("timestamp", -1).limit(20))
    
    seen_queries = set()
    category_counts = {}
    
    for h in history:
        q = h["query"]
        if q in seen_queries: continue
        seen_queries.add(q)
        
        # Find product categories matching this query (limit to avoid slow queries)
        # We use a broad search similar to search_products but just for category names
        prods = list(db.products.find(
            {"$or": [
                {"title": {"$regex": q, "$options": "i"}},
                {"category": {"$regex": q, "$options": "i"}}
            ]}
        ).limit(5))
        
        for p in prods:
            cat_name = p.get("category")
            if cat_name:
                category_counts[cat_name] = category_counts.get(cat_name, 0) + 1
                
    if not category_counts:
        return []
        
    # Sort categories by frequency
    sorted_cats = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
    top_cat_names = [c[0] for c in sorted_cats[:6]]
    
    # Map to full Category objects from SUB_CATEGORIES or fresh generation
    # Re-use logic from get_categories for consistency
    results = []
    for cat_name in top_cat_names:
        # Find matching SUB_CATEGORY or create dynamic one
        sub_cat = next((c for c in SUB_CATEGORIES if c["name"].lower() == cat_name.lower()), None)
        
        # Use find_one for sample image
        sample_prod = db.products.find_one({"category": {"$regex": f"^{cat_name}$", "$options": "i"}})
        image_url = None
        if sample_prod:
            mapped = map_product(sample_prod)
            image_url = mapped.image_url
            
        results.append(schemas.Category(
            id=cat_name.lower().replace(" ", "-"),
            name=cat_name,
            slug=cat_name.lower().replace(" ", "-"),
            description=f"Personalized for you: {cat_name}",
            image_url=image_url
        ))
        
    return results

@app.get("/api/products/{slug}", response_model=schemas.Product)
def get_product(slug: str, db = Depends(get_db)):
    product = db.products.find_one({"$or": [{"slug": slug}, {"_id": slug}, {"pid": slug}]})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return map_product(product)

@app.post("/api/orders", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db = Depends(get_db)):
    order_id = str(uuid.uuid4())
    
    db_order = {
        "id": order_id,
        "total_price": float(order.total_price),
        "status": "pending",
        "email": order.email,
        "shipping_address": order.shipping_address,
        "created_at": datetime.utcnow()
    }
    db.orders.insert_one(db_order)
    
    db_items = []
    for item in order.items:
        db_item = {
            "id": str(uuid.uuid4()),
            "order_id": order_id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": float(item.price)
        }
        db.order_items.insert_one(db_item)
        db_items.append(db_item)
        
    db_order["items"] = db_items
    return schemas.Order(**db_order)

@app.post("/api/payment/create-order", response_model=schemas.RazorpayOrderResponse)
def create_razorpay_order(order: schemas.OrderCreate, current_user: schemas.User = Depends(auth.get_current_user), db = Depends(get_db)):
    # Create internal order first
    order_id = str(uuid.uuid4())
    amount_in_paisa = int(float(order.total_price) * 100)
    
    # Razorpay order
    notes = {"email": order.email, "internal_order_id": order_id}
    razorpay_order = client.order.create({
        "amount": amount_in_paisa,
        "currency": "INR",
        "receipt": order_id,
        "notes": notes
    })
    
    db_order = {
        "id": order_id,
        "total_price": float(order.total_price),
        "status": "pending",
        "email": order.email,
        "shipping_address": order.shipping_address,
        "user_id": current_user.id,
        "razorpay_order_id": razorpay_order['id'],
        "created_at": datetime.utcnow()
    }
    db.orders.insert_one(db_order)
    
    for item in order.items:
        db_item = {
            "id": str(uuid.uuid4()),
            "order_id": order_id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": float(item.price),
            "sku": item.sku,
            "name": item.name,
            "image_url": item.image_url
        }
        db.order_items.insert_one(db_item)
        
    return schemas.RazorpayOrderResponse(
        id=razorpay_order['id'],
        amount=razorpay_order['amount'],
        currency=razorpay_order['currency'],
        receipt=razorpay_order['receipt']
    )

@app.post("/api/payment/verify")
def verify_payment(verification: schemas.PaymentVerification, db = Depends(get_db)):
    try:
        # Verify signature
        client.utility.verify_payment_signature({
            'razorpay_order_id': verification.razorpay_order_id,
            'razorpay_payment_id': verification.razorpay_payment_id,
            'razorpay_signature': verification.razorpay_signature
        })
        
        # Update order status
        db.orders.update_one(
            {"razorpay_order_id": verification.razorpay_order_id},
            {"$set": {
                "status": "paid",
                "razorpay_payment_id": verification.razorpay_payment_id,
                "razorpay_signature": verification.razorpay_signature
            }}
        )
        return {"status": "success"}
    except Exception as e:
        print(f"Payment verification failed: {e}")
        raise HTTPException(status_code=400, detail="Payment verification failed")

@app.get("/api/orders/me", response_model=List[schemas.Order])
def get_user_orders(current_user: schemas.User = Depends(auth.get_current_user), db = Depends(get_db)):
    orders = list(db.orders.find({"user_id": current_user.id}).sort("created_at", -1))
    
    for order in orders:
        items = list(db.order_items.find({"order_id": order["id"]}))
        order["items"] = items
        
    return [schemas.Order(**o) for o in orders]

@app.get("/api/cart", response_model=List[schemas.CartItem])
def get_cart(current_user: schemas.User = Depends(auth.get_current_user), db = Depends(get_db)):
    cart_items = list(db.cart.find({"user_id": current_user.id}))
    return [schemas.CartItem(**item) for item in cart_items]

@app.post("/api/cart")
def add_to_cart(cart_update: schemas.CartUpdate, current_user: schemas.User = Depends(auth.get_current_user), db = Depends(get_db)):
    # Get product details to store in cart
    product = db.products.find_one({"$or": [{"_id": cart_update.product_id}, {"pid": cart_update.product_id}, {"id": cart_update.product_id}]})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    mapped = map_product(product)
    
    db.cart.update_one(
        {"user_id": current_user.id, "product_id": mapped.id},
        {"$set": {
            "name": mapped.name,
            "price": mapped.price,
            "image_url": mapped.image_url,
            "quantity": cart_update.quantity,
            "sku": mapped.sku
        }},
        upsert=True
    )
    return {"status": "success"}

@app.delete("/api/cart/{product_id}")
def remove_from_cart(product_id: str, current_user: schemas.User = Depends(auth.get_current_user), db = Depends(get_db)):
    db.cart.delete_one({"user_id": current_user.id, "product_id": product_id})
    return {"status": "success"}

@app.delete("/api/cart")
def clear_cart(current_user: schemas.User = Depends(auth.get_current_user), db = Depends(get_db)):
    db.cart.delete_many({"user_id": current_user.id})
    return {"status": "success"}

@app.get("/api/addresses", response_model=List[schemas.Address])
def get_addresses(current_user: schemas.User = Depends(auth.get_current_user), db = Depends(get_db)):
    addresses = list(db.addresses.find({"user_id": current_user.id}))
    return [schemas.Address(**addr) for addr in addresses]

@app.post("/api/addresses", response_model=schemas.Address)
def create_address(address: schemas.AddressCreate, current_user: schemas.User = Depends(auth.get_current_user), db = Depends(get_db)):
    if address.isDefault:
        db.addresses.update_many({"user_id": current_user.id}, {"$set": {"isDefault": False}})
    
    existing = db.addresses.count_documents({"user_id": current_user.id})
    if existing == 0:
        address.isDefault = True

    new_addr = {
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "name": address.name,
        "details": address.details,
        "isDefault": address.isDefault
    }
    db.addresses.insert_one(new_addr)
    return schemas.Address(**new_addr)

@app.delete("/api/addresses/{address_id}")
def delete_address(address_id: str, current_user: schemas.User = Depends(auth.get_current_user), db = Depends(get_db)):
    result = db.addresses.delete_one({"id": address_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"status": "success"}

@app.put("/api/addresses/{address_id}/default")
def set_default_address(address_id: str, current_user: schemas.User = Depends(auth.get_current_user), db = Depends(get_db)):
    addr = db.addresses.find_one({"id": address_id, "user_id": current_user.id})
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
        
    db.addresses.update_many({"user_id": current_user.id}, {"$set": {"isDefault": False}})
    db.addresses.update_one({"id": address_id, "user_id": current_user.id}, {"$set": {"isDefault": True}})
    return {"status": "success"}

@app.get("/api/favorites", response_model=List[schemas.Product])
def get_favorites(current_user: schemas.User = Depends(auth.get_current_user), db = Depends(get_db)):
    favs = list(db.favorites.find({"user_id": current_user.id}))
    product_ids = [f["product_id"] for f in favs]
    
    products = list(db.products.find({
        "$or": [
            {"id": {"$in": product_ids}},
            {"_id": {"$in": product_ids}},
            {"pid": {"$in": product_ids}}
        ]
    }))
    return [map_product(p) for p in products]

@app.post("/api/favorites")
def add_favorite(favorite: schemas.FavoriteCreate, current_user: schemas.User = Depends(auth.get_current_user), db = Depends(get_db)):
    db.favorites.update_one(
        {"user_id": current_user.id, "product_id": favorite.product_id},
        {"$setOnInsert": {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "product_id": favorite.product_id,
            "created_at": datetime.utcnow()
        }},
        upsert=True
    )
    return {"status": "success"}

@app.delete("/api/favorites/{product_id}")
def remove_favorite(product_id: str, current_user: schemas.User = Depends(auth.get_current_user), db = Depends(get_db)):
    db.favorites.delete_one({"user_id": current_user.id, "product_id": product_id})
    return {"status": "success"}

@app.post("/api/newsletter")
def join_newsletter(data: schemas.NewsletterSubscribe, db = Depends(get_db)):
    db.newsletters.update_one(
        {"email": data.email},
        {"$setOnInsert": {"email": data.email, "joined_at": datetime.utcnow()}},
        upsert=True
    )
    return {"status": "success", "message": "Joined newsletter successfully"}

# --- AI Assistant (Local - No API Key Required) ---
import re

CATEGORIES = ["shirts", "jeans", "pants", "shoes", "footwear", "accessories", "boxers", "toys", "fashion", "electronics", "bags", "watches", "perfume"]
COLORS = ["red", "blue", "green", "black", "white", "yellow", "pink", "purple", "orange", "brown", "grey", "gray", "navy", "beige", "maroon"]
SIZES = ["xs", "s", "m", "l", "xl", "xxl", "2xl", "3xl", "small", "medium", "large", "extra large", "free size"]
INDEX_MAP = {"first": 0, "1st": 0, "second": 1, "2nd": 1, "third": 2, "3rd": 2, "fourth": 3, "4th": 3, "fifth": 4, "5th": 4}

def parse_assistant_query(message: str):
    msg = message.lower().strip()
    
    # --- VIEW_CART ---
    if any(kw in msg for kw in ["view cart", "show cart", "my cart", "open cart", "see cart", "what's in my cart", "check cart"]):
        return {"action": "VIEW_CART", "query": "", "filters": {}, "product_name": "", "index": None}
    
    # --- REMOVE_FROM_CART ---
    if any(kw in msg for kw in ["remove from cart", "delete from cart", "remove item", "clear cart"]):
        idx = None
        for word, i in INDEX_MAP.items():
            if word in msg:
                idx = i
                break
        return {"action": "REMOVE_FROM_CART", "query": msg, "filters": {}, "product_name": "", "index": idx}
    
    # --- ADD_TO_CART ---
    if any(kw in msg for kw in ["add to cart", "add it", "add this", "buy this", "buy it", "i want to buy", "i'll take"]):
        idx = None
        for word, i in INDEX_MAP.items():
            if word in msg:
                idx = i
                break
        product = re.sub(r"(add|to cart|buy|this|it|the|please|i want|i'll take|put in cart)", "", msg).strip()
        return {"action": "ADD_TO_CART", "query": product, "filters": {}, "product_name": product, "index": idx}
    
    # --- RECOMMEND_PRODUCTS ---
    if any(kw in msg for kw in ["best", "recommend", "suggest", "top rated", "popular", "trending", "what should i"]):
        query = re.sub(r"(best|recommend|suggest|me|some|the|top rated|popular|trending|what should i buy|for|please)", "", msg).strip()
        cat = ""
        for c in CATEGORIES:
            if c in msg:
                cat = c
                break
        return {"action": "RECOMMEND_PRODUCTS", "query": query or "recommended", "filters": {"category": cat}, "product_name": "", "index": None}
    
    # --- SEARCH_PRODUCT (default) ---
    filters = {"category": "", "price_max": None, "price_min": None, "brand": "", "color": "", "size": ""}
    
    # Extract category
    for c in CATEGORIES:
        if c in msg:
            filters["category"] = c
            break
    
    # Extract color
    for c in COLORS:
        if c in msg:
            filters["color"] = c
            break
    
    # Extract size
    for s in SIZES:
        if s in msg.split() or s in msg:
            filters["size"] = s
            break
    
    # Extract price hints
    if any(kw in msg for kw in ["cheap", "budget", "affordable", "low price", "inexpensive"]):
        filters["price_max"] = 500
    if any(kw in msg for kw in ["premium", "expensive", "luxury", "high end"]):
        filters["price_min"] = 2000
    
    # Extract explicit price
    price_match = re.findall(r"(?:under|below|less than|max|upto|up to)\s*(?:rs\.?|₹|inr)?\s*(\d+)", msg)
    if price_match:
        filters["price_max"] = float(price_match[0])
    price_match2 = re.findall(r"(?:above|over|more than|min|atleast|at least)\s*(?:rs\.?|₹|inr)?\s*(\d+)", msg)
    if price_match2:
        filters["price_min"] = float(price_match2[0])
    
    # Extract index
    idx = None
    for word, i in INDEX_MAP.items():
        if word in msg:
            idx = i
            break
    
    # Clean query
    query = re.sub(r"(find|show|search|me|some|for|please|i want|i need|looking for|get|can you|could you)", "", msg).strip()
    
    return {"action": "SEARCH_PRODUCT", "query": query or msg, "filters": filters, "product_name": query, "index": idx}

@app.post("/api/assistant")
def assistant_chat(request: schemas.AssistantRequest, db = Depends(get_db), current_user: Optional[schemas.User] = Depends(auth.get_current_user_optional)):
    """
    Unified AI Assistant using Mistral.
    Handles Search, Cart, and Recommendations with the same NLP intelligence.
    """
    try:
        user_id = current_user.id if current_user else None
        
        # 1. Parse unified intent with Mistral
        result = parse_query_with_mistral(request.message)
        
        # 2. Apply personalized "cheap" threshold if needed
        if result.get("price_max") == -1:
            threshold = 1000
            if user_id:
                orders = list(db.orders.find({"user_id": user_id}).sort("created_at", -1).limit(10))
                if orders:
                    avg_order = sum(o.get("total_price", 0) for o in orders) / len(orders)
                    threshold = max(500, avg_order * 0.7)
            result["price_max"] = threshold
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="AI Assistant currently unavailable")

@app.post("/api/search-ai")
def ai_search_products(request: schemas.AISearchRequest, db = Depends(get_db)):
    """
    Advanced Natural Language Search using Mistral AI.
    Calculates personalized thresholds and maps AI output to complex MongoDB queries.
    """
    user_query = request.query
    user_id = request.user_id
    
    # 1. Parse query with Mistral
    structured = parse_query_with_mistral(user_query)
    
    with open("debug_ai.log", "a") as f:
        f.write(f"\nUser Query: {user_query}\nMistral Struct: {json.dumps(structured)}\n")
    
    # 2. Handle Personalized "Cheap" Threshold
    if structured.get("price_max") == -1:
        threshold = 1000 # Default
        if user_id:
            orders = list(db.orders.find({"user_id": user_id}).sort("created_at", -1).limit(10))
            if orders:
                avg_order = sum(o.get("total_price", 0) for o in orders) / len(orders)
                threshold = max(500, avg_order * 0.7)
        structured["price_max"] = threshold

    # 3. Build MongoDB Query with Robust Category Mapping
    def build_query(data, soft=False):
        and_clauses = []
        
        # Core query term with strict and-based keyword matching
        q = data.get("query")
        if q:
            keywords = [word.rstrip('s').rstrip('es') for word in q.lower().split() if len(word) > 2]
            if not keywords: keywords = [q.lower()]
            
            for kw in keywords:
                and_clauses.append({
                    "$or": [
                        {"title": {"$regex": kw, "$options": "i"}},
                        {"category": {"$regex": kw, "$options": "i"}},
                        {"brand": {"$regex": kw, "$options": "i"}},
                        {"description": {"$regex": kw, "$options": "i"}}
                    ]
                })
            
        # Category Mapping (Using SUB_CATEGORIES logic)
        cat_name = data.get("category")
        if cat_name:
            norm_cat = cat_name.lower().rstrip('s').rstrip('es')
            sub_cat = next((c for c in SUB_CATEGORIES if norm_cat in c["name"].lower() or c["query"] in norm_cat), None)
            
            if sub_cat:
                cat_or = {
                    "$or": [
                        {"title": {"$regex": sub_cat["query"], "$options": "i"}},
                        {"category": {"$regex": sub_cat["query"], "$options": "i"}},
                        {"brand": {"$regex": sub_cat["query"], "$options": "i"}}
                    ]
                }
                and_clauses.append(cat_or)
                if "exclude" in sub_cat:
                    and_clauses.append({"title": {"$not": {"$regex": sub_cat["exclude"], "$options": "i"}}})
            else:
                and_clauses.append({"category": {"$regex": cat_name, "$options": "i"}})
        
        # Strict filters (ignored in soft mode)
        if not soft:
            if data.get("brand"):
                and_clauses.append({"brand": {"$regex": data["brand"], "$options": "i"}})
            if data.get("color"):
                and_clauses.append({"$or": [{"title": {"$regex": data["color"], "$options": "i"}}, {"tags": {"$regex": data["color"], "$options": "i"}}]})
            if data.get("size"):
                and_clauses.append({"$or": [{"title": {"$regex": data["size"], "$options": "i"}}, {"tags": {"$regex": f"\\b{data['size']}\\b", "$options": "i"}}]})
            if data.get("rating_min"):
                and_clauses.append({"$or": [{"rating": {"$gte": data["rating_min"]}}, {"average_rating": {"$gte": data["rating_min"]}}]})
            if data.get("features"):
                for feature in data["features"]:
                    and_clauses.append({"$or": [{"tags": {"$regex": feature, "$options": "i"}}, {"description": {"$regex": feature, "$options": "i"}}, {"title": {"$regex": feature, "$options": "i"}}]})
                    
        return {"$and": and_clauses} if and_clauses else {}

    # 4. Sorting & Fetching
    sort_criteria = []
    sort_type = structured.get("sort_by")
    if sort_type == "price_low": sort_criteria = [("selling_price", 1)]
    elif sort_type == "price_high": sort_criteria = [("selling_price", -1)]
    elif sort_type == "rating": sort_criteria = [("average_rating", -1), ("rating", -1)]
    elif sort_type == "newest": sort_criteria = [("created_at", -1)]

    # Stage 1: Attempt search with all filters
    mongo_query = build_query(structured)
    cursor = db.products.find(mongo_query)
    if sort_criteria: cursor = cursor.sort(sort_criteria)
    
    p_min = structured.get("price_min")
    p_max = structured.get("price_max")
    
    results = []
    from utils.product_utils import map_product
    
    for p in cursor.limit(80):
        mapped = map_product(p)
        if p_min is not None and mapped.final_price < p_min: continue
        if p_max is not None and mapped.final_price > p_max: continue
        results.append(mapped)

    # Stage 2: Soft Fallback if no results (Ignore brand/color/size/features)
    if not results and (structured.get("brand") or structured.get("color") or structured.get("features")):
        soft_query = build_query(structured, soft=True)
        cursor = db.products.find(soft_query)
        if sort_criteria: cursor = cursor.sort(sort_criteria)
        for p in cursor.limit(40):
            mapped = map_product(p)
            if p_min is not None and mapped.final_price < p_min: continue
            if p_max is not None and mapped.final_price > p_max: continue
            results.append(mapped)

    # Final Fallback: Trending fallback if still nothing
    if not results:
        results = [map_product(p) for p in db.products.find().sort("rating", -1).limit(10)]
        
    return {"products": results, "filters": structured}

@app.post("/parse-query", response_model=schemas.MongoQueryResponse)
def parse_query(request: schemas.NaturalLanguageQueryRequest):
    try:
        return parse_query_with_mistral(request.query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
