
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def force_sync_id():
    url = os.getenv("MONGO_URL")
    client = AsyncIOMotorClient(url)
    db = client["restuarent"]
    
    email = "aseel@gmail.com"
    correct_id = "b16bb0a2-441c-4f7a-9581-772eac351d48"
    correct_rid = "5a076ca2-d16b-45e6-9b4a-d4adbca9e647"
    
    # Update ALL records for this email to have the SAME ID and be ACTIVE
    print(f"Force syncing {email} to ID {correct_id}...")
    
    collections = ["restuarent", "food_vendors"]
    for coll in collections:
        result = await db[coll].update_many(
            {"email": email},
            {"$set": {
                "id": correct_id,
                "restaurant_id": correct_rid,
                "status": "active",
                "user_type": "restaurant"
            }}
        )
        print(f"Updated {result.modified_count} docs in {coll}")

    # Also update the restaurants collection
    await db.restaurants.update_many(
        {"vendor_id": {"$ne": correct_id}, "name": "Aseel Hotel"},
        {"$set": {"vendor_id": correct_id}}
    )
    
    # Ensure ONE restaurant doc exists with the correct ID
    res = await db.restaurants.find_one({"id": correct_rid})
    if res:
        await db.restaurants.update_one({"id": correct_rid}, {"$set": {"vendor_id": correct_id}})
    else:
        await db.restaurants.insert_one({
            "id": correct_rid,
            "vendor_id": correct_id,
            "name": "Aseel Hotel",
            "cuisine_type": "Multi-Cuisine",
            "address": "Anna Statue",
            "city": "Colachel",
            "rating": 4.5,
            "is_open": True,
            "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop"
        })

    print("Force ID sync complete.")

if __name__ == "__main__":
    asyncio.run(force_sync_id())
