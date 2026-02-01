import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import dotenv_values

env = dotenv_values('.env')
print('MONGO_URL:', env.get('MONGO_URL', 'not found'))
print('DB_NAME:', env.get('DB_NAME', 'not found'))

async def check():
    client = AsyncIOMotorClient(env['MONGO_URL'])
    db = client[env['DB_NAME']]
    
    # List collections
    collections = await db.list_collection_names()
    print('Collections:', collections)
    
    # Count products
    count = await db.products.count_documents({})
    print('Products count:', count)
    
    if count > 0:
        products = await db.products.find({}).limit(3).to_list(None)
        for p in products:
            print(f'Product: {p.get("name")[:50]}...')
            print(f'  Status: {p.get("status", "N/A")}')
            print(f'  Category: {p.get("category")}')
            print(f'  Image: {p.get("image", "N/A")[:50]}...')
        
        # Count by status
        approved = await db.products.count_documents({'status': 'approved'})
        pending = await db.products.count_documents({'status': 'pending'})
        print(f'\nApproved: {approved}, Pending: {pending}')
    else:
        print('No products found in database')

asyncio.run(check())
