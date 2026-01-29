
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def approve_vendor(vendor_email):
    mongo_url = os.getenv("MONGO_URL")
    db_name = os.getenv("DB_NAME", "ecommerce_db")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # First, let's find the vendor to make sure they exist
    vendor = await db.vendors.find_one({"email": vendor_email})
    if not vendor:
        print(f"No vendor found with email: {vendor_email}")
        return

    print(f"Found vendor: {vendor.get('business_name')} (Status: {vendor.get('status')})")
    
    result = await db.vendors.update_one(
        {"email": vendor_email},
        {"$set": {"status": "active"}}
    )
    
    if result.modified_count > 0:
        print(f"Successfully approved vendor with email: {vendor_email}")
    elif vendor.get('status') == 'active':
        print(f"Vendor {vendor_email} is already active.")
    else:
        print(f"Failed to update status for {vendor_email}. Matches: {result.matched_count}, Modified: {result.modified_count}")

if __name__ == "__main__":
    email = "kishorepa64@gmail.com"
    asyncio.run(approve_vendor(email))
