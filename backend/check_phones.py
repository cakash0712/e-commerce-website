
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def check_phones():
    url = os.getenv("MONGO_URL")
    client = AsyncIOMotorClient(url)
    db = client["restuarent"]
    
    async for doc in db.restuarent.find():
        print(f"Email: {doc.get('email')}, Phone: '{doc.get('phone')}'")

if __name__ == "__main__":
    asyncio.run(check_phones())
