
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
import uuid

load_dotenv()

async def seed_food_items():
    mongo_url = os.getenv("MONGO_URL")
    client = AsyncIOMotorClient(mongo_url)
    db = client["restuarent"]
    
    # Get all restaurants
    restaurants = await db.restaurants.find().to_list(None)
    
    if not restaurants:
        print("No restaurants found to seed items for.")
        return
        
    # Clear existing items to reflect new schema
    print("Clearing existing food items...")
    await db.food_items.delete_many({})

    sample_items = [
        {"name": "Margherita Pizza", "price": 299, "original_price": 399, "discount_price": 299, "offer_text": "25% OFF", "has_offer": True, "description": "Classic tomato and mozzarella", "category": "pizza-italian", "is_veg": True},
        {"name": "Chicken Biryani", "price": 350, "description": "Aromatic basmati rice with spice", "category": "biryani-rice", "is_veg": False},
        {"name": "Paneer Tikka", "price": 199, "original_price": 250, "discount_price": 199, "offer_text": "SAVE ₹51", "has_offer": True, "description": "Grilled cottage cheese cubes", "category": "indian", "is_veg": True},
        {"name": "Cheese Burger", "price": 199, "description": "Juicy patty with extra cheese", "category": "burgers-fast-food", "is_veg": False},
    ]

    to_insert = []
    for rest in restaurants:
        for item in sample_items:
            doc = {
                "id": str(uuid.uuid4()),
                "restaurant_id": rest["id"],
                "name": item["name"],
                "price": item["price"],
                "description": item["description"],
                "category": item["category"],
                "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop",
                "is_veg": item["is_veg"],
                "is_available": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            to_insert.append(doc)
            
    if to_insert:
        await db.food_items.insert_many(to_insert)
        print(f"Inserted {len(to_insert)} sample menu items.")

if __name__ == "__main__":
    asyncio.run(seed_food_items())
