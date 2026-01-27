import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

count = 0
for p in db.products.find():
    image = p.get('image', 'No image')
    print(f'Product {count+1}: {p.get("name")[:30]}... | Image: {image}')
    count += 1

print(f'Total products: {count}')