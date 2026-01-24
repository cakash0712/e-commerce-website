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
from fastapi import HTTPException, Depends, Header, Request
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
    business_name: str = ""
    owner_name: str = ""
    user_type: str = "user"  # user, admin, vendor
    is_blocked: bool = False
    token_version: int = 1
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    name: str
    email: str
    phone: str = ""
    password: str
    gender: str = ""
    dob: str = ""
    address: str = ""
    business_name: str = ""
    owner_name: str = ""
    user_type: str = "user"

class UserLogin(BaseModel):
    identifier: str  # phone or email
    password: str
    user_type: str = "user"

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
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
    vendor_id: str
    offers: str = ""
    status: str = "approved" # pending, approved, rejected
    rejection_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    category: str
    brand: str = ""
    price: float
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

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str = "info" # info, success, warning, error
    is_read: bool = False
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
    user_id: str
    rating: int  # 1-5
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="User already exists")

    user_dict = user_data.model_dump()
    user_dict['password'] = get_password_hash(user_dict['password'])
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
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(login_data.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials protocol.")

    if user.get('is_blocked', False):
        raise HTTPException(status_code=403, detail="Account access suspended. Contact compliance.")

    # Generate Token
    token = create_access_token({
        "sub": user['id'], 
        "user_type": user['user_type'], 
        "version": user.get('token_version', 1)
    })

    # Return user data with token, without password
    user_data = {k: v for k, v in user.items() if k != 'password' and k != '_id'}
    return {**user_data, "token": token}

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

# --- Product Endpoints ---

@api_router.post("/products")
async def add_product(product_data: ProductCreate, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Merchant clearance required.")
        
    product_obj = Product(**product_data.model_dump(), vendor_id=current_user['id'])
    doc = product_obj.model_dump()
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
async def list_public_products():
    # Only show approved products
    products_cursor = db.products.find({"status": "approved"})
    products = []
    async for p in products_cursor:
        p_id = p.get('id') or str(p['_id'])
        p['id'] = p_id
        if '_id' in p: del p['_id']

        # Add vendor information
        vendor_id = p.get('vendor_id')
        if vendor_id:
            vendor = await db.vendors.find_one({"id": vendor_id})
            if vendor:
                p['vendor_name'] = vendor.get('business_name', 'Unknown Vendor')
            else:
                p['vendor_name'] = 'Unknown Vendor'
        else:
            p['vendor_name'] = 'Unknown Vendor'

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
    # Recalculate originalPrice if discount is provided
    if update_doc.get('discount', 0) > 0:
        update_doc['originalPrice'] = round(update_doc['price'] / (1 - update_doc['discount'] / 100), 2)
    else:
        update_doc['originalPrice'] = update_doc['price']
    
    # Ensure current ID stays the same
    if existing_product.get('id'):
        update_doc['id'] = existing_product['id']
    
    await db.products.update_one(query, {"$set": update_doc})
    return {"message": "Inventory updated and queued for re-audit."}

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

@api_router.post("/upload/image")
async def upload_image(current_user: Annotated[dict, Depends(get_current_user)], file: UploadFile = File(...)):
    if current_user['user_type'] != 'vendor':
        raise HTTPException(status_code=403, detail="Merchant clearance required.")

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

        # Only allow certain domains for security
        allowed_domains = ['m.media-amazon.com', 'images-na.ssl-images-amazon.com', 'localhost', '127.0.0.1']
        from urllib.parse import urlparse
        parsed_url = urlparse(url)
        if parsed_url.netloc not in allowed_domains:
            raise HTTPException(status_code=403, detail="Domain not allowed")

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
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    return user

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