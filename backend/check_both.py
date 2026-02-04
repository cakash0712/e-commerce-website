
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def check_both():
    url = os.getenv("MONGO_URL")
    client = AsyncIOMotorClient(url)
    db = client["restuarent"]
    
    email = "brandnew123@test.com"
    
    print(f"Checking {email} in both collections...")
    
    r1 = await db.restuarent.find_one({"email": email})
    print(f"restuarent collection: {'FOUND' if r1 else 'NOT FOUND'}")
    
    r2 = await db.food_vendors.find_one({"email": email})
    print(f"food_vendors collection: {'FOUND' if r2 else 'NOT FOUND'}")

asyncio.run(check_both())
