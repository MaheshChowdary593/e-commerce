import uuid
import schemas

def map_product(p):
    try:
        # Robust price extraction
        def to_float(val, default=0.0):
            try:
                if val is None: return default
                if isinstance(val, (int, float)): return float(val)
                # Handle strings with commas or non-numeric chars
                clean_val = "".join(c for c in str(val) if c.isdigit() or c == '.')
                return float(clean_val) if clean_val else default
            except:
                return default

        original_price = to_float(p.get("actual_price"), to_float(p.get("selling_price", 0)))
        selling_price = to_float(p.get("selling_price", 0))
        discount = 0
        try:
            discount_val = p.get("discount", "0")
            if isinstance(discount_val, str):
                discount = int("".join(c for c in discount_val if c.isdigit()))
            else:
                discount = int(discount_val or 0)
        except:
            pass
        
        # Ensure tags is a list
        tags = p.get("tags", [])
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(",") if t.strip()]
        elif not tags:
            # Extract tags from title and category as fallback
            title_parts = str(p.get("title", "")).lower().split()
            cat_parts = str(p.get("category", "")).lower().split()
            tags = list(set(title_parts + cat_parts))

        # Handle image list
        def upgrade_image(url):
            if isinstance(url, str):
                # Upgrade low-res flixcart images to higher res (800x800)
                return url.replace("/128/128/", "/800/800/").replace("/100/100/", "/800/800/").replace("/200/200/", "/800/800/").replace("/400/400/", "/800/800/")
            return url

        images = p.get("images", [])
        if isinstance(images, list):
            images = [upgrade_image(img) for img in images]
        elif isinstance(images, str):
            images = [upgrade_image(images)]
        else:
            images = []

        image_url = images[0] if images else ""
            
        return schemas.Product(
            id=str(p.get("_id", uuid.uuid4())),
            name=p.get("title", "No Name"),
            slug=p.get("slug", str(p.get("_id", "no-slug"))),
            description=p.get("description", "No Description"),
            price=selling_price,
            original_price=original_price,
            discount_percentage=discount,
            final_price=selling_price,
            stock=p.get("stock", 10),
            image_url=image_url,
            images=images,
            sku=p.get("pid", "N/A"),
            category=p.get("category", "Uncategorized"),
            brand=p.get("brand", "Premium Brand"),
            tags=tags,
            rating=float(p.get("average_rating", p.get("rating", 0)) or 0),
            reviews_count=int(p.get("reviews_count", 0) or 0)
        )
    except Exception as e:
        print(f"Error mapping product {p.get('_id')}: {e}")
        # Return a shell product so the whole list doesn't fail
        return schemas.Product(
            id=str(p.get("_id", uuid.uuid4())),
            name="Error Loading Product",
            slug="error",
            description="",
            price=0.0,
            original_price=0.0,
            discount_percentage=0,
            final_price=0.0,
            stock=0,
            image_url="",
            sku="N/A",
            category="Error",
            tags=[],
            rating=0.0,
            reviews_count=0
        )
