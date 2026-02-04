
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

async def sync_restaurants():
    mongo_url = os.getenv("MONGO_URL")
    client = AsyncIOMotorClient(mongo_url)
    db = client["food_delivery"]
    
    # 1. First, seed if empty
    rest_count = await db.restaurants.count_documents({})
    if rest_count == 0:
        print("Seeding sample restaurants...")
        sample_restaurants = [
            {
                "id": "rest-1",
                "name": "Spice Garden",
                "cuisine_type": "Indian",
                "cuisine": "Indian",
                "rating": 4.5,
                "reviews_count": 234,
                "delivery_time": "25-35",
                "delivery_fee": 40,
                "minimum_order": 200,
                "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
                "is_open": True,
                "featured": True,
                "offers": ["20% OFF on orders above ₹500"],
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "rest-2",
                "name": "Pizza Paradise",
                "cuisine_type": "Italian",
                "cuisine": "Italian",
                "rating": 4.7,
                "reviews_count": 567,
                "delivery_time": "20-30",
                "delivery_fee": 30,
                "minimum_order": 250,
                "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
                "is_open": True,
                "featured": True,
                "offers": ["Free Garlic Bread on orders above ₹600"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.restaurants.insert_many(sample_restaurants)
        print("Seeded sample restaurants.")

    # 2. Sync from 'restuarent' collection (actual vendors)
    print("Syncing vendors to public restaurants list...")
    async for vendor in db.restuarent.find():
        # Check if already in restaurants
        exists = await db.restaurants.find_one({"vendor_id": vendor['id']})
        if not exists:
            # Create public profile
            rest_doc = {
                "id": vendor.get('restaurant_id') or f"rest-{vendor['id'][:6]}",
                "vendor_id": vendor['id'],
                "name": vendor.get('restaurant_name') or vendor.get('business_name') or "My Restaurant",
                "cuisine_type": vendor.get('cuisine_type', "Various"),
                "cuisine": vendor.get('cuisine_type', "Various"),
                "phone": vendor.get('phone'),
                "address": vendor.get('address'),
                "rating": 4.5,
                "is_open": True,
                "delivery_time": "30-45",
                "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.restaurants.insert_one(rest_doc)
            print(f"Added public profile for vendor: {rest_doc['name']}")
        else:
            print(f"Public profile already exists for vendor: {exists['name']}")

if __name__ == "__main__":
    asyncio.run(sync_restaurants())
