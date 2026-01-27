import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

async def check():
    load_dotenv(Path('.') / '.env')
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    # Check distinct categories in products
    prod_cats = await db.products.distinct('category')
    print(f"CATEGORIES_IN_PRODUCTS: {prod_cats}")
    
    # Check category records
    cat_records = await db.categories.find().to_list(100)
    print(f"CATEGORY_RECORDS: {[c['name'] for c in cat_records]}")
    
    # Update products to have a 3rd category if needed for demo
    if len(prod_cats) < 3:
        # Get some products
        prods = await db.products.find().limit(5).to_list(5)
        if len(prods) >= 3:
            # Reassign 1 product to 'Fashion' and 1 to 'Home & Garden'
            await db.products.update_one({"id": prods[1]['id']}, {"$set": {"category": "Fashion"}})
            await db.products.update_one({"id": prods[2]['id']}, {"$set": {"category": "Home & Garden"}})
            print("Updated products to have more categories for display.")
    
    # Ensure 'Accessories' is in categories if it's in products
    if 'Accessories' in prod_cats:
        exists = await db.categories.find_one({"name": "Accessories"})
        if not exists:
            await db.categories.insert_one({
                "id": str(__import__('uuid').uuid4()),
                "name": "Accessories",
                "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
                "items": "500+ Products",
                "link": "/shop?category=Accessories",
                "created_at": __import__('datetime').datetime.now(__import__('datetime').timezone.utc)
            })
            print("Added Accessories category record.")

    client.close()

if __name__ == "__main__":
    asyncio.run(check())
