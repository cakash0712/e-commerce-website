import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.ecommerce
    count = await db.categories.count_documents({})
    print(f'Categories count: {count}')
    categories = []
    async for cat in db.categories.find().sort("name", 1):
        categories.append(cat.get('name', ''))
    print('Categories:', len(categories))
    for cat in categories:
        print(f'- {cat}')
    await client.close()

asyncio.run(main())