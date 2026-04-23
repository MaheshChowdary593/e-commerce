from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from typing import List, Optional
from datetime import datetime, timedelta
import schemas, auth, database
from database import get_db
from utils.cloudinary_utils import upload_image
from utils.pdf_utils import generate_invoice_pdf
from fastapi.responses import StreamingResponse
import uuid
import pandas as pd
from io import StringIO
import json

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/dashboard", response_model=schemas.AdminDashboardStats)
def get_admin_dashboard(current_admin: schemas.User = Depends(auth.get_current_admin), db = Depends(get_db)):
    # Stats
    total_users = db.login.count_documents({})
    total_orders = db.orders.count_documents({})
    
    # Revenue aggregation
    pipeline = [
        {"$match": {"status": {"$in": ["paid", "delivered", "shipped"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$total_price"}}}
    ]
    revenue_result = list(db.orders.aggregate(pipeline))
    total_revenue = revenue_result[0]["total"] if revenue_result else 0.0
    
    pending_orders = db.orders.count_documents({"status": "pending"})
    delivered_orders = db.orders.count_documents({"status": "delivered"})
    
    low_stock_products = db.products.count_documents({"stock": {"$lt": 10}})
    
    # Recent orders
    recent_orders_list = list(db.orders.find().sort("created_at", -1).limit(10))
    for order in recent_orders_list:
        order["items"] = list(db.order_items.find({"order_id": order["id"]}))
        
    return schemas.AdminDashboardStats(
        total_users=total_users,
        total_orders=total_orders,
        total_revenue=total_revenue,
        pending_orders=pending_orders,
        delivered_orders=delivered_orders,
        low_stock_products=low_stock_products,
        recent_orders=recent_orders_list
    )

@router.get("/analytics/sales")
def get_sales_analytics(days: int = 30, current_admin: schemas.User = Depends(auth.get_current_admin), db = Depends(get_db)):
    start_date = datetime.utcnow() - timedelta(days=days)
    
    pipeline = [
        {"$match": {"created_at": {"$gte": start_date}, "status": {"$ne": "cancelled"}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "revenue": {"$sum": "$total_price"},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    results = list(db.orders.aggregate(pipeline))
    return results

@router.get("/products", response_model=List[schemas.Product])
def get_all_products(limit: int = 100, skip: int = 0, current_admin: schemas.User = Depends(auth.get_current_admin), db = Depends(get_db)):
    products = list(db.products.find().sort("created_at", -1).skip(skip).limit(limit))
    from utils.product_utils import map_product
    return [map_product(p) for p in products]

@router.post("/products")
async def create_product(
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    stock: int = Form(...),
    image: UploadFile = File(None),
    current_admin: schemas.User = Depends(auth.get_current_admin),
    db = Depends(get_db)
):
    image_url = ""
    if image:
        # Save temp file then upload to cloudinary
        temp_path = f"temp_{image.filename}"
        with open(temp_path, "wb") as buffer:
            buffer.write(await image.read())
        image_url = upload_image(temp_path)
        import os
        os.remove(temp_path)
    
    new_product = {
        "_id": str(uuid.uuid4()),
        "title": title,
        "description": description,
        "selling_price": price,
        "actual_price": price,
        "category": category,
        "stock": stock,
        "images": [image_url] if image_url else [],
        "created_at": datetime.utcnow()
    }
    db.products.insert_one(new_product)
    return {"status": "success", "id": new_product["_id"]}

@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    stock: int = Form(...),
    image: UploadFile = File(None),
    current_admin: schemas.User = Depends(auth.get_current_admin),
    db = Depends(get_db)
):
    update_data = {
        "title": title,
        "description": description,
        "selling_price": price,
        "actual_price": price,
        "category": category,
        "stock": stock,
    }
    
    if image:
        temp_path = f"temp_{image.filename}"
        with open(temp_path, "wb") as buffer:
            buffer.write(await image.read())
        image_url = upload_image(temp_path)
        import os
        os.remove(temp_path)
        update_data["images"] = [image_url]

    result = db.products.update_one({"_id": product_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        # Fallback for datasets where id is 'id' or 'pid' instead of '_id'
        result = db.products.update_one({"id": product_id}, {"$set": update_data})
        if result.matched_count == 0:
            result = db.products.update_one({"pid": product_id}, {"$set": update_data})
            
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return {"status": "success"}

@router.delete("/products/{product_id}")
def delete_product(product_id: str, current_admin: schemas.User = Depends(auth.get_current_admin), db = Depends(get_db)):
    result = db.products.delete_one({"_id": product_id})
    if result.deleted_count == 0:
        result = db.products.delete_one({"id": product_id})
        if result.deleted_count == 0:
            result = db.products.delete_one({"pid": product_id})
            
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return {"status": "success"}

@router.put("/orders/{order_id}/status")
def update_order_status(order_id: str, status: str, current_admin: schemas.User = Depends(auth.get_current_admin), db = Depends(get_db)):
    valid_statuses = ["pending", "shipped", "delivered", "cancelled", "paid"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    result = db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": "success"}

@router.get("/orders/invoice/{order_id}")
def get_order_invoice(order_id: str, current_admin: schemas.User = Depends(auth.get_current_admin), db = Depends(get_db)):
    order = db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    items = list(db.order_items.find({"order_id": order_id}))
    pdf_buffer = generate_invoice_pdf(order, items)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{order_id}.pdf"}
    )

@router.get("/users", response_model=List[schemas.User])
def get_all_users(current_admin: schemas.User = Depends(auth.get_current_admin), db = Depends(get_db)):
    users = list(db.login.find())
    return [schemas.User(**u) for u in users]

@router.post("/users/{user_id}/block")
def toggle_user_block(user_id: str, block: bool, current_admin: schemas.User = Depends(auth.get_current_admin), db = Depends(get_db)):
    db.login.update_one({"id": user_id}, {"$set": {"is_blocked": block}})
    return {"status": "success"}

@router.post("/coupons", response_model=schemas.Coupon)
def create_coupon(coupon: schemas.CouponBase, current_admin: schemas.User = Depends(auth.get_current_admin), db = Depends(get_db)):
    coupon_dict = coupon.dict()
    coupon_dict["id"] = str(uuid.uuid4())
    db.coupons.insert_one(coupon_dict)
    return schemas.Coupon(**coupon_dict)
