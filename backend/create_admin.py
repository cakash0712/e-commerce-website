import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv
from pathlib import Path
import datetime
import uuid

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB config
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'ecommerce_db')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

async def create_admin():
    print(f"Connecting to MongoDB at {mongo_url}...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    admin_email = "admin@DACH.com"
    admin_password = "admin_password"
    
    # Check if admin already exists in users (admin stored in users collection with user_type='admin')
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if existing_admin:
        print(f"Admin user {admin_email} already exists.")
        
        # Optional: Update password if needed
        # new_hash = get_password_hash(admin_password)
        # await db.users.update_one({"email": admin_email}, {"$set": {"password": new_hash}})
        # print("Password updated.")
        
    else:
        print(f"Creating new admin user: {admin_email}")
        new_admin = {
            "id": str(uuid.uuid4()),
            "name": "Super Admin",
            "email": admin_email,
            "password": get_password_hash(admin_password),
            "user_type": "admin",
            "role": "admin",
            "is_blocked": False,
            "token_version": 1,
            "created_at": datetime.datetime.utcnow().isoformat(),
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
        }
        
        result = await db.users.insert_one(new_admin)
        print(f"Admin created with ID: {result.inserted_id}")
        
    print("\n---------------------------------------------------")
    print(f"Admin Login Credentials:")
    print(f"Email:    {admin_email}")
    print(f"Password: {admin_password}")
    print("---------------------------------------------------")

    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin())
