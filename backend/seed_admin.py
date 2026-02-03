
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import certifi
from passlib.context import CryptContext
import uuid
from datetime import datetime, timezone

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_admin():
    ROOT_DIR = Path(__file__).parent
    load_dotenv(ROOT_DIR / '.env')
    
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
    db = client[db_name]
    
    admin_email = "admin@zippy.com"
    admin_password = "admin_password" # Default password, user can change later
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if not existing_admin:
        admin_doc = {
            "id": str(uuid.uuid4()),
            "name": "System Admin",
            "email": admin_email,
            "password": pwd_context.hash(admin_password),
            "user_type": "admin",
            "status": "active",
            "is_blocked": False,
            "created_at": datetime.now(timezone.utc),
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
        }
        await db.users.insert_one(admin_doc)
        print(f"Successfully seeded admin user: {admin_email}")
    else:
        # Ensure it is an admin
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"user_type": "admin"}}
        )
        print(f"Admin user already exists: {admin_email}. Ensured user_type is 'admin'.")

if __name__ == "__main__":
    asyncio.run(seed_admin())
