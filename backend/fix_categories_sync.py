from pymongo import MongoClient

def fix_categories_sync():
    client = MongoClient('mongodb://localhost:27017')
    db = client.ecommerce
    
    print("Connected to DB.")
    
    # 1. Update products with sub_category 'Mobile Phones' that are in 'Office'
    query = {"sub_category": "Mobile Phones", "category": "Office"}
    update = {"$set": {"category": "Electronics"}}
    
    result = db.products.update_many(query, update)
    print(f"Fixed {result.modified_count} products (Mobile Phones -> Electronics)")
    
    # Check what we have left
    p = db.products.find_one({"sub_category": "Mobile Phones"})
    if p:
        print(f"Sample Mobile Phone Category: {p.get('category')}")

if __name__ == "__main__":
    fix_categories_sync()
