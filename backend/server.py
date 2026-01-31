from fastapi import FastAPI, APIRouter, UploadFile, File
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone, timedelta
from contextlib import asynccontextmanager
from passlib.context import CryptContext
import jwt
from typing import Optional, Annotated
from fastapi import HTTPException, Depends, Header, Request, Body
import shutil
import requests
from fastapi.responses import StreamingResponse
import io


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # Create uploads directory if it doesn't exist
    uploads_dir = ROOT_DIR / 'uploads'
    uploads_dir.mkdir(exist_ok=True)
    
    # Seed Categories if empty
    cat_count = await db.categories.count_documents({})
    if cat_count == 0:
        initial_categories = [
            { "name": "Electronics", "image": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80", "items": "2.4k+ Products", "link": "/shop?category=Electronics" },
            { "name": "Fashion", "image": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80", "items": "1.8k+ Products", "link": "/shop?category=Fashion" },
            { "name": "Home & Garden", "image": "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&q=80", "items": "950+ Products", "link": "/shop?category=Home" },
            { "name": "Sports", "image": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80", "items": "1.2k+ Products", "link": "/shop?category=Sports" },
            { "name": "Beauty", "image": "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=500&q=80", "items": "800+ Products", "link": "/shop?category=Beauty" },
            { "name": "Books", "image": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=80", "items": "3.5k+ Products", "link": "/shop?category=Books" },
            { "name": "Automotive", "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80", "items": "600+ Products", "link": "/shop?category=Automotive" },
            { "name": "Toys & Games", "image": "https://images.unsplash.com/photo-1558877385-1199c1af4e8e?w=500&q=80", "items": "1.1k+ Products", "link": "/shop?category=Toys" },
            { "name": "Health & Personal Care", "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&q=80", "items": "750+ Products", "link": "/shop?category=Health" },
            { "name": "Grocery", "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80", "items": "2.1k+ Products", "link": "/shop?category=Grocery" },
            { "name": "Pet Supplies", "image": "https://images.unsplash.com/photo-1544568100-847a948585b9?w=500&q=80", "items": "400+ Products", "link": "/shop?category=Pets" },
            { "name": "Jewelry", "image": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80", "items": "900+ Products", "link": "/shop?category=Jewelry" }
        ]
        for cat in initial_categories:
            cat['id'] = str(uuid.uuid4())
            cat['created_at'] = datetime.now(timezone.utc)
            await db.categories.insert_one(cat)

    yield
    # Shutdown
    client.close()

# Create the main app with lifespan
app = FastAPI(lifespan=lifespan)


# Mount static files
app.mount("/uploads", StaticFiles(directory=str(ROOT_DIR / 'uploads')), name="uploads")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Security Constants
SECRET_KEY = os.environ.get("JWT_SECRET", "super-procurement-secret-99")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Rate Limiting In-Memory Store
login_attempts = {}
order_attempts = {}

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class Address(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    addr: str
    type: str = "HOME" # HOME, WORK, OTHER

class CartItem(BaseModel):
    id: str
    name: str
    price: float
    quantity: int
    image: str
    vendor_id: Optional[str] = None
    category: Optional[str] = None
    selected: bool = True

class WishlistItem(BaseModel):
    id: str
    name: str
    price: float
    image: str
    category: Optional[str] = None
    rating: Optional[float] = 5.0

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None  # For logged-in users
    guest_id: Optional[str] = None  # For anonymous users
    items: List[CartItem] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Wishlist(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None  # For logged-in users
    guest_id: Optional[str] = None  # For anonymous users
    items: List[WishlistItem] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ShippingRate(BaseModel):
    zone: str
    cost: float
    min_order_free: float = 1000.0

class PaymentCard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand: str
    last4: str
    exp: str
    type: str = "Credit"

class UPI(BaseModel):
    id: str
    bank: str = "Hook Bank"
    verified: bool = True

class GiftCard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    balance: float
    expiry: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str = ""
    password: str
    gender: str = ""
    dob: str = ""
    address: str = ""
    avatar: str = ""
    banner: str = ""
    logo: str = ""
    business_name: str = ""
    business_category: str = ""
    business_categories: List[str] = []
    owner_name: str = ""
    user_type: str = "user"  # user, admin, vendor
    status: str = "active"   # active, pending, rejected
    rejection_reason: Optional[str] = None
    is_blocked: bool = False
    token_version: int = 1
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    addresses: List[Address] = []
    cart: List[CartItem] = []
    wishlist: List[WishlistItem] = []
    recently_viewed: List[str] = [] # List of product IDs
    saved_cards: List[PaymentCard] = []
    saved_upis: List[UPI] = []
    active_gift_cards: List[GiftCard] = []
    shipping_rates: List[ShippingRate] = [] # For vendors
    delivery_location: str = ""
    recent_searches: List[str] = []

class UserCreate(BaseModel):
    name: str
    email: str
    phone: str = ""
    password: str
    gender: str = ""
    dob: str = ""
    address: str = ""
    business_name: str = ""
    business_category: str = ""
    owner_name: str = ""
    user_type: str = "user"
    delivery_location: str = ""
    recent_searches: List[str] = []

class UserLogin(BaseModel):
    identifier: str  # phone or email
    password: str
    user_type: str = "user"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    address: Optional[str] = None
    avatar: Optional[str] = None
    banner: Optional[str] = None
    business_name: Optional[str] = None
    business_category: Optional[str] = None
    business_categories: Optional[List[str]] = None
    owner_name: Optional[str] = None
    logo: Optional[str] = None
    addresses: Optional[List[Address]] = None
    cart: Optional[List[CartItem]] = None
    wishlist: Optional[List[WishlistItem]] = None
    recently_viewed: Optional[List[str]] = None
    saved_cards: Optional[List[PaymentCard]] = None
    saved_upis: Optional[List[UPI]] = None
    active_gift_cards: Optional[List[GiftCard]] = None
    delivery_location: Optional[str] = None
    recent_searches: Optional[List[str]] = None

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    sub_category: str = ""
    brand: str = ""
    price: float
    originalPrice: Optional[float] = None
    discount: int = 0
    stock: int
    image: str # Featured image
    images: List[str] = [] # Additional images
    description: str = ""
    highlights: List[str] = [] # Bullet points
    specifications: Optional[dict] = {} # Technical specs
    warranty: str = ""
    box_contents: str = ""
    colors: List[str] = []
    weight: str = ""
    dimensions: str = ""
    material: str = ""
    base_price: float = 0.0
    normal_discount_type: str = "percentage"  # percentage, fixed
    normal_discount_value: float = 0.0
    special_offer_enabled: bool = False
    special_offer_type: str = "percentage"  # percentage, fixed
    special_offer_value: float = 0.0
    special_offer_start: Optional[datetime] = None
    special_offer_end: Optional[datetime] = None
    vendor_id: str
    offers: str = ""
    offer_expires_at: Optional[datetime] = None
    delivery_type: str = "free"  # free, fixed, weight, distance
    delivery_charge: float = 0
    free_delivery_above: float = 0
    search_tags: List[str] = []
    return_policy: str = "7-day easy replacement/return"
    status: str = "approved" # pending, approved, rejected
    rejection_reason: Optional[str] = None
    sales_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    category: str
    sub_category: str = ""
    brand: str = ""
    base_price: float
    normal_discount_type: str = "percentage"
    normal_discount_value: float = 0.0
    special_offer_enabled: bool = False
    special_offer_type: str = "percentage"
    special_offer_value: float = 0.0
    special_offer_start: Optional[datetime] = None
    special_offer_end: Optional[datetime] = None
    price: float = 0.0
    discount: int = 0
    stock: int
    image: str
    images: List[str] = []
    description: str = ""
    highlights: List[str] = []
    specifications: Optional[dict] = {}
    warranty: str = ""
    box_contents: str = ""
    colors: List[str] = []
    weight: str = ""
    dimensions: str = ""
    material: str = ""
    offers: str = ""
    offer_expires_at: Optional[datetime] = None
    delivery_type: str = "free"  # free, fixed, weight, distance
    delivery_charge: float = 0
    free_delivery_above: float = 0
    search_tags: List[str] = []
    return_policy: str = "7-day easy replacement/return"

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str = "info" # info, success, warning, error
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    image: str
    items: str = "0 Products"
    link: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image: str
    vendor_id: str
    status: str = "processing" # processing, shipped, delivered, cancelled

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    customer_name: str
    email: str
    phone: str = ""
    address: str
    payment_method: str = "card"
    items: List[OrderItem]
    total_amount: float
    coupon_code: Optional[str] = None
    discount_amount: float = 0
    status: str = "processing"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # Food delivery fields
    delivery_date: Optional[datetime] = None
    delivery_time_slot: Optional[str] = None  # e.g., "9AM-11AM", "2PM-4PM"
    tracking_number: Optional[str] = None
    delivery_status: str = "pending"  # pending, scheduled, out_for_delivery, delivered
    delivery_notes: Optional[str] = None

class OrderCreate(BaseModel):
    customer_name: str
    email: str
    phone: str = ""
    address: str
    payment_method: str = "card"
    items: List[OrderItem]
    total_amount: float
    coupon_code: Optional[str] = None
    discount_amount: float = 0
    # Food delivery fields
    delivery_date: Optional[datetime] = None
    delivery_time_slot: Optional[str] = None
    delivery_notes: Optional[str] = None

class DeliveryUpdate(BaseModel):
    delivery_date: Optional[datetime] = None
    delivery_time_slot: Optional[str] = None
    tracking_number: Optional[str] = None
    delivery_status: str = "pending"
    delivery_notes: Optional[str] = None

class Withdrawal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_id: str
    amount: float
    method: str = "Bank Transfer"
    bank_details: Optional[dict] = None
    status: str = "pending" # pending, completed, rejected
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WithdrawalCreate(BaseModel):
    amount: float
    method: str = "Bank Transfer"
    bank_details: Optional[dict] = None

class Ticket(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_id: str
    subject: str
    order_id: Optional[str] = None
    message: str
    status: str = "open" # open, responding, resolved
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TicketCreate(BaseModel):
    subject: str
    order_id: Optional[str] = None
    message: str

class Coupon(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_id: str
    code: str
    discount: str  # e.g., "10%" or "₹100"
    limit: int  # usage limit
    usage: int = 0  # current usage
    expires: str  # e.g., "2024-12-31"
    status: str = "active"  # active, inactive
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CouponCreate(BaseModel):
    code: str
    discount: str
    limit: int
    expires: str

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: Optional[str] = None
    rating: int  # 1-5
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NewsletterSubscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NewsletterCreate(BaseModel):
    email: str

# Add your routes to the router instead of directly to app

# Dependency for Protected Routes
async def get_current_user(authorization: Annotated[Optional[str], Header()] = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing.")

    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        version: int = payload.get("version")

        # Verify user in DB and check block status/version
        user = await db.users.find_one({"id": user_id}) or await db.vendors.find_one({"id": user_id})

        if not user:
            raise HTTPException(status_code=401, detail="Invalid identity.")

        if user.get('is_blocked', False):
            raise HTTPException(status_code=403, detail="Account suspended.")

        if user.get('token_version', 1) != version:
            raise HTTPException(status_code=401, detail="Session expired. Re-authentication required.")

        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Session protocol corrupted.")

@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks(current_user: Annotated[dict, Depends(get_current_user)]):
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)

    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])

    return status_checks

# User endpoints
@api_router.post("/users/signup", response_model=User)
async def signup_user(user_data: UserCreate):
    # Determine collection based on user_type
    collection = db.vendors if user_data.user_type == "vendor" else db.users

    # Check if user already exists
    existing_user = await collection.find_one({
        "$or": [
            {"email": user_data.email},
            {"phone": user_data.phone}
        ]
    })

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    user_dict = user_data.model_dump()
    user_dict['password'] = get_password_hash(user_dict['password'])
    
    # Vendors start as pending
    if user_data.user_type == "vendor":
        user_dict['status'] = "pending"
    else:
        user_dict['status'] = "active"
        
    user_obj = User(**user_dict)

    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()

    result = await collection.insert_one(doc)
    doc['_id'] = result.inserted_id
    
    # Generate Token
    token = create_access_token({"sub": user_obj.id, "user_type": user_obj.user_type, "version": user_obj.token_version})

    return {**User(**doc).model_dump(), "token": token}

@api_router.post("/users/login")
async def login_user(login_data: UserLogin, request: Request):
    # Rate Limiting Logic
    client_ip = request.client.host
    now = datetime.now(timezone.utc)
    
    if client_ip in login_attempts:
        last_attempt, count = login_attempts[client_ip]
        if (now - last_attempt).total_seconds() < 60: # 1 minute window
            if count >= 5:
                raise HTTPException(status_code=429, detail="Too many connection attempts. Cooldown protocol active.")
            login_attempts[client_ip] = (last_attempt, count + 1)
        else:
            login_attempts[client_ip] = (now, 1)
    else:
        login_attempts[client_ip] = (now, 1)

    # Determine collection based on user_type
    collection = db.vendors if login_data.user_type == "vendor" else db.users

    # Find user by email or phone
    user = await collection.find_one({
        "$or": [
            {"email": login_data.identifier},
            {"phone": login_data.identifier}
        ]
    })

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(login_data.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials protocol.")

    if user.get('is_blocked', False):
        raise HTTPException(status_code=403, detail="Account access suspended. Contact compliance.")

    # Check vendor status
    if login_data.user_type == "vendor":
        if user.get('status') == "pending":
            raise HTTPException(status_code=403, detail="Vendor account is pending administrative approval.")
        if user.get('status') == "rejected":
            raise HTTPException(status_code=403, detail=f"Vendor account rejected: {user.get('rejection_reason', 'Compliance failure')}")

    # Generate Token
    token = create_access_token({
        "sub": user['id'], 
        "user_type": user['user_type'], 
        "version": user.get('token_version', 1)
    })

    # Return user data with token, without password
    user_data = {k: v for k, v in user.items() if k != 'password' and k != '_id'}
    return {**user_data, "token": token}




@api_router.put("/vendor/profile")
async def update_vendor_profile(profile_data: UserUpdate, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Only vendors can update profile via this endpoint")
        
    update_data = profile_data.model_dump(exclude_unset=True)
    if not update_data:
        return {"message": "No changes provided"}

    await db.vendors.update_one({"id": current_user['id']}, {"$set": update_data})
    return {"message": "Vendor profile updated"}


# Admin Moderation Endpoints
@api_router.post("/admin/moderation/block/{user_id}")
async def block_entity(user_id: str, current_admin: Annotated[dict, Depends(get_current_user)]):
    if current_admin['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Unauthorized.")
        
    await db.users.update_one({"id": user_id}, {"$set": {"is_blocked": True, "token_version": datetime.now().timestamp()}})
    await db.vendors.update_one({"id": user_id}, {"$set": {"is_blocked": True, "token_version": datetime.now().timestamp()}})
    
    return {"message": "Entity blocked from global network."}

@api_router.post("/admin/moderation/unblock/{user_id}")
async def unblock_entity(user_id: str, current_admin: Annotated[dict, Depends(get_current_user)]):
    if current_admin['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Unauthorized.")
        
    await db.users.update_one({"id": user_id}, {"$set": {"is_blocked": False}})
    await db.vendors.update_one({"id": user_id}, {"$set": {"is_blocked": False}})
    
    return {"message": "Entity re-synchronized with global network."}

@api_router.post("/admin/moderation/force-logout/{user_id}")
async def force_logout(user_id: str, current_admin: Annotated[dict, Depends(get_current_user)]):
    if current_admin['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Unauthorized.")
        
    new_version = int(datetime.now().timestamp())
    await db.users.update_one({"id": user_id}, {"$set": {"token_version": new_version}})
    await db.vendors.update_one({"id": user_id}, {"$set": {"token_version": new_version}})
    
    return {"message": "Sessions terminated. Entity must re-authenticate."}

@api_router.get("/users/sync")
async def sync_user(current_user: Annotated[dict, Depends(get_current_user)]):
    # current_user is already fetched from get_current_user, but we want the freshest data
    collection = db.vendors if current_user['user_type'] == 'vendor' else db.users
    user = await collection.find_one({"id": current_user['id']}, {"_id": 0, "password": 0})
    return user

@api_router.put("/users/cart")
async def update_cart(cart: List[CartItem], current_user: Annotated[dict, Depends(get_current_user)]):
    collection = db.vendors if current_user['user_type'] == 'vendor' else db.users
    cart_data = [item.model_dump() for item in cart]
    await collection.update_one({"id": current_user['id']}, {"$set": {"cart": cart_data}})
    return {"message": "Cart synchronized"}

@api_router.post("/users/cart/items")
async def add_to_cart(item: CartItem, current_user: Annotated[dict, Depends(get_current_user)]):
    collection = db.vendors if current_user['user_type'] == 'vendor' else db.users
    
    # Attempt to update quantity if item with same ID exists
    result = await collection.update_one(
        {"id": current_user['id'], "cart.id": item.id},
        {"$inc": {"cart.$.quantity": item.quantity}}
    )
    
    if result.matched_count == 0:
        # Item not in cart, push it
        await collection.update_one(
            {"id": current_user['id']},
            {"$push": {"cart": item.model_dump()}}
        )
        
    return {"message": "Item added to cart", "item": item}

@api_router.delete("/users/cart/items/{item_id}")
async def remove_from_cart(item_id: str, current_user: Annotated[dict, Depends(get_current_user)]):
    collection = db.vendors if current_user['user_type'] == 'vendor' else db.users
    
    await collection.update_one(
        {"id": current_user['id']},
        {"$pull": {"cart": {"id": item_id}}}
    )
    
    return {"message": "Item removed from cart"}

@api_router.put("/users/wishlist")
async def update_wishlist(wishlist: List[WishlistItem], current_user: Annotated[dict, Depends(get_current_user)]):
    collection = db.vendors if current_user['user_type'] == 'vendor' else db.users
    wishlist_data = [item.model_dump() for item in wishlist]
    await collection.update_one({"id": current_user['id']}, {"$set": {"wishlist": wishlist_data}})
    return {"message": "Wishlist synchronized"}

@api_router.post("/users/wishlist/items")
async def add_to_wishlist(item: WishlistItem, current_user: Annotated[dict, Depends(get_current_user)]):
    collection = db.vendors if current_user['user_type'] == 'vendor' else db.users
    
    # Attempt to update item if it exists (e.g. update price/image)
    result = await collection.update_one(
        {"id": current_user['id'], "wishlist.id": item.id},
        {"$set": {"wishlist.$": item.model_dump()}}
    )
    
    if result.matched_count == 0:
        # Item not in wishlist, push it
        await collection.update_one(
            {"id": current_user['id']},
            {"$push": {"wishlist": item.model_dump()}}
        )
        
    return {"message": "Item added to wishlist", "item": item}

@api_router.delete("/users/wishlist/items/{item_id}")
async def remove_from_wishlist(item_id: str, current_user: Annotated[dict, Depends(get_current_user)]):
    collection = db.vendors if current_user['user_type'] == 'vendor' else db.users
    
    await collection.update_one(
        {"id": current_user['id']},
        {"$pull": {"wishlist": {"id": item_id}}}
    )
    
    return {"message": "Item removed from wishlist"}

@api_router.put("/users/recently-viewed")
async def update_recently_viewed(product_ids: List[str], current_user: Annotated[dict, Depends(get_current_user)]):
    print(f"DEBUG: update_recently_viewed called with: {product_ids} for user {current_user['id']}")
    collection = db.vendors if current_user['user_type'] == 'vendor' else db.users
    # Keep only last 20 items
    product_ids = product_ids[:20]
    result = await collection.update_one({"id": current_user['id']}, {"$set": {"recently_viewed": product_ids}})
    print(f"DEBUG: update matched: {result.matched_count}, modified: {result.modified_count}")
    return {"message": "Recently viewed history updated"}

@api_router.get("/users/recently-viewed")
async def get_recently_viewed(current_user: Annotated[dict, Depends(get_current_user)]):
    collection = db.vendors if current_user['user_type'] == 'vendor' else db.users
    user = await collection.find_one({"id": current_user['id']}, {"recently_viewed": 1})
    product_ids = user.get('recently_viewed', [])
    
    if not product_ids:
        return []
        
    # Fetch actual product details
    products_cursor = db.products.find({"id": {"$in": product_ids}})
    products = await products_cursor.to_list(None)
    
    # Sort products based on the order in product_ids (recent first)
    products_map = {p['id']: p for p in products}
    ordered_products = []
    for p_id in product_ids:
        if p_id in products_map:
            p = products_map[p_id]
            p['id'] = p.get('id') or str(p['_id'])
            if '_id' in p: del p['_id']
            ordered_products.append(p)
            
    return ordered_products

@api_router.put("/users/recent-searches")
async def update_recent_searches(searches: List[str], current_user: Annotated[dict, Depends(get_current_user)]):
    collection = db.vendors if current_user['user_type'] == 'vendor' else db.users
    # Keep only last 10 searches
    searches = searches[:10]
    await collection.update_one({"id": current_user['id']}, {"$set": {"recent_searches": searches}})
    return {"message": "Recent searches updated"}

@api_router.get("/users/recent-searches")
async def get_recent_searches(current_user: Annotated[dict, Depends(get_current_user)]):
    collection = db.vendors if current_user['user_type'] == 'vendor' else db.users
    user = await collection.find_one({"id": current_user['id']}, {"recent_searches": 1})
    return user.get('recent_searches', [])

@api_router.put("/users/delivery-location")
async def update_delivery_location(current_user: Annotated[dict, Depends(get_current_user)], delivery_location: str = Body(..., embed=True)):
    collection = db.vendors if current_user['user_type'] == 'vendor' else db.users
    await collection.update_one({"id": current_user['id']}, {"$set": {"delivery_location": delivery_location}})
    return {"message": "Delivery location updated"}

@api_router.post("/orders/checkout")
async def checkout(order_data: OrderCreate, request: Request, current_user: Annotated[dict, Depends(get_current_user)]):
    # Rate Limiting Logic for Checkout (max 3 per minute)
    client_ip = request.client.host
    now = datetime.now(timezone.utc)

    if client_ip in order_attempts:
        last_attempt, count = order_attempts[client_ip]
        if (now - last_attempt).total_seconds() < 60:
            if count >= 3:
                raise HTTPException(status_code=429, detail="Transaction limit exceeded. Deceleration protocol active.")
            order_attempts[client_ip] = (last_attempt, count + 1)
        else:
            order_attempts[client_ip] = (now, 1)
    else:
        order_attempts[client_ip] = (now, 1)

    # Validate and apply coupon if provided
    coupon = None
    if order_data.coupon_code:
        coupon = await db.coupons.find_one({
            "code": order_data.coupon_code.upper(),
            "status": "active",
            "expires": {"$gte": datetime.now(timezone.utc).strftime("%Y-%m-%d")}
        })

        if not coupon:
            raise HTTPException(status_code=400, detail="Invalid or expired coupon code.")

        # Check usage limit
        if coupon.get('usage', 0) >= coupon.get('limit', 0):
            raise HTTPException(status_code=400, detail="Coupon usage limit exceeded.")

    order_obj = Order(
        **order_data.model_dump(),
        user_id=current_user['id']
    )

    doc = order_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()

    await db.orders.insert_one(doc)

    # Increment coupon usage if coupon was applied
    if coupon:
        await db.coupons.update_one(
            {"id": coupon['id']},
            {"$inc": {"usage": 1}}
        )

    # Increment product sales count
    for item in order_data.items:
        await db.products.update_one(
            {"id": item.product_id},
            {"$inc": {"sales_count": item.quantity}}
        )

    # Trigger Notifications for order placement
    # Notify User
    await db.notifications.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user['id'],
        "title": "Order Protocol Authenticated",
        "message": f"Your transaction {order_obj.id} has been synchronized with the global ledger.",
        "type": "success",
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    # Update product sales count for deals tracking
    for item in order_data.items:
        await db.products.update_one(
            {"id": item.product_id},
            {"$inc": {"sales_count": item.quantity}}
        )
    
    # Notify Vendors
    vendor_ids = {item.vendor_id for item in order_obj.items}
    for v_id in vendor_ids:
        await db.notifications.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": v_id,
            "title": "New Sales Protocol",
            "message": f"A new order {order_obj.id} has been received for your inventory.",
            "type": "info",
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {"message": "Transaction authorized.", "order_id": order_obj.id}

@api_router.post("/newsletter/subscribe")
async def subscribe_newsletter(data: NewsletterCreate):
    # Check if email is already subscribed
    existing = await db.newsletter_subscriptions.find_one({"email": data.email.lower()})
    if existing:
        return {"message": "You are already a part of our ecosystem."}
    
    sub_obj = NewsletterSubscription(email=data.email.lower())
    doc = sub_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.newsletter_subscriptions.insert_one(doc)
    return {"message": "Successfully synchronized with our newsletter protocol."}

# --- Product Endpoints ---

@api_router.post("/products")
async def add_product(product_data: ProductCreate, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Merchant clearance required.")

    product_obj = Product(**product_data.model_dump(), vendor_id=current_user['id'], status="pending")
    doc = product_obj.model_dump()
    
    # Automated Pricing & Discount Protocol
    base = doc.get('base_price', 0.0)
    current = base
    
    # Apply Normal Discount
    n_type = doc.get('normal_discount_type', 'percentage')
    n_val = doc.get('normal_discount_value', 0.0)
    if n_type == "percentage":
        current -= (base * (n_val / 100))
    else:
        current -= n_val
        
    # Apply Special Offer if enabled
    if doc.get('special_offer_enabled'):
        s_type = doc.get('special_offer_type', 'percentage')
        s_val = doc.get('special_offer_value', 0.0)
        if s_type == "percentage":
            current -= (current * (s_val / 100))
        else:
            current -= s_val
            
    final_price = max(0.0, round(current, 2))
    doc['price'] = final_price
    doc['originalPrice'] = base
    
    if base > 0:
        doc['discount'] = int(round(((base - final_price) / base) * 100))
    else:
        doc['discount'] = 0
        
    doc['created_at'] = doc['created_at'].isoformat()

    await db.products.insert_one(doc)
    
    # Notify Admins of new pending product
    admins = await db.users.find({"user_type": "admin"}).to_list(None)
    for admin in admins:
        await db.notifications.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": admin['id'],
            "title": "New Inventory Pending",
            "message": f"Product '{product_obj.name}' requires administrative auditing.",
            "type": "warning",
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
    return {"message": "Inventory queued for auditing.", "product_id": product_obj.id}

@api_router.get("/products")
async def list_public_products(
    limit: int = 100, 
    sort: str = "newest", 
    category: Optional[str] = None,
    only_deals: bool = False
):
    # Base filter: only show approved products
    query = {"status": "approved"}
    if category:
        query["category"] = category
    if only_deals:
        query["special_offer_enabled"] = True
        
    products_cursor = db.products.find(query)
    
    # Apply sorting
    if sort == "trending":
        # Trending = High sales + New arrival (weighted)
        products_cursor = products_cursor.sort([("sales_count", -1), ("created_at", -1)])
    elif sort == "newest":
        products_cursor = products_cursor.sort("created_at", -1)
    elif sort == "price_low":
        products_cursor = products_cursor.sort("price", 1)
    elif sort == "price_high":
        products_cursor = products_cursor.sort("price", -1)
        
    # Apply limit
    products_cursor = products_cursor.limit(limit)
    
    products = []
    async for p in products_cursor:
        p_id = p.get('id') or str(p['_id'])
        p['id'] = p_id
        if '_id' in p: del p['_id']

        # Robust vendor lookup
        vendor_id = p.get('vendor_id')
        v_name = "Unknown Vendor"
        v_real_id = vendor_id
        v_rating = 0
        v_rev_count = 0
        vendor = None
        
        if vendor_id:
            # 1. Try string 'id' in vendors
            vendor = await db.vendors.find_one({"id": str(vendor_id)})
            if not vendor:
                vendor = await db.users.find_one({"id": str(vendor_id)})
            
            # 2. Try ObjectId check
            if not vendor:
                from bson import ObjectId
                try:
                    obj_id = ObjectId(vendor_id)
                    vendor = await db.vendors.find_one({"_id": obj_id}) or await db.users.find_one({"_id": obj_id})
                except:
                    pass
            
            if vendor:
                v_real_id = vendor.get('id') or str(vendor.get('_id'))
                v_name = vendor.get('business_name') or vendor.get('name') or vendor.get('owner_name') or "Unknown Vendor"
                
                # Calculate overall business rating for this vendor
                vendor_products_cursor = db.products.find({"vendor_id": v_real_id}, {"id": 1})
                v_product_ids = [p['id'] async for p in vendor_products_cursor]
                
                v_rating = 0
                v_rev_count = 0
                if v_product_ids:
                    v_reviews_cursor = db.reviews.find({"product_id": {"$in": v_product_ids}})
                    v_reviews = await v_reviews_cursor.to_list(None)
                    if v_reviews:
                        v_rev_count = len(v_reviews)
                        v_rating = round(sum(r.get('rating', 0) for r in v_reviews) / v_rev_count, 1)

        p['vendor_name'] = v_name
        p['vendor'] = {
            "business_name": v_name,
            "business_id": v_real_id if vendor else vendor_id, # Use v_real_id if vendor object was found, otherwise fallback to original vendor_id
            "business_rating": v_rating or vendor.get('business_rating', 0) if vendor else 0,
            "business_reviews_count": v_rev_count,
            "shipping_rates": vendor.get('shipping_rates', []) if vendor else []
        }

        # Calculate product rating
        reviews_cursor_p = db.reviews.find({"product_id": p['id']})
        reviews_p = await reviews_cursor_p.to_list(None)
        if reviews_p:
            total_rating = sum(r.get('rating', 0) for r in reviews_p)
            p['rating'] = round(total_rating / len(reviews_p), 1)
            p['reviews'] = len(reviews_p)
            p['reviewsCount'] = len(reviews_p)
        else:
            p['rating'] = 0
            p['reviews'] = 0
            p['reviewsCount'] = 0

        products.append(p)
    return products

@api_router.get("/coupons/validate/{code}")
async def validate_coupon(code: str):
    # Find active coupon by code
    coupon = await db.coupons.find_one({
        "code": code.upper(),
        "status": "active",
        "expires": {"$gte": datetime.now(timezone.utc).strftime("%Y-%m-%d")}
    })

    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid or expired coupon code.")

    # Check usage limit
    if coupon.get('usage', 0) >= coupon.get('limit', 0):
        raise HTTPException(status_code=400, detail="Coupon usage limit exceeded.")

    coupon['id'] = str(coupon.get('id') or coupon['_id'])
    if '_id' in coupon: del coupon['_id']

    return coupon

@api_router.get("/vendor/products")
async def list_vendor_products(current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Unauthorized.")
    products_cursor = db.products.find({"vendor_id": current_user['id']})
    products = []
    async for p in products_cursor:
        p_id = p.get('id') or str(p['_id'])
        p['id'] = p_id
        if '_id' in p: del p['_id']
        products.append(p)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    # Try custom id first, then _id
    product = await db.products.find_one({"id": product_id})
    if not product:
        from bson import ObjectId
        try:
            product = await db.products.find_one({"_id": ObjectId(product_id)})
        except:
            pass
            
    if not product:
        raise HTTPException(status_code=404, detail="Inventory entity not found on the grid.")
    
    product['id'] = product.get('id') or str(product['_id'])
    if '_id' in product: del product['_id']

    # Robust vendor lookup
    vendor_id = product.get('vendor_id')
    vendor_data = {"business_name": "Unknown Vendor", "business_id": vendor_id, "business_rating": 0}
    
    if vendor_id:
        # 1. Try string 'id' in vendors
        vendor = await db.vendors.find_one({"id": str(vendor_id)})
        # 2. Try string 'id' in users (some vendors might be there)
        if not vendor:
            vendor = await db.users.find_one({"id": str(vendor_id)})
        # 3. Try _id if it's potentially an ObjectId
        if not vendor:
            from bson import ObjectId
            try:
                obj_id = ObjectId(vendor_id)
                vendor = await db.vendors.find_one({"_id": obj_id}) or await db.users.find_one({"_id": obj_id})
            except:
                pass
        
        if vendor:
            v_real_id = vendor.get('id') or str(vendor.get('_id'))
            v_name = vendor.get('business_name') or vendor.get('name') or vendor.get('owner_name') or "Unknown Vendor"
            
            # Calculate overall business rating for this vendor
            # 1. Get all product IDs for this vendor
            vendor_products_cursor = db.products.find({"vendor_id": v_real_id}, {"id": 1})
            v_product_ids = [p['id'] async for p in vendor_products_cursor]
            
            # 2. Get all reviews for these products
            v_rating = 0
            if v_product_ids:
                v_reviews_cursor = db.reviews.find({"product_id": {"$in": v_product_ids}})
                v_reviews = await v_reviews_cursor.to_list(None)
                if v_reviews:
                    v_rating = round(sum(r.get('rating', 0) for r in v_reviews) / len(v_reviews), 1)
            
            vendor_data = {
                "business_name": v_name,
                "business_id": v_real_id,
                "business_rating": v_rating or vendor.get('business_rating', 0),
                "business_reviews_count": len(v_reviews) if v_product_ids and v_reviews else 0,
                "shipping_rates": vendor.get('shipping_rates', [])
            }
            product['vendor_name'] = v_name
        else:
            product['vendor_name'] = "Unknown Vendor"

    product['vendor'] = vendor_data

    # Add reviews information
    reviews_cursor = db.reviews.find({"product_id": product['id']})
    reviews = []
    total_rating = 0
    async for r in reviews_cursor:
        if '_id' in r: del r['_id']
        # Get reviewer name
        reviewer = await db.users.find_one({"id": r.get('user_id')}) or await db.vendors.find_one({"id": r.get('user_id')})
        if reviewer:
            r['user_name'] = reviewer.get('name') or reviewer.get('business_name') or "Customer"
        else:
            r['user_name'] = "Customer"
        
        reviews.append(r)
        total_rating += r.get('rating', 0)
    
    product['reviews'] = reviews
    product['rating'] = round(total_rating / len(reviews), 1) if reviews else 0
    product['reviews_count'] = len(reviews)

    return product

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product_data: ProductCreate, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Merchant clearance required.")
    
    # Try custom id first, then _id
    query = {"id": product_id, "vendor_id": current_user['id']}
    existing_product = await db.products.find_one(query)
    
    if not existing_product:
        from bson import ObjectId
        try:
            query = {"_id": ObjectId(product_id), "vendor_id": current_user['id']}
            existing_product = await db.products.find_one(query)
        except:
            pass
            
    if not existing_product:
        raise HTTPException(status_code=404, detail="Inventory entity not found or access restricted.")
    
    update_doc = product_data.model_dump()
    update_doc['status'] = 'pending'

    # Automated Pricing & Discount Protocol
    base = update_doc.get('base_price', 0.0)
    current = base
    
    # Apply Normal Discount
    n_type = update_doc.get('normal_discount_type', 'percentage')
    n_val = update_doc.get('normal_discount_value', 0.0)
    if n_type == "percentage":
        current -= (base * (n_val / 100))
    else:
        current -= n_val
        
    # Apply Special Offer if enabled
    if update_doc.get('special_offer_enabled'):
        s_type = update_doc.get('special_offer_type', 'percentage')
        s_val = update_doc.get('special_offer_value', 0.0)
        if s_type == "percentage":
            current -= (current * (s_val / 100))
        else:
            current -= s_val
            
    final_price = max(0.0, round(current, 2))
    update_doc['price'] = final_price
    update_doc['originalPrice'] = base
    
    if base > 0:
        update_doc['discount'] = int(round(((base - final_price) / base) * 100))
    else:
        update_doc['discount'] = 0
    
    # Ensure current ID stays the same
    if existing_product.get('id'):
        update_doc['id'] = existing_product['id']
    
    await db.products.update_one(query, {"$set": update_doc})
    # Notify Admins of product update
    admins = await db.users.find({"user_type": "admin"}).to_list(None)
    for admin in admins:
        await db.notifications.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": admin['id'],
            "title": "Inventory Update Pending",
            "message": f"Product '{product_data.name}' has been updated and requires re-auditing.",
            "type": "warning",
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    return {"message": "Inventory updated and queued for re-auditing."}

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Merchant clearance required.")
    
    # Try custom id first
    result = await db.products.delete_one({"id": product_id, "vendor_id": current_user['id']})
    
    if result.deleted_count == 0:
        from bson import ObjectId
        try:
            result = await db.products.delete_one({"_id": ObjectId(product_id), "vendor_id": current_user['id']})
        except:
            pass
            
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Inventory entity not found or access restricted.")
    
    return {"message": "Inventory successfully decommissioned."}

@api_router.get("/admin/products/pending")
async def list_pending_products(current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Security clearance insufficient.")
    products = await db.products.find({"status": "pending"}, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/admin/products/all")
async def list_all_products(current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Security clearance insufficient.")
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    return products

@api_router.post("/admin/products/approve/{product_id}")
async def approve_product(product_id: str, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Unauthorized.")
        
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Entity not found.")
        
    await db.products.update_one({"id": product_id}, {"$set": {"status": "approved"}})
    
    # Notify Vendor
    await db.notifications.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": product['vendor_id'],
        "title": "Inventory Authorized",
        "message": f"Your product '{product['name']}' has been synchronized with the live network.",
        "type": "success",
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Inventory successfully authorized."}

@api_router.get("/admin/vendors/pending")
async def get_pending_vendors(current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Unauthorized.")
    vendors = await db.vendors.find({"status": "pending"}, {"_id": 0, "password": 0}).to_list(100)
    return vendors

@api_router.post("/admin/vendors/approve/{vendor_id}")
async def approve_vendor(vendor_id: str, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Unauthorized.")
    
    await db.vendors.update_one({"id": vendor_id}, {"$set": {"status": "active"}})
    
    # Notify Vendor
    await db.notifications.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": vendor_id,
        "title": "Vendor Account Approved",
        "message": "Protocol complete. Your vendor account has been authorized for live operations.",
        "type": "success",
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"message": "Vendor approved."}

@api_router.post("/admin/vendors/reject/{vendor_id}")
async def reject_vendor(vendor_id: str, data: dict, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Unauthorized.")
    
    reason = data.get('reason', "Compliance failure.")
    await db.vendors.update_one({"id": vendor_id}, {"$set": {"status": "rejected", "rejection_reason": reason}})
    return {"message": "Vendor rejected."}

@api_router.post("/vendor/shipping-rates")
async def update_shipping_rates(rates: List[ShippingRate], current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Unauthorized.")
    
    rates_dict = [r.model_dump() for r in rates]
    await db.vendors.update_one({"id": current_user['id']}, {"$set": {"shipping_rates": rates_dict}})
    return {"message": "Logistical protocols updated."}

@api_router.post("/upload/image")
async def upload_image(current_user: Annotated[dict, Depends(get_current_user)], file: UploadFile = File(...)):
    # if current_user['user_type'] != 'vendor':
    #     raise HTTPException(status_code=403, detail="Merchant clearance required.")

    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Only image files are allowed.")

    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{current_user['id']}_{uuid.uuid4()}.{file_extension}"
    file_path = ROOT_DIR / 'uploads' / unique_filename

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Return the URL
    base_url = os.environ.get('BACKEND_URL', 'http://localhost:8000')
    image_url = f"{base_url}/uploads/{unique_filename}"
    return {"image_url": image_url}

@api_router.get("/proxy-image")
async def proxy_image(url: str):
    """
    Proxy external images to avoid CORS and mixed content issues
    """
    try:
        # Validate URL to prevent abuse
        if not url.startswith(('http://', 'https://')):
            raise HTTPException(status_code=400, detail="Invalid URL")

        # Only allow certain domains for security (expanded list for e-commerce)
        allowed_domains = [
            'm.media-amazon.com',
            'images-na.ssl-images-amazon.com',
            'images-eu.ssl-images-amazon.com',
            'localhost',
            '127.0.0.1',
            'www.yummytummyaarthi.com',
            'encrypted-tbn0.gstatic.com',
            'images.unsplash.com',
            'picsum.photos',
            'via.placeholder.com',
            'rukminim1.flixcart.com',
            'rukminim2.flixcart.com',
            'assets.myntassets.com',
            'images.meesho.com',
            'img.freepik.com',
            'cdn.shopify.com',
            'i.imgur.com',
            'lh3.googleusercontent.com',
            'res.cloudinary.com',
            'images.pexels.com',
            'img.icons8.com'
        ]
        from urllib.parse import urlparse
        parsed_url = urlparse(url)
        # Allow any domain for now to prevent image loading issues
        # In production, you may want to restrict this
        if parsed_url.netloc not in allowed_domains:
            # Log warning but still try to fetch (or you can raise HTTPException)
            print(f"Warning: Proxying image from unlisted domain: {parsed_url.netloc}")

        # Fetch the image
        response = requests.get(url, timeout=10, stream=True)
        response.raise_for_status()

        # Return the image with appropriate headers
        return StreamingResponse(
            io.BytesIO(response.content),
            media_type=response.headers.get('content-type', 'image/jpeg'),
            headers={
                'Cache-Control': 'public, max-age=3600',  # Cache for 1 hour
                'Access-Control-Allow-Origin': '*'
            }
        )
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch image: {str(e)}")

@api_router.post("/admin/products/reject/{product_id}")
async def reject_product(product_id: str, reason: dict, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Unauthorized.")
        
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Entity not found.")
        
    rejection_reason = reason.get("reason", "Incomplete compliance.")
    await db.products.update_one({"id": product_id}, {"$set": {"status": "rejected", "rejection_reason": rejection_reason}})
    
    # Notify Vendor
    await db.notifications.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": product['vendor_id'],
        "title": "Inventory Rejected",
        "message": f"Your product '{product['name']}' failed compliance. Reason: {rejection_reason}",
        "type": "error",
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Inventory rejected for non-compliance."}

@api_router.get("/vendor/orders")
async def get_vendor_orders(current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Unauthorized.")

    orders_cursor = db.orders.find({"items.vendor_id": current_user['id']})
    orders = []
    async for o in orders_cursor:
        o['id'] = o.get('id') or str(o['_id'])
        if '_id' in o: del o['_id']
        orders.append(o)
    return orders

@api_router.put("/vendor/orders/{order_id}/delivery")
async def update_order_delivery(order_id: str, delivery_data: DeliveryUpdate, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Unauthorized.")

    # Check if order exists and belongs to vendor
    order = await db.orders.find_one({"id": order_id, "items.vendor_id": current_user['id']})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found or not authorized.")

    # Update delivery fields
    update_data = {}
    if delivery_data.delivery_date is not None:
        update_data['delivery_date'] = delivery_data.delivery_date
    if delivery_data.delivery_time_slot is not None:
        update_data['delivery_time_slot'] = delivery_data.delivery_time_slot
    if delivery_data.tracking_number is not None:
        update_data['tracking_number'] = delivery_data.tracking_number
    if delivery_data.delivery_status:
        update_data['delivery_status'] = delivery_data.delivery_status
    if delivery_data.delivery_notes is not None:
        update_data['delivery_notes'] = delivery_data.delivery_notes

    await db.orders.update_one({"id": order_id}, {"$set": update_data})

    return {"message": "Delivery information updated successfully."}

@api_router.get("/vendor/stats")
async def get_vendor_stats(current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Unauthorized.")
    
    vendor_id = current_user['id']
    
    # Products count
    total_products = await db.products.count_documents({"vendor_id": vendor_id})
    approved_products = await db.products.count_documents({"vendor_id": vendor_id, "status": "approved"})
    
    # Orders and Revenue
    orders_cursor = db.orders.find({"items.vendor_id": vendor_id})
    total_revenue = 0
    total_orders = 0
    unique_customers = set()
    
    async for order in orders_cursor:
        total_orders += 1
        unique_customers.add(order.get('user_id') or order.get('email'))
        # Sum only vendor's items
        for item in order.get('items', []):
            if item.get('vendor_id') == vendor_id:
                total_revenue += item.get('price', 0) * item.get('quantity', 1)
                
    return {
        "totalProducts": total_products,
        "approvedProducts": approved_products,
        "totalRevenue": total_revenue,
        "totalOrders": total_orders,
        "uniqueCustomers": len(unique_customers),
        "performance": [
            {"name": "Orders", "value": total_orders},
            {"name": "Revenue", "value": total_revenue}
        ]
    }

@api_router.get("/vendor/finance")
async def get_vendor_finance(current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Unauthorized.")
    
    vendor_id = current_user['id']
    
    # Calculate Gross Revenue and Net Earnings from orders
    orders_cursor = db.orders.find({"items.vendor_id": vendor_id})
    earnings_protocol = []
    total_gross = 0
    total_net = 0
    total_commission = 0
    
    async for order in orders_cursor:
        order_gross = 0
        for item in order.get('items', []):
            if item.get('vendor_id') == vendor_id:
                order_gross += item.get('price', 0) * item.get('quantity', 1)
        
        commission = order_gross * 0.10
        net = order_gross - commission
        
        total_gross += order_gross
        total_commission += commission
        total_net += net
        
        earnings_protocol.append({
            "id": order.get('id', 'N/A')[:12],
            "val": order_gross,
            "comm": commission,
            "net": net,
            "status": "settled" if order.get('status') == 'delivered' else "pending",
            "date": order.get('created_at')
        })
    
    # Fetch Withdrawals
    withdrawals_cursor = db.withdrawals.find({"vendor_id": vendor_id}).sort("date", -1)
    withdrawals = []
    total_withdrawn = 0
    async for w in withdrawals_cursor:
        w['id'] = w.get('id') or str(w['_id'])
        if '_id' in w: del w['_id']
        withdrawals.append(w)
        if w['status'] == 'completed':
            total_withdrawn += w['amount']
            
    available_balance = total_net - total_withdrawn
    
    return {
        "available_balance": available_balance,
        "gross_revenue": total_gross,
        "total_commission": total_commission,
        "total_payouts": total_withdrawn,
        "earnings_protocol": earnings_protocol,
        "withdrawals": withdrawals
    }

@api_router.post("/vendor/withdraw")
async def request_withdrawal(withdraw_data: WithdrawalCreate, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Unauthorized.")
    
    vendor_id = current_user['id']
    
    # Check if balance is sufficient (Optional: Real implementation should verify this)
    # We'll just record the request for now.
    
    withdrawal_obj = Withdrawal(
        vendor_id=vendor_id,
        amount=withdraw_data.amount,
        method=withdraw_data.method,
        bank_details=withdraw_data.bank_details
    )
    
    doc = withdrawal_obj.model_dump()
    doc['date'] = doc['date'].isoformat()
    
    await db.withdrawals.insert_one(doc)
    
    # Notify Admin
    admins = await db.users.find({"user_type": "admin"}).to_list(None)
    for admin in admins:
        await db.notifications.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": admin['id'],
            "title": "New Withdrawal Request",
            "message": f"Vendor {current_user.get('business_name')} requested ₹{withdraw_data.amount}.",
            "type": "warning",
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
    return {"message": "Withdrawal request authenticated.", "id": withdrawal_obj.id}

@api_router.patch("/vendor/orders/{order_id}/status")
async def update_vendor_order_status(order_id: str, status_data: dict, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Unauthorized.")
    
    new_status = status_data.get('status')
    if not new_status:
        raise HTTPException(status_code=400, detail="Status required.")
    
    # Update status of items belonging to this vendor in this order
    result = await db.orders.update_one(
        {"id": order_id, "items.vendor_id": current_user['id']},
        {"$set": {"items.$[elem].status": new_status}},
        array_filters=[{"elem.vendor_id": current_user['id']}]
    )
    
    if result.matched_count == 0:
         raise HTTPException(status_code=404, detail="Order not found or access restricted.")
         
    return {"message": "Order item status updated."}

@api_router.patch("/products/{product_id}/stock")
async def update_product_stock(product_id: str, stock_data: dict, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Merchant clearance required.")
    
    new_stock = stock_data.get('stock')
    if new_stock is None:
        raise HTTPException(status_code=400, detail="Stock value required.")

    vendor_id = current_user.get('id')
    
    # Try updating by 'id' field first
    result = await db.products.update_one(
        {"id": product_id, "vendor_id": vendor_id},
        {"$set": {"stock": int(new_stock)}}
    )
    
    if result.matched_count == 0:
         # Try updating by MongoDB '_id'
         from bson import ObjectId
         try:
             result = await db.products.update_one(
                 {"_id": ObjectId(product_id), "vendor_id": vendor_id},
                 {"$set": {"stock": int(new_stock)}}
             )
         except:
             pass

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found or access restricted.")
    
    return {"message": "Stock updated successfully.", "new_stock": new_stock}

@api_router.post("/vendor/support/tickets")
async def create_ticket(ticket_data: TicketCreate, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Merchant clearance required.")
    
    ticket_obj = Ticket(**ticket_data.model_dump(), vendor_id=current_user['id'])
    doc = ticket_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.tickets.insert_one(doc)
    
    # Notify Admin
    admins = await db.users.find({"user_type": "admin"}).to_list(None)
    for admin in admins:
        await db.notifications.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": admin['id'],
            "title": "New Support Ticket",
            "message": f"Vendor {current_user.get('business_name')} submitted a ticket: {ticket_data.subject}",
            "type": "info",
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {"message": "Ticket submitted.", "id": ticket_obj.id}

@api_router.get("/vendor/support/tickets")
async def get_tickets(current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Unauthorized.")

    tickets_cursor = db.tickets.find({"vendor_id": current_user['id']}).sort("created_at", -1)
    tickets = []
    async for t in tickets_cursor:
        t['id'] = t.get('id') or str(t['_id'])
        if '_id' in t: del t['_id']
        tickets.append(t)
    return tickets

@api_router.get("/admin/support/tickets")
async def get_all_tickets(current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Unauthorized.")

    tickets_cursor = db.tickets.find().sort("created_at", -1)
    tickets = []
    async for t in tickets_cursor:
        t['id'] = t.get('id') or str(t['_id'])
        if '_id' in t: del t['_id']

        # Get vendor information
        vendor = await db.vendors.find_one({"id": t.get('vendor_id')})
        if vendor:
            t['vendor_name'] = vendor.get('business_name') or vendor.get('name') or 'Unknown Vendor'
        else:
            t['vendor_name'] = 'Unknown Vendor'

        tickets.append(t)
    return tickets

@api_router.post("/admin/support/tickets/{ticket_id}/reply")
async def reply_to_ticket(ticket_id: str, reply_data: dict, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Unauthorized.")

    reply_message = reply_data.get('message')
    if not reply_message:
        raise HTTPException(status_code=400, detail="Reply message required.")

    # Update ticket status to responding
    await db.tickets.update_one({"id": ticket_id}, {"$set": {"status": "responding"}})

    # Create notification for vendor
    ticket = await db.tickets.find_one({"id": ticket_id})
    if ticket:
        await db.notifications.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": ticket['vendor_id'],
            "title": "Support Response",
            "message": f"Admin replied to your ticket '{ticket['subject']}': {reply_message}",
            "type": "info",
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    return {"message": "Reply sent successfully."}

@api_router.get("/vendor/coupons")
async def get_vendor_coupons(current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Unauthorized.")

    coupons_cursor = db.coupons.find({"vendor_id": current_user['id']}).sort("created_at", -1)
    coupons = []
    async for c in coupons_cursor:
        c['id'] = c.get('id') or str(c['_id'])
        if '_id' in c: del c['_id']
        coupons.append(c)
    return coupons

@api_router.get("/vendor/reviews")
async def get_vendor_reviews(current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Unauthorized.")

    # Get vendor's product ids
    products_cursor = db.products.find({"vendor_id": current_user['id']}, {"id": 1})
    product_ids = [p['id'] async for p in products_cursor]

    reviews_cursor = db.reviews.find({"product_id": {"$in": product_ids}}).sort("created_at", -1)
    reviews = []
    async for r in reviews_cursor:
        r['id'] = r.get('id') or str(r['_id'])
        if '_id' in r: del r['_id']
        # Add product name
        product = await db.products.find_one({"id": r['product_id']})
        r['product_name'] = product.get('name') if product else "Unknown Product"
        # Add user name
        user = await db.users.find_one({"id": r['user_id']})
        r['user_name'] = user.get('name') if user else "Anonymous"
        reviews.append(r)
    return reviews

@api_router.post("/vendor/coupons")
async def create_vendor_coupon(coupon_data: CouponCreate, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Unauthorized.")

    coupon_obj = Coupon(**coupon_data.model_dump(), vendor_id=current_user['id'])
    doc = coupon_obj.model_dump()
    _ = await db.coupons.insert_one(doc)
    return {"message": "Coupon created successfully.", "id": coupon_obj.id}

@api_router.put("/vendor/profile")
async def update_vendor_profile(profile_data: dict, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Unauthorized.")

    allowed_fields = ['business_name', 'owner_name', 'address', 'phone', 'logo', 'banner']
    update_data = {k: v for k, v in profile_data.items() if k in allowed_fields}
    result = await db.vendors.update_one({"id": current_user['id']}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Vendor not found.")
    return {"message": "Profile updated successfully."}

@api_router.get("/admin/payouts")
async def list_payout_requests(current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Unauthorized.")
    
    payouts = await db.withdrawals.find().sort("date", -1).to_list(1000)
    for p in payouts:
        p['id'] = str(p.get('id') or p['_id'])
        if '_id' in p: del p['_id']
        
        # Add vendor name
        vendor = await db.vendors.find_one({"id": p['vendor_id']})
        p['vendor_name'] = vendor.get('business_name') if vendor else "Unknown Vendor"

    return payouts

@api_router.post("/admin/payouts/approve/{payout_id}")
async def approve_payout(payout_id: str, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Unauthorized.")
    
    result = await db.withdrawals.update_one({"id": payout_id}, {"$set": {"status": "completed"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Request not found.")
        
    # Notify Vendor
    payout = await db.withdrawals.find_one({"id": payout_id})
    if payout:
        await db.notifications.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": payout['vendor_id'],
            "title": "Payout Successfully Disbursed",
            "message": f"Your request for ₹{payout['amount']} has been completed.",
            "type": "success",
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
    return {"message": "Payout protocol completed."}

@api_router.post("/admin/payouts/reject/{payout_id}")
async def reject_payout(payout_id: str, reason_data: dict, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Unauthorized.")
    
    reason = reason_data.get("reason", "Policy non-compliance.")
    result = await db.withdrawals.update_one({"id": payout_id}, {"$set": {"status": "rejected", "rejection_reason": reason}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Request not found.")
        
    # Notify Vendor
    payout = await db.withdrawals.find_one({"id": payout_id})
    if payout:
        await db.notifications.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": payout['vendor_id'],
            "title": "Payout Request Rejected",
            "message": f"Your request for ₹{payout['amount']} was rejected. Reason: {reason}",
            "type": "error",
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
    return {"message": "Payout rejected."}

# --- Notification Endpoints ---

@api_router.get("/notifications")
async def get_notifications(current_user: Annotated[dict, Depends(get_current_user)]):
    notifications = await db.notifications.find({"user_id": current_user['id'], "is_read": False}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return notifications

@api_router.post("/notifications/read/{notification_id}")
async def mark_notification_read(notification_id: str, current_user: Annotated[dict, Depends(get_current_user)]):
    await db.notifications.update_one({"id": notification_id, "user_id": current_user['id']}, {"$set": {"is_read": True}})
    return {"message": "Signal cleared."}

@api_router.get("/users/{user_id}")
async def get_user(user_id: str):
    # Check both collections
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        user = await db.vendors.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.get("/public/stats")
async def get_public_stats():
    """
    Returns platform-wide metrics for public display
    """
    user_count = await db.users.count_documents({})
    vendor_count = await db.vendors.count_documents({})
    product_count = await db.products.count_documents({"status": "approved"})
    
    # Real dynamic counts from database
    return {
        "happy_customers": user_count,
        "total_products": product_count,
        "total_vendors": vendor_count,
        "satisfaction_rate": "100%"
    }

@api_router.get("/public/reviews")
async def get_public_reviews():
    """
    Returns latest reviews for public display
    """
    reviews_cursor = db.reviews.find().sort("created_at", -1).limit(6)
    reviews = []
    async for review in reviews_cursor:
        review['id'] = str(review.get('id') or review['_id'])
        if '_id' in review: del review['_id']
        
        # Fetch user name
        user = await db.users.find_one({"id": review['user_id']})
        if user:
            review['user_name'] = user['name']
        else:
            review['user_name'] = "Anonymous"
            
        reviews.append(review)
    return reviews

@api_router.get("/public/categories")
async def get_public_categories():
    """
    Returns all categories for home page display
    """
    categories_cursor = db.categories.find().sort("name", 1)
    categories = []
    async for cat in categories_cursor:
        cat['id'] = str(cat.get('id') or cat['_id'])
        if '_id' in cat: del cat['_id']
        categories.append(cat)
    return categories

@api_router.post("/categories")
async def add_category(category: Category, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can add categories")

    cat_dict = category.model_dump()
    cat_dict['created_at'] = datetime.now(timezone.utc)
    await db.categories.insert_one(cat_dict)
    return {"message": "Category added successfully."}

@api_router.post("/vendor/categories")
async def add_vendor_category(category_data: dict, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Only vendors can add custom categories")

    name = category_data.get('name', '').strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name is required")

    # Check if category already exists
    existing = await db.categories.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    # Create new category
    category_obj = Category(
        name=name,
        image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80",  # Default image
        items="0 Products",
        link=f"/shop?category={name.replace(' ', '%20')}"
    )

    cat_dict = category_obj.model_dump()
    cat_dict['created_at'] = datetime.now(timezone.utc)

    await db.categories.insert_one(cat_dict)
    return {"message": "Custom category added successfully.", "category": cat_dict}

@api_router.post("/reviews")
async def add_review(review: Review, current_user: Annotated[dict, Depends(get_current_user)]):
    review_dict = review.model_dump()
    review_dict['user_id'] = current_user['id']
    review_dict['created_at'] = review_dict['created_at'].isoformat()
    
    await db.reviews.insert_one(review_dict)
    return {"message": "Review submitted successfully."}

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, update_data: dict, current_user: Annotated[dict, Depends(get_current_user)]):
    # Security Check: Only self or admin can update
    if current_user['id'] != user_id and current_user['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Operation restricted. Security clearance insufficient.")

    # Remove None values
    update_data = {k: v for k, v in update_data.items() if v is not None}

    # Try users collection first
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )

    if result.modified_count == 0:
        # Try vendors collection
        result = await db.vendors.update_one(
            {"id": user_id},
            {"$set": update_data}
        )

    if result.modified_count == 0:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User updated successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)