
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def check_all():
    mongo_url = os.getenv("MONGO_URL")
    client = AsyncIOMotorClient(mongo_url)
    db = client["food_delivery"]
    
    collections = ["restaurants", "restuarent", "food_items", "food_orders"]
    for coll in collections:
        count = await db[coll].count_documents({})
        print(f"Collection '{coll}': {count} documents")

if __name__ == "__main__":
    asyncio.run(check_all())
