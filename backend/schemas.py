from pydantic import BaseModel, EmailStr
from typing import List, Optional

from decimal import Decimal
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None

class UserBase(BaseModel):
    email: str
    name: Optional[str] = None
    role: str = "user"
    is_blocked: bool = False

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class AddressBase(BaseModel):
    name: str # e.g. Home, Work
    details: str
    isDefault: bool = False

class AddressCreate(AddressBase):
    pass

class Address(AddressBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True

class FavoriteBase(BaseModel):
    product_id: str

class FavoriteCreate(FavoriteBase):
    pass

class Favorite(FavoriteBase):
    id: str
    user_id: str
    created_at: datetime
    # We can optionally include basic product info directly if needed,
    # but the API will just return the full product.
    
    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: str
    image_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class NewsletterSubscribe(BaseModel):
    email: str

class CouponBase(BaseModel):
    code: str
    discount_percentage: int
    expiry_date: datetime
    usage_limit: int
    used_count: int = 0
    is_active: bool = True

class Coupon(CouponBase):
    id: str

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    slug: str
    description: str
    price: float
    original_price: Optional[float] = None
    discount_percentage: Optional[int] = None
    stock: int = 0
    image_url: str
    images: List[str] = []
    sku: str
    category: str
    tags: List[str] = []
    brand: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: str
    rating: float
    reviews_count: int = 0
    final_price: float

    class Config:
        from_attributes = True

class SearchHistory(BaseModel):
    user_id: Optional[str] = None
    query: str
    timestamp: datetime

class RecommendationParams(BaseModel):
    user_id: str
    limit: int = 10

class OrderItemBase(BaseModel):
    product_id: str
    quantity: int
    price: float
    sku: Optional[str] = None
    name: Optional[str] = None
    image_url: Optional[str] = None

class OrderItem(OrderItemBase):
    id: str
    order_id: str

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    total_price: float
    email: str
    shipping_address: str
    user_id: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemBase]

class Order(OrderBase):
    id: str
    status: str
    created_at: datetime
    items: List[OrderItem]
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None

    class Config:
        from_attributes = True

class RazorpayOrderResponse(BaseModel):
    id: str
    amount: int
    currency: str
    receipt: str

class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class CartItem(BaseModel):
    product_id: str
    name: str
    price: float
    image_url: str
    quantity: int
    sku: Optional[str] = None

class CartUpdate(BaseModel):
    product_id: str
    quantity: int

class AdminDashboardStats(BaseModel):
    total_users: int
    total_orders: int
    total_revenue: float
    pending_orders: int
    delivered_orders: int
    low_stock_products: int
    recent_orders: List[Order]

class AnalyticsData(BaseModel):
    sales_over_time: List[dict]
    top_products: List[dict]

class AssistantFilters(BaseModel):
    category: Optional[str] = ""
    price_max: Optional[float] = None
    price_min: Optional[float] = None
    brand: Optional[str] = ""
    color: Optional[str] = ""
    size: Optional[str] = ""

class AssistantAction(BaseModel):
    action: str
    query: Optional[str] = ""
    filters: Optional[AssistantFilters] = None
    product_name: Optional[str] = ""
    index: Optional[int] = None

class AssistantRequest(BaseModel):
    message: str


class NaturalLanguageQueryRequest(BaseModel):
    query: str

class MongoQueryResponse(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[dict] = None
    sort: Optional[str] = None

class AISearchRequest(BaseModel):
    query: str
    user_id: Optional[str] = None

class StructuredQuery(BaseModel):
    query: Optional[str] = ""
    category: Optional[str] = ""
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    brand: Optional[str] = ""
    color: Optional[str] = ""
    size: Optional[str] = ""
    rating_min: Optional[float] = None
    sort_by: Optional[str] = ""
    features: Optional[List[str]] = []
