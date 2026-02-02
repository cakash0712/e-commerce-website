
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import certifi

async def test_connection():
    load_dotenv()
    mongo_url = os.environ.get('MONGO_URL')
    ca = certifi.where()
    print(f"Connecting with certifi CA: {ca}")
    try:
        client = AsyncIOMotorClient(mongo_url, tlsCAFile=ca)
        await client.admin.command('ismaster')
        print("MongoDB connection successful!")
        
        db_name = os.environ.get('DB_NAME')
        db = client[db_name]
        collections = await db.list_collection_names()
        print(f"Collections: {collections}")
        
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    asyncio.run(test_connection())
