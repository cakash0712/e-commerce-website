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

# Food Categories for the app
FOOD_CATEGORIES = [
    {
        "id": "cat-pizza",
        "name": "Pizza",
        "slug": "pizza",
        "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
        "subcategories": ["Margherita", "Pepperoni", "Veggie", "Cheese Burst"]
    },
    {
        "id": "cat-burgers",
        "name": "Burgers",
        "slug": "burgers",
        "image": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80",
        "subcategories": ["Chicken Burger", "Veg Burger", "Cheese Burger", "Maharaja Mac"]
    },
    {
        "id": "cat-chicken",
        "name": "Chicken",
        "slug": "chicken",
        "image": "https://images.unsplash.com/photo-1567622646622-4a697693e56c?w=500&q=80",
        "subcategories": ["Fried Chicken", "Grilled Chicken", "Chicken Wings", "Buckets"]
    },
    {
        "id": "cat-healthy",
        "name": "Healthy & Salads",
        "slug": "healthy-salads",
        "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80",
        "subcategories": ["Green Salads", "Quinoa Bowls", "Vegan", "Keto"]
    },
    {
        "id": "cat-beverages",
        "name": "Beverages",
        "slug": "beverages",
        "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80",
        "subcategories": ["Cold Drinks", "Coffee", "Tea", "Juices"]
    }
]

SAMPLE_RESTAURANTS = [
    {
        "id": "dominos-001",
        "name": "Domino's Pizza",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Domino%27s_pizza_logo.svg/1200px-Domino%27s_pizza_logo.svg.png",
        "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
        "cuisine_type": "Italian, Pizza",
        "rating": 4.5,
        "reviews_count": 2800,
        "address": "45 Pizza Street, Crust City",
        "is_open": True,
        "delivery_time": "30 mins",
        "delivery_fee": 30.0,
        "minimum_order": 250.0,
        "menu_categories": ["Pizza", "Sides", "Beverages"],
        "featured": True,
        "offers": ["30% OFF on first 3 orders"]
    },
    {
        "id": "mcdonalds-001",
        "name": "McDonald's",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png",
        "image": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
        "cuisine_type": "American, Fast Food",
        "rating": 4.2,
        "reviews_count": 1500,
        "address": "123 Burger Lane, Foodie Hub",
        "is_open": True,
        "delivery_time": "20-30 mins",
        "delivery_fee": 35.0,
        "minimum_order": 150.0,
        "menu_categories": ["Burgers", "Combos", "Beverages"],
        "featured": True,
        "offers": ["Free McVeggie on orders above ₹500"]
    },
    {
        "id": "kfc-001",
        "name": "KFC",
        "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/1200px-KFC_logo.svg.png",
        "image": "https://images.unsplash.com/photo-1513639776629-7b61b0ac49bc?w=800",
        "cuisine_type": "American, Fried Chicken",
        "rating": 4.3,
        "reviews_count": 1200,
        "address": "78 Fried Chicken Road, Crispy Town",
        "is_open": True,
        "delivery_time": "25-35 mins",
        "delivery_fee": 40.0,
        "minimum_order": 200.0,
        "menu_categories": ["Chicken", "Burgers", "Sides"],
        "featured": False,
        "offers": ["Extra wing free on bucket order"]
    }
]

