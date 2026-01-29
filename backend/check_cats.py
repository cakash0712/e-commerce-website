
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

async def check_categories():
    load_dotenv()
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    print("Checking Categories Collection...")
    cats = await db.categories.find().to_list(100)
    print(f"Total categories found: {len(cats)}")
    for c in cats:
        print(f"- {c.get('name')} (Slug: {c.get('name').lower().replace(' ', '-')})")
    
    print("\nChecking Unique Categories in Products...")
    distinct_cats = await db.products.distinct("category")
    print(f"Total distinct product categories: {len(distinct_cats)}")
    for dc in distinct_cats:
        print(f"- {dc}")

    client.close()

if __name__ == "__main__":
    asyncio.run(check_categories())
