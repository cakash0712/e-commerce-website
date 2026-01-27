import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

async def test():
    products = await db.products.find({}, {'_id': 0}).to_list(10)
    print(products)

asyncio.run(test())