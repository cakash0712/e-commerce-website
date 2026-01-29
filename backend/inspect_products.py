
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

async def check_products():
    load_dotenv()
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    products = await db.products.find().to_list(10)
    for p in products:
        print(f"ID: {p.get('id')} | Category: {p.get('category')} | Name: {p.get('name')}")
        print(f"Attributes: {[k for k in p.keys() if k not in ['_id', 'id', 'name', 'category', 'image', 'images', 'price', 'originalPrice', 'description', 'vendor_id', 'vendor_name', 'created_at']]}")
        print("-" * 20)

    client.close()

if __name__ == "__main__":
    asyncio.run(check_products())
