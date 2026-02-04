
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def verify_all():
    url = os.getenv("MONGO_URL")
    client = AsyncIOMotorClient(url)
    
    email = "aseel@gmail.com"
    dbs = ["restuarent", "food_delivery"]
    
    for db_name in dbs:
        db = client[db_name]
        colls = await db.list_collection_names()
        for coll in colls:
            async for doc in db[coll].find({"email": email}):
                print(f"[{db_name}.{coll}] Current: Status={doc.get('status')}, Type={doc.get('user_type')}")
                if doc.get('status') != "active" or doc.get('user_type') != "restaurant":
                    await db[coll].update_one({"_id": doc["_id"]}, {"$set": {"status": "active", "user_type": "restaurant"}})
                    print(f"[{db_name}.{coll}] UPDATED TO ACTIVE/RESTAURANT")

if __name__ == "__main__":
    asyncio.run(verify_all())
