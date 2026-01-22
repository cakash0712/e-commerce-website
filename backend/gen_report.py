
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

with open('db_report.txt', 'w', encoding='utf-8') as f:
    f.write("--- Products ---\n")
    for p in db.products.find():
        f.write(f"Name: {p.get('name')} | Status: {p.get('status')} | Vendor ID: {p.get('vendor_id')}\n")

    f.write("\n--- Vendors ---\n")
    for v in db.vendors.find():
        f.write(f"Name: {v.get('business_name')} | ID: {v.get('id')}\n")
