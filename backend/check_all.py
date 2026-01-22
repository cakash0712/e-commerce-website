
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

print("--- Products ---")
for p in db.products.find():
    print(f"Name: {p.get('name')} | Status: {p.get('status')} | Vendor ID: {p.get('vendor_id')}")

print("\n--- Vendors ---")
for v in db.vendors.find():
    print(f"Name: {v.get('business_name')} | ID: {v.get('id')}")
