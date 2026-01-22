
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

p = db.products.find_one()
v = db.vendors.find_one()

if p:
    print(f"PRODUCT_ID: {p.get('id')}")
    print(f"PRODUCT_VENDOR_ID: {p.get('vendor_id')}")
    print(f"PRODUCT_STATUS: {p.get('status')}")

if v:
    print(f"VENDOR_ID: {v.get('id')}")
    print(f"VENDOR_NAME: {v.get('business_name')}")
