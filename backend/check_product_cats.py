import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_categories():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.ecommerce
    
    print("Checking products...")
    cursor = db.products.find({})
    async for product in cursor:
        if product.get('sub_category') == 'Mobile Phones' or product.get('name', '').startswith('Samsung'):
            print(f"ID: {product.get('id')} | Name: {product.get('name')[:40]}... | Category: {product.get('category')} | Sub: {product.get('sub_category')}")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(check_categories())
