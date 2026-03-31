import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import certifi

load_dotenv()

async def migrate_indian_categories():
    mongo_url = os.environ.get('MONGO_URL')
    if not mongo_url:
        print("ERROR: MONGO_URL not found.")
        return
    
    print(f"Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
    
    # We use 'restuarent' as the DB name based on setup_food_db.py
    # But some scripts use 'food_delivery'. Let's check both or use the one from setup.
    db = client["restuarent"]
    # Also check 'food_delivery' just in case
    db_alternative = client["food_delivery"]
    
    for current_db in [db, db_alternative]:
        print(f"\nProcessing database: {current_db.name}")
        
        # 1. Update Food Items
        print("Updating food items...")
        # Update both 'category' (slug) and 'category_name' (label)
        
        # North Indian -> Indian
        res1 = await current_db.food_items.update_many(
            {"$or": [{"category": "north-indian"}, {"category_name": "North Indian"}]},
            {"$set": {"category": "indian", "category_name": "Indian"}}
        )
        print(f"  North Indian items updated: {res1.modified_count}")
        
        # South Indian -> Indian
        res2 = await current_db.food_items.update_many(
            {"$or": [{"category": "south-indian"}, {"category_name": "South Indian"}]},
            {"$set": {"category": "indian", "category_name": "Indian"}}
        )
        print(f"  South Indian items updated: {res2.modified_count}")
        
        # 2. Update Restaurants Cuisine Type
        print("Updating restaurants cuisine types...")
        # North Indian -> Indian
        res3 = await current_db.restaurants.update_many(
            {"cuisine_type": {"$regex": "North Indian", "$options": "i"}},
            [{"$set": {"cuisine_type": {"$replaceOne": {"input": "$cuisine_type", "find": "North Indian", "replacement": "Indian"}}}}]
        )
        # Use simple update if replaceOne is not supported in this version or too complex
        # Actually $regex replace is safer
        
        # South Indian -> Indian
        res4 = await current_db.restaurants.update_many(
            {"cuisine_type": {"$regex": "South Indian", "$options": "i"}},
            [{"$set": {"cuisine_type": {"$replaceOne": {"input": "$cuisine_type", "find": "South Indian", "replacement": "Indian"}}}}]
        )
        
        # Also handle hyphenated variants in lists if any
        await current_db.restaurants.update_many(
            {"cuisine": {"$regex": "North Indian", "$options": "i"}},
            [{"$set": {"cuisine": {"$replaceOne": {"input": "$cuisine", "find": "North Indian", "replacement": "Indian"}}}}]
        )
        await current_db.restaurants.update_many(
            {"cuisine": {"$regex": "South Indian", "$options": "i"}},
            [{"$set": {"cuisine": {"$replaceOne": {"input": "$cuisine", "find": "South Indian", "replacement": "Indian"}}}}]
        )

        # 3. Handle possible duplicate "Indian" in cuisine_type if both were present
        # e.g., "North Indian, South Indian" -> "Indian, Indian" -> "Indian"
        # This is a bit complex for a single query, but we can do a cleanup pass
        cursor = current_db.restaurants.find({"cuisine_type": {"$regex": "Indian, Indian", "$options": "i"}})
        async for rest in cursor:
            new_cuisine = rest['cuisine_type'].replace("Indian, Indian", "Indian").replace("Indian,Indian", "Indian")
            await current_db.restaurants.update_one({"_id": rest["_id"]}, {"$set": {"cuisine_type": new_cuisine}})

    client.close()
    print("\nMigration complete!")

if __name__ == "__main__":
    asyncio.run(migrate_indian_categories())
