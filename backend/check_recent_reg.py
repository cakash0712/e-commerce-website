
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def check_recent():
    url = os.getenv("MONGO_URL")
    client = AsyncIOMotorClient(url)
    db = client["restuarent"]
    
    print("--- Recent 10 Restuarent Partners ---")
    async for doc in db.restuarent.find().sort("created_at", -1).limit(10):
        print(f"Email: {doc.get('email')}, Phone: {doc.get('phone')}, Created: {doc.get('created_at')}, Status: {doc.get('status')}")

    print("\n--- Recent 10 Restaurant Listings ---")
    async for doc in db.restaurants.find().limit(10):
        print(f"Name: {doc.get('name')}, VendorID: {doc.get('vendor_id')}")

if __name__ == "__main__":
    asyncio.run(check_recent())
