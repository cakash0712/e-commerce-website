#!/usr/bin/env python3
"""
Script to update/seed the e-commerce categories with the comprehensive category structure.
Run this script to populate or update the categories collection in MongoDB.

Usage:
    python update_categories.py

This will:
1. Clear existing categories (or update them if they exist)
2. Add all the main categories with their subcategories
"""

import asyncio
import sys
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
from datetime import datetime, timezone

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Comprehensive E-commerce Categories Structure
initial_categories = [
    # 1. Fashion & Apparel
    {
        "name": "Fashion & Apparel",
        "slug": "fashion-apparel",
        "image": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80",
        "subcategories": [
            "Men's Clothing",
            "Women's Clothing",
            "Kids & Baby Clothing",
            "Shoes & Footwear",
            "Bags & Luggage",
            "Accessories",
            "Watches",
            "Jewelry"
        ]
    },
    # 2. Electronics & Technology
    {
        "name": "Electronics & Technology",
        "slug": "electronics-technology",
        "image": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80",
        "subcategories": [
            "Mobile Phones & Accessories",
            "Laptops & Computers",
            "Tablets",
            "Audio",
            "Cameras & Photography",
            "Gaming Consoles & Accessories",
            "Smart Home Devices",
            "Computer Components"
        ]
    },
    # 3. Home, Furniture & Kitchen
    {
        "name": "Home, Furniture & Kitchen",
        "slug": "home-furniture-kitchen",
        "image": "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&q=80",
        "subcategories": [
            "Furniture",
            "Home Décor",
            "Kitchen Appliances",
            "Cookware & Dining",
            "Bedding & Bath",
            "Lighting",
            "Storage & Organization"
        ]
    },
    # 4. Beauty & Personal Care
    {
        "name": "Beauty & Personal Care",
        "slug": "beauty-personal-care",
        "image": "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=500&q=80",
        "subcategories": [
            "Skincare",
            "Haircare",
            "Makeup & Cosmetics",
            "Fragrances",
            "Grooming & Shaving",
            "Personal Hygiene"
        ]
    },
    # 5. Health & Wellness
    {
        "name": "Health & Wellness",
        "slug": "health-wellness",
        "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&q=80",
        "subcategories": [
            "Vitamins & Supplements",
            "Medical Equipment",
            "Fitness Accessories",
            "Wellness Devices"
        ]
    },
    # 6. Sports, Fitness & Outdoors
    {
        "name": "Sports, Fitness & Outdoors",
        "slug": "sports-fitness-outdoors",
        "image": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80",
        "subcategories": [
            "Exercise Equipment",
            "Sportswear",
            "Outdoor Gear",
            "Camping & Hiking",
            "Cycling",
            "Yoga & Meditation"
        ]
    },
    # 7. Baby, Kids & Toys
    {
        "name": "Baby, Kids & Toys",
        "slug": "baby-kids-toys",
        "image": "https://images.unsplash.com/photo-1558877385-1199c1af4e8e?w=500&q=80",
        "subcategories": [
            "Baby Care",
            "Toys & Games",
            "School Supplies",
            "Strollers & Car Seats",
            "Kids Furniture"
        ]
    },
    # 8. Pet Supplies
    {
        "name": "Pet Supplies",
        "slug": "pet-supplies",
        "image": "https://images.unsplash.com/photo-1544568100-847a948585b9?w=500&q=80",
        "subcategories": [
            "Pet Food",
            "Toys & Accessories",
            "Grooming Products",
            "Pet Health"
        ]
    },
    # 9. Books, Media & Stationery
    {
        "name": "Books, Media & Stationery",
        "slug": "books-media-stationery",
        "image": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=80",
        "subcategories": [
            "Books",
            "Magazines",
            "Office Supplies",
            "Art & Craft Supplies"
        ]
    },
    # 10. Automotive & Industrial
    {
        "name": "Automotive & Industrial",
        "slug": "automotive-industrial",
        "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
        "subcategories": [
            "Car Accessories",
            "Spare Parts",
            "Tools & Equipment",
            "Safety Gear"
        ]
    },
    # 11. Grocery & Food
    {
        "name": "Grocery & Food",
        "slug": "grocery-food",
        "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80",
        "subcategories": [
            "Fresh Produce",
            "Packaged Foods",
            "Beverages",
            "Organic & Specialty Foods"
        ]
    },
    # 12. Digital Products & Services
    {
        "name": "Digital Products & Services",
        "slug": "digital-products-services",
        "image": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80",
        "subcategories": [
            "Software",
            "Online Courses",
            "Subscriptions",
            "Digital Downloads"
        ]
    },
    # Optional / Advanced Categories
    {
        "name": "Handmade & Artisan",
        "slug": "handmade-artisan",
        "image": "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=500&q=80",
        "subcategories": []
    },
    {
        "name": "Luxury Goods",
        "slug": "luxury-goods",
        "image": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80",
        "subcategories": []
    },
    {
        "name": "Second-hand & Refurbished",
        "slug": "secondhand-refurbished",
        "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
        "subcategories": []
    },
    {
        "name": "B2B & Wholesale",
        "slug": "b2b-wholesale",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=500&q=80",
        "subcategories": []
    },
    {
        "name": "Custom & Print-on-Demand",
        "slug": "custom-print-demand",
        "image": "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=500&q=80",
        "subcategories": []
    }
]


