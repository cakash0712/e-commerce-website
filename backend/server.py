from fastapi import FastAPI, APIRouter
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


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown
    client.close()

# Create the main app with lifespan
app = FastAPI(lifespan=lifespan)

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
        
    order_obj = Order(
        **order_data.model_dump(),
        user_id=current_user['id']
    )
    
    doc = order_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.orders.insert_one(doc)

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
        products.append(p)
    return products

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