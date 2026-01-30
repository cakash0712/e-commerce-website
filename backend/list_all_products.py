import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_categories():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.ecommerce
    
    print("Checking ALL products...")
    cursor = db.products.find({})
    count = 0
    async for product in cursor:
        count += 1
        print(f"ID: {product.get('id')} | Cat: {product.get('category')} | Sub: {product.get('sub_category')} | Name: {product.get('name')[:30]}...")
    
    print(f"Total products: {count}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(check_categories())
