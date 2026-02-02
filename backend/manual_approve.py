from pymongo import MongoClient
import os
import certifi
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.environ['MONGO_URL']
client = MongoClient(mongo_url, tlsCAFile=certifi.where())

# Connect to food_delivery database
db = client['food_delivery']

# Update status to active
result = db.food_vendors.update_one(
    {"email": "aroma@gmail.com"},
    {"$set": {"status": "active"}}
)

print(f"Updated {result.modified_count} vendor(s) to active status.")
