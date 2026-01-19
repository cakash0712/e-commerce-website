import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def test_connection():
    load_dotenv()
    mongo_url = os.environ.get('MONGO_URL')
    print(f"Connecting to: {mongo_url}")
    try:
        client = AsyncIOMotorClient(mongo_url)
        # The is_master command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print("MongoDB connection successful!")
        
        db_name = os.environ.get('DB_NAME')
        db = client[db_name]
        
        # Try to list collections
        collections = await db.list_collection_names()
        print(f"Collections in {db_name}: {collections}")
        
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_connection())