SAMPLE_MENU_ITEMS = [
    # Domino's Items
    {
        "id": "pizza-margherita-001",
        "restaurant_id": "dominos-001",
        "category_name": "Pizza",
        "name": "Margherita Pizza",
        "description": "Fresh mozzarella & basil on classic tomato base. Traditional Neapolitan style.",
        "base_price": 299.0,
        "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500",
        "is_veg": True,
        "preparation_time": "20 mins",
        "is_available": True,
        "customization_groups": [
            {
                "name": "Size",
                "min_selectable": 1, "max_selectable": 1,
                "options": [
                    {"name": "Small", "price": 0.0},
                    {"name": "Medium", "price": 150.0},
                    {"name": "Large", "price": 300.0}
                ]
            },
            {
                "name": "Extra Toppings",
                "min_selectable": 0, "max_selectable": 5,
                "options": [
                    {"name": "Olives", "price": 40.0},
                    {"name": "Extra Cheese", "price": 80.0},
                    {"name": "Mushrooms", "price": 50.0}
                ]
            }
        ]
    },
    {
        "id": "pizza-pepperoni-001",
        "restaurant_id": "dominos-001",
        "category_name": "Pizza",
        "name": "Pepperoni Feast",
        "description": "Loaded with spicy pepperoni and gooey mozzarella.",
        "base_price": 449.0,
        "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500",
        "is_veg": False,
        "preparation_time": "25 mins",
        "is_available": True,
        "customization_groups": [
            {
                "name": "Crust",
                "min_selectable": 1, "max_selectable": 1,
                "options": [
                    {"name": "New Hand Tossed", "price": 0.0},
                    {"name": "Cheese Burst", "price": 99.0},
                    {"name": "Wheat Thin Crust", "price": 40.0}
                ]
            }
        ]
    },
    # McDonald's Items
    {
        "id": "burger-maharaja-001",
        "restaurant_id": "mcdonalds-001",
        "category_name": "Burgers",
        "name": "Maharaja Mac",
        "description": "Double decker burger with rich spicy sauce and flame-grilled patties.",
        "base_price": 199.0,
        "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
        "is_veg": False,
        "preparation_time": "15 mins",
        "is_available": True,
        "customization_groups": [
            {
                "name": "Patty Style",
                "min_selectable": 1, "max_selectable": 1,
                "options": [
                    {"name": "Single Patty", "price": 0.0},
                    {"name": "Double Patty", "price": 70.0}
                ]
            },
            {
                "name": "Make it a Combo",
                "min_selectable": 0, "max_selectable": 1,
                "options": [
                    {"name": "Fries + Coke (M)", "price": 99.0},
                    {"name": "Fries + Coke (L)", "price": 149.0}
                ]
            }
        ]
    },
    {
        "id": "salad-quinoa-001",
        "restaurant_id": "mcdonalds-001",
        "category_name": "Combos", # Grouping under combos for MCD
        "name": "Harvest Salad",
        "description": "Fresh greens, quinoa, roasted almonds, and light vinaigrette.",
        "base_price": 249.0,
        "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
        "is_veg": True,
        "dietary_tags": ["Vegan", "Gluten-free"],
        "calorie_info": "280 kcal",
        "preparation_time": "12 mins",
        "is_available": True,
        "customization_groups": [
            {
                "name": "Dressing",
                "min_selectable": 1, "max_selectable": 1,
                "options": [
                    {"name": "Balsamic", "price": 0.0},
                    {"name": "Lemon Tahini", "price": 0.0}
                ]
            }
        ]
    },
    # KFC Items
    {
        "id": "kfc-bucket-001",
        "restaurant_id": "kfc-001",
        "category_name": "Chicken",
        "name": "8-Pc Hot & Crispy Bucket",
        "description": "Signature Hot & Crispy chicken pieces. Sharable!",
        "base_price": 699.0,
        "image": "https://images.unsplash.com/photo-1513639776629-7b61b0ac49bc?w=500",
        "is_veg": False,
        "preparation_time": "20 mins",
        "is_available": True,
        "customization_groups": [
            {
                "name": "Add-ons",
                "min_selectable": 0, "max_selectable": 2,
                "options": [
                    {"name": "Extra Dip", "price": 20.0},
                    {"name": "Periperi Sprinkles", "price": 15.0}
                ]
            }
        ]
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
    # Standardizing: using 'restuarent' as specified in previous logs for food features
    food_db = client["restuarent"]
    
    print("Setting up food_delivery database (restuarent namespace)...")
    
    # 1. Clear existing collections for a fresh start (optional, but good for seeding)
    # await food_db.food_categories.delete_many({})
    # await food_db.restaurants.delete_many({})
    # await food_db.food_items.delete_many({})
    
    # 2. Seed food categories
    print("Seeding food categories...")
    for cat in FOOD_CATEGORIES:
        await food_db.food_categories.update_one({"id": cat['id']}, {"$set": cat}, upsert=True)
    
    # 3. Seed Restaurants
    print("Seeding restaurants...")
    for rest in SAMPLE_RESTAURANTS:
        rest['created_at'] = datetime.now(timezone.utc).isoformat()
        await food_db.restaurants.update_one({"id": rest['id']}, {"$set": rest}, upsert=True)
        
    # 4. Seed Menu Items
    print("Seeding menu items...")
    for item in SAMPLE_MENU_ITEMS:
        item['created_at'] = datetime.now(timezone.utc).isoformat()
        await food_db.food_items.update_one({"id": item['id']}, {"$set": item}, upsert=True)
    
    # 5. Ensure indexes
    print("Creating indexes...")
    await food_db.restaurants.create_index("id", unique=True)
    await food_db.food_items.create_index("id", unique=True)
    await food_db.food_items.create_index("restaurant_id")
    await food_db.food_orders.create_index("id", unique=True)
    await food_db.food_orders.create_index("user_id")
    
    print("\n=== Food Delivery Database Setup Complete ===")
    print(f"Restaurants: {await food_db.restaurants.count_documents({})}")
    print(f"Menu Items: {await food_db.food_items.count_documents({})}")
    
    client.close()
    print("\nDone!")

if __name__ == "__main__":
    asyncio.run(setup_food_database())
