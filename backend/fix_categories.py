import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def fix_categories():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.ecommerce
    
    # 1. Update Samsung Galaxy S25 Ultra specifically if needed, or by sub-category
    # Check for products that are 'Mobile Phones' but have category 'Office'
    
    query = {"sub_category": "Mobile Phones", "category": "Office"}
    update = {"$set": {"category": "Electronics"}}
    
    result = await db.products.update_many(query, update)
    print(f"Fixed {result.modified_count} products (Mobile Phones -> Electronics)")
    
    # Also check other potential mis-categorizations
    # Check for 'Laptops' in 'Office'
    result = await db.products.update_many({"sub_category": "Laptops", "category": "Office"}, update)
    print(f"Fixed {result.modified_count} products (Laptops -> Electronics)")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(fix_categories())
