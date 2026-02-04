
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def deep_inspect():
    url = os.getenv("MONGO_URL")
    client = AsyncIOMotorClient(url)
    db = client["restuarent"]
    
    print("--- FULL Partner List ---")
    async for doc in db.restuarent.find():
        print(f"ID: {doc.get('id')}, Email: '{doc.get('email')}', Phone: '{doc.get('phone')}'")

if __name__ == "__main__":
    asyncio.run(deep_inspect())
