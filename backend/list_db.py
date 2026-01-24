
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

for p in db.products.find():
    print(f"Product: {p.get('name')[:50]}... | Status: {p.get('status')} | VendorID: {p.get('vendor_id')} | Image: {p.get('image')}")

for v in db.vendors.find():
    print(f"Vendor: {v.get('business_name')} | ID: {v.get('id')}")
