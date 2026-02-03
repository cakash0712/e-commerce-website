"""
Script to set up the Food Delivery database in MongoDB Atlas.
This creates a separate database for food delivery with its own collections.
"""
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone
import uuid
import certifi

load_dotenv()

# Food Categories for restaurants
FOOD_CATEGORIES = [
    {
        "name": "Biryani & Rice",
        "slug": "biryani-rice",
        "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80",
        "subcategories": ["Chicken Biryani", "Mutton Biryani", "Veg Biryani", "Fried Rice", "Pulao"]
    },
    {
        "name": "Pizza & Italian",
        "slug": "pizza-italian",
        "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
        "subcategories": ["Margherita", "Pepperoni", "Pasta", "Garlic Bread", "Lasagna"]
    },
    {
        "name": "Burgers & Fast Food",
        "slug": "burgers-fast-food",
        "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
        "subcategories": ["Chicken Burger", "Veg Burger", "Wraps", "French Fries", "Nuggets"]
    },
    {
        "name": "Chinese & Asian",
        "slug": "chinese-asian",
        "image": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80",
        "subcategories": ["Noodles", "Manchurian", "Momos", "Spring Rolls", "Fried Rice"]
    },
    {
        "name": "North Indian",
        "slug": "north-indian",
        "image": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80",
        "subcategories": ["Dal Makhani", "Paneer Butter Masala", "Roti", "Naan", "Chole Bhature"]
    },
    {
        "name": "South Indian",
        "slug": "south-indian",
        "image": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&q=80",
        "subcategories": ["Dosa", "Idli", "Vada", "Uttapam", "Sambar Rice"]
    },
    {
        "name": "Desserts & Sweets",
        "slug": "desserts-sweets",
        "image": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&q=80",
        "subcategories": ["Ice Cream", "Cakes", "Pastries", "Indian Sweets", "Brownies"]
    },
    {
        "name": "Beverages",
        "slug": "beverages",
        "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80",
        "subcategories": ["Fresh Juices", "Smoothies", "Shakes", "Mocktails", "Tea & Coffee"]
    },
    {
        "name": "Street Food",
        "slug": "street-food",
        "image": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=500&q=80",
        "subcategories": ["Pani Puri", "Pav Bhaji", "Chaat", "Vada Pav", "Samosa"]
    },
    {
        "name": "Healthy & Salads",
        "slug": "healthy-salads",
        "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80",
        "subcategories": ["Green Salads", "Grilled Items", "Soups", "Protein Bowls", "Smoothie Bowls"]
    }
]

async def setup_food_database():
    mongo_url = os.environ.get('MONGO_URL')
    
    if not mongo_url:
        print("ERROR: MONGO_URL not found in environment variables.")
        return
    
    print(f"Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
    
    # Create/Access the food_delivery database
    food_db = client["food_delivery"]
    
    print("Setting up food_delivery database...")
    
    # 1. Create food_categories collection
    cat_count = await food_db.food_categories.count_documents({})
    if cat_count == 0:
        print("Seeding food categories...")
        for cat in FOOD_CATEGORIES:
            doc = {
                "id": str(uuid.uuid4()),
                "name": cat["name"],
                "slug": cat["slug"],
                "image": cat["image"],
                "subcategories": cat["subcategories"],
                "items_count": 0,
                "created_at": datetime.now(timezone.utc)
            }
            await food_db.food_categories.insert_one(doc)
        print(f"  Created {len(FOOD_CATEGORIES)} food categories.")
    else:
        print(f"  Food categories already exist ({cat_count} found).")
    
    # 2. Ensure indexes on collections
    print("Creating indexes...")
    
    # Restaurants collection indexes
    await food_db.restaurants.create_index("id", unique=True)
    await food_db.restaurants.create_index("vendor_id")
    await food_db.restaurants.create_index("is_open")
    await food_db.restaurants.create_index([("location", "2dsphere")])
    
    # Menu items indexes
    await food_db.menu_items.create_index("id", unique=True)
    await food_db.menu_items.create_index("restaurant_id")
    await food_db.menu_items.create_index("category")
    await food_db.menu_items.create_index("is_available")
    
    # Food orders indexes
    await food_db.food_orders.create_index("id", unique=True)
    await food_db.food_orders.create_index("user_id")
    await food_db.food_orders.create_index("restaurant_id")
    await food_db.food_orders.create_index("status")
    await food_db.food_orders.create_index("created_at")
    
    # Food vendors (restaurants owners) - stored in main ecommerce DB but referenced here
    await food_db.food_vendors.create_index("id", unique=True)
    await food_db.food_vendors.create_index("email", unique=True)
    
    print("Indexes created successfully.")
    
    # 3. Seed Sample Restaurants if empty
    rest_count = await food_db.restaurants.count_documents({})
    if rest_count == 0:
        print("Seeding sample restaurants...")
        sample_restaurants = [
            {
                "id": "rest-1",
                "name": "Spice Garden",
                "cuisine_type": "Indian",
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
            },
            {
                "id": "rest-3",
                "name": "Dragon Wok",
                "cuisine_type": "Chinese",
                "rating": 4.3,
                "reviews_count": 189,
                "delivery_time": "30-40",
                "delivery_fee": 50,
                "minimum_order": 300,
                "image": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop",
                "is_open": True,
                "featured": False,
                "offers": [],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await food_db.restaurants.insert_many(sample_restaurants)
        
        # Seed Menu Items for Spice Garden
        sample_menu = [
            {"id": "item-101", "restaurant_id": "rest-1", "name": "Butter Chicken", "price": 320, "description": "Creamy tomato-based curry with tender chicken", "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=200&fit=crop", "category": "Main Course", "is_veg": False, "is_available": True, "bestseller": True},
            {"id": "item-102", "restaurant_id": "rest-1", "name": "Paneer Tikka", "price": 280, "description": "Grilled cottage cheese with spices", "image": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=200&fit=crop", "category": "Starters", "is_veg": True, "is_available": True, "bestseller": True},
            {"id": "item-103", "restaurant_id": "rest-2", "name": "Margherita Pizza", "price": 299, "description": "Classic tomato, mozzarella & basil", "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop", "category": "Pizza", "is_veg": True, "is_available": True, "bestseller": True}
        ]
        await food_db.menu_items.insert_many(sample_menu)
        print(f"  Created {len(sample_restaurants)} restaurants and their menu items.")
    
    # 3. List all collections
    collections = await food_db.list_collection_names()
    print(f"\nCollections in food_delivery database: {collections}")
    
    # 4. Summary
    print("\n=== Food Delivery Database Setup Complete ===")
    print(f"Database: food_delivery")
    print(f"Categories: {await food_db.food_categories.count_documents({})}")
    print(f"Restaurants: {await food_db.restaurants.count_documents({})}")
    print(f"Menu Items: {await food_db.menu_items.count_documents({})}")
    print(f"Food Orders: {await food_db.food_orders.count_documents({})}")
    print(f"Food Vendors: {await food_db.food_vendors.count_documents({})}")
    
    client.close()
    print("\nDone!")

if __name__ == "__main__":
    asyncio.run(setup_food_database())