def create_category_doc(cat):
    """Convert category data to MongoDB document format"""
    return {
        "id": str(uuid.uuid4()),
        "name": cat["name"],
        "slug": cat["slug"],
        "image": cat["image"],
        "subcategories": cat["subcategories"],
        "items": f"{len(cat['subcategories']) * 100}+ Products",
        "link": f"/shop?category={cat['slug']}",
        "created_at": datetime.now(timezone.utc)
    }


async def update_categories(mongo_url, db_name, clear_existing=False):
    """Update the categories collection in MongoDB"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        if clear_existing:
            print("[CLEAR] Clearing existing categories...")
            await db.categories.delete_many({})
        
        print(f"\n[PROCESSING] Processing {len(initial_categories)} main categories...")
        
        total_subcategories = 0
        for cat in initial_categories:
            doc = create_category_doc(cat)
            sub_count = len(cat['subcategories'])
            total_subcategories += sub_count
            
            # Check if category already exists by name or slug
            existing = await db.categories.find_one({
                "$or": [
                    {"name": cat["name"]},
                    {"slug": cat["slug"]}
                ]
            })
            
            if existing:
                # Update existing category
                await db.categories.update_one(
                    {"id": existing["id"]},
                    {"$set": doc}
                )
                print(f"  [UPDATE] {cat['name']} ({sub_count} subcategories)")
            else:
                # Insert new category
                await db.categories.insert_one(doc)
                print(f"  [ADD] {cat['name']} ({sub_count} subcategories)")
        
        print(f"\n[SUCCESS] Categories updated successfully!")
        print(f"   Total main categories: {len(initial_categories)}")
        print(f"   Total subcategories: {total_subcategories}")
        
        # Verify the update
        cat_count = await db.categories.count_documents({})
        print(f"   Documents in collection: {cat_count}")
        
        return True
        
    except Exception as e:
        print(f"\n[ERROR] Error updating categories: {e}")
        return False
    finally:
        client.close()


async def list_categories(mongo_url, db_name):
    """List all categories in the database"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        print("\n[LIST] Current Categories in Database:")
        print("=" * 60)
        
        categories_cursor = db.categories.find().sort("name", 1)
        async for cat in categories_cursor:
            sub_count = len(cat.get('subcategories', []))
            sub_names = cat.get('subcategories', [])[:3]  # Show first 3
            sub_preview = ", ".join(sub_names) + ("..." if sub_count > 3 else "")
            
            print(f"\n[CAT] {cat['name']}")
            print(f"    Slug: {cat.get('slug', 'N/A')}")
            print(f"    Subcategories ({sub_count}): {sub_preview}")
            print(f"    Items: {cat.get('items', '0 Products')}")
            print(f"    Link: {cat.get('link', 'N/A')}")
        
        print("\n" + "=" * 60)
        
    except Exception as e:
        print(f"\n[ERROR] Error listing categories: {e}")
    finally:
        client.close()


async def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Update e-commerce categories')
    parser.add_argument('--clear', action='store_true', help='Clear existing categories before adding new ones')
    parser.add_argument('--list', action='store_true', help='List current categories in database')
    parser.add_argument('--yes', action='store_true', help='Skip confirmation prompts')
    args = parser.parse_args()
    
    # Get MongoDB connection info
    mongo_url = str(ROOT_DIR / '.env')
    # Try to load from .env file
    from dotenv import dotenv_values
    env_values = dotenv_values(ROOT_DIR / '.env')
    
    mongo_url = env_values.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = env_values.get('DB_NAME', 'ecommerce')
    
    print("[CONFIG] E-commerce Category Updater")
    print("=" * 60)
    print(f"[INFO] MongoDB URL: {mongo_url}")
    print(f"[INFO] Database: {db_name}")
    
    if args.list:
        await list_categories(mongo_url, db_name)
        return
    
    if args.clear and not args.yes:
        confirm = input("\n[WARNING] This will DELETE all existing categories. Continue? (yes/no): ")
        if confirm.lower() != 'yes':
            print("Cancelled.")
            return
    
    success = await update_categories(mongo_url, db_name, clear_existing=args.clear)
    
    if success:
        await list_categories(mongo_url, db_name)
    
    return 0 if success else 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
