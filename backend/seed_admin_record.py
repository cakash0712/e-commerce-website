
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import certifi

async def seed_admin_collection():
    ROOT_DIR = Path(__file__).parent
    load_dotenv(ROOT_DIR / '.env')
    
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
    db = client[db_name]
    
    admin_email = "admin@zippy.com"
    
    # Get user id from users collection
    user = await db.users.find_one({"email": admin_email})
    
    if user:
        # Create/Update admin collection entry
        admin_entry = {
            "user_id": user['id'],
            "email": admin_email,
            "role": "super_admin",
            "is_active": True
        }
        await db.admin.update_one(
            {"email": admin_email},
            {"$set": admin_entry},
            upsert=True
        )
        print(f"Successfully added admin record to 'admin' collection for {admin_email}")
    else:
        print(f"Error: User {admin_email} not found in 'users' collection. Run seed_admin.py first.")

if __name__ == "__main__":
    asyncio.run(seed_admin_collection())
