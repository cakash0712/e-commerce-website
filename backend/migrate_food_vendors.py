
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def migrate_collection():
    mongo_url = os.getenv("MONGO_URL")
    if not mongo_url:
        print("MONGO_URL not found")
        return
        
    client = AsyncIOMotorClient(mongo_url)
    db = client["food_delivery"]
    
    # Check if food_vendors exists
    collections = await db.list_collection_names()
    if "food_vendors" in collections:
        print("Renaming food_vendors to restuarent...")
        try:
            # MongoDB renameCollection command
            await db["food_vendors"].rename("restuarent")
            print("Successfully renamed collection.")
        except Exception as e:
            print(f"Error renaming collection: {e}")
            # Alternative: copy documents
            print("Trying fallback: copying documents...")
            async for doc in db["food_vendors"].find():
                await db["restuarent"].insert_one(doc)
            print("Copy complete.")
    else:
        print("food_vendors collection not found. Maybe already renamed or empty.")

    # Also check if user_type needs updating for existing docs
    print("Updating user_type in restuarent collection...")
    result = await db["restuarent"].update_many(
        {"user_type": "food_vendor"},
        {"$set": {"user_type": "restaurant"}}
    )
    print(f"Updated {result.modified_count} documents to user_type 'restaurant'.")

if __name__ == "__main__":
    asyncio.run(migrate_collection())
