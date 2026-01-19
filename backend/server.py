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
from datetime import datetime, timezone
from contextlib import asynccontextmanager


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

# Add your routes to the router instead of directly to app
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
async def get_status_checks():
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
    user_obj = User(**user_dict)

    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()

    result = await collection.insert_one(doc)
    doc['_id'] = result.inserted_id

    return User(**doc)

@api_router.post("/users/login")
async def login_user(login_data: UserLogin):
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

    if user['password'] != login_data.password:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid password")

    # Return user data without password
    user_data = {k: v for k, v in user.items() if k != 'password' and k != '_id'}
    return user_data

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
async def update_user(user_id: str, update_data: dict):
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