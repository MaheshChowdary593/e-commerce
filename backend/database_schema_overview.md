# E-Commerce Database Schema Overview (MongoDB)

This document provides a logical representation of the database collections and their structures based on the Pydantic schemas and application logic. Note that since this is a MongoDB database, the schema is flexible, but the application expects the following fields.

---

## 1. `login` (Users)
Stores user authentication and profile data.
- **`id`** (string): Unique User UUID.
- **`email`** (string): User's email (unique key).
- **`name`** (string): User's full name.
- **`hashed_password`** (string): Bcrypt hashed password.
- **`role`** (string): User role (`user` or `admin`).
- **`is_blocked`** (boolean): Account status.
- **`created_at`** (datetime): Registration timestamp.

## 2. `products`
Stores product catalog data.
- **`id`** (string): Unique Product UUID.
- **`pid`** (string, optional): External/Import ID.
- **`name`** (string): Product title.
- **`slug`** (string): URL-friendly name.
- **`description`** (string): Full product description.
- **`price`** (float): Current selling price.
- **`original_price`** (float, optional): Price before discount.
- **`discount_percentage`** (int, optional): Calculated discount.
- **`stock`** (int): Available inventory.
- **`image_url`** (string): Primary image link.
- **`images`** (list[string]): Additional image gallery.
- **`category`** (string): Primary category name.
- **`tags`** (list[string]): Searchable keywords.
- **`brand`** (string): Manufacturer name.
- **`rating`** (float): Average user rating.
- **`reviews_count`** (int): Number of reviews.

## 3. `orders`
Stores customer orders and status.
- **`id`** (string): Unique Order UUID.
- **`user_id`** (string): Reference to `login.id`.
- **`email`** (string): Contact email for the order.
- **`total_price`** (float): Final order amount.
- **`status`** (string): `pending`, `paid`, `shipped`, `delivered`, `cancelled`.
- **`shipping_address`** (string): Full delivery address string.
- **`razorpay_order_id`** (string, optional): External payment system ID.
- **`razorpay_payment_id`** (string, optional): Confirmed payment reference.
- **`razorpay_signature`** (string, optional): Verification signature.
- **`created_at`** (datetime): Order placement time.

## 4. `order_items`
Individual items within an order (Normalized for Easier Analytics).
- **`id`** (string): Unique Item UUID.
- **`order_id`** (string): Reference to `orders.id`.
- **`product_id`** (string): Reference to `products.id`.
- **`name`** (string): Name of product at time of purchase.
- **`price`** (float): Price at time of purchase.
- **`quantity`** (int): Number of units.
- **`sku`** (string): Stock Keeping Unit.
- **`image_url`** (string): Thumbnail image.

## 5. `cart`
Active shopping carts for users.
- **`user_id`** (string): Reference to `login.id`.
- **`product_id`** (string): Reference to `products.id`.
- **`name`** (string): Product name.
- **`price`** (float): Product price.
- **`image_url`** (string): Product image.
- **`quantity`** (int): Selected count.
- **`sku`** (string): Product SKU.

## 6. `addresses`
Saved shipping addresses.
- **`id`** (string): Unique Address UUID.
- **`user_id`** (string): Reference to `login.id`.
- **`name`** (string): Label (e.g., "Home", "Office").
- **`details`** (string): Full address text.
- **`isDefault`** (boolean): Flag for primary address.

## 7. `favorites`
User wishlists.
- **`id`** (string): Unique Favorite UUID.
- **`user_id`** (string): Reference to `login.id`.
- **`product_id`** (string): Reference to `products.id`.
- **`created_at`** (datetime): When it was added.

## 8. `search_history`
Analytics for personalization.
- **`user_id`** (string, optional): Reference to `login.id`.
- **`query`** (string): Search term.
- **`timestamp`** (datetime): When searched.

## 9. `newsletters`
Email subscription list.
- **`email`** (string): Unique subscribed email.
- **`joined_at`** (datetime): Subscription date.

## 10. `coupons`
Discount codes.
- **`id`** (string): Unique Coupon UUID.
- **`code`** (string): The actual coupon string (e.g., "SAVE20").
- **`discount_percentage`** (int): Percentage off.
- **`expiry_date`** (datetime): When it expires.
- **`usage_limit`** (int): Max times it can be used total.
- **`used_count`** (int): Current usage count.
- **`is_active`** (boolean): Kill switch for the coupon.
