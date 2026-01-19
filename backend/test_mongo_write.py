import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def test_write():
    load_dotenv()
    mongo_url = os.environ.get('MONGO_URL')
    try:
        client = AsyncIOMotorClient(mongo_url)
        db_name = os.environ.get('DB_NAME')
        db = client[db_name]
        
        # Test write to users collection
        test_user = {"name": "Test User", "email": "test@example.com", "password": "password123"}
        result = await db.users.insert_one(test_user)
        print(f"Write successful! Inserted ID: {result.inserted_id}")
        
        # Test read back
        found = await db.users.find_one({"_id": result.inserted_id})
        print(f"Read back successful: {found['email']}")
        
        # Cleanup
        await db.users.delete_one({"_id": result.inserted_id})
        print("Cleanup successful!")
        
    except Exception as e:
        print(f"Error during MongoDB test: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_write())
