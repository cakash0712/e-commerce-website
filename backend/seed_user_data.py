import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import datetime
import uuid

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB config
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'ecommerce_db')

async def seed_user_data():
    print(f"Connecting to MongoDB at {mongo_url}...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Sample Content Library Data
    content_library = [
        {
            "id": "1",
            "title": "Minecraft: Java Edition",
            "type": "Game",
            "date": "Jan 15, 2024",
            "img": "https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=100&q=80"
        },
        {
            "id": "2",
            "title": "Atomic Habits - eBook",
            "type": "Book",
            "date": "Dec 22, 2023",
            "img": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100&q=80"
        },
        {
            "id": "3",
            "title": "Adobe Creative Cloud (1 Year)",
            "type": "Software",
            "date": "Nov 05, 2023",
            "img": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&q=80"
        }
    ]

    # Sample Device Data
    devices = [
        {
            "id": "1",
            "name": "Akash's iPhone 14 Pro",
            "type": "Smartphone",
            "lastActive": "Active now",
            "icon_type": "smartphone"
        },
        {
            "id": "2",
            "name": "MacBook Air M2",
            "type": "Laptop",
            "lastActive": "Active 2h ago",
            "icon_type": "laptop"
        },
        {
            "id": "3",
            "name": "iPad Air 4th Gen",
            "type": "Tablet",
            "lastActive": "Active yesterday",
            "icon_type": "tablet"
        }
    ]

    print("Updating users with mock Content Library and Devices data...")
    
    # Update all users
    result = await db.users.update_many(
        {}, 
        {
            "$set": {
                "content_library": content_library,
                "devices": devices
            }
        }
    )
    
    print(f"Updated {result.modified_count} users.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_user_data())
