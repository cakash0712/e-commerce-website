import requests
import asyncio
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://localhost:8000"
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "DACHcart")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

def test_persistence():
    print("Checking root...")
    try:
        r = requests.get(f"{BASE_URL}/")
        print(f"Root: {r.status_code}")
        r = requests.get(f"{BASE_URL}/api/")
        print(f"API Root: {r.status_code}")
        r = requests.post(f"{BASE_URL}/api/users/login")
        print(f"Login (Method Allowed?): {r.status_code}")
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    print("1. Logging in...")
    # Use valid unique credentials
    import time
    timestamp = int(time.time())
    email = f"test_persist_{timestamp}@example.com"
    phone = f"555{timestamp}" 
    password = "password123"

    print(f"Creating user {email}...")
    # Signup
    signup_res = requests.post(f"{BASE_URL}/api/users/signup", json={
        "name": "Persistence Tester",
        "email": email,
        "phone": phone,
        "password": password,
        "user_type": "user"
    })
    print(f"Signup: {signup_res.status_code}")

    login_res = requests.post(f"{BASE_URL}/api/users/login", json={
        "identifier": email,
        "password": password,
        "user_type": "user"
    })
    
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.status_code} {login_res.text}")
        return

    token = login_res.json()["token"]
    user_id = login_res.json()["id"]
    print(f"Logged in. User ID: {user_id}")
    headers = {"Authorization": f"Bearer {token}"}

    # Test Delivery Location
    print("\n2. Testing Delivery Location Update...")
    loc_payload = {"delivery_location": "Test City 123456"}
    res = requests.put(f"{BASE_URL}/api/users/delivery-location", json=loc_payload, headers=headers)
    print(f"API Response: {res.status_code} - {res.text}")

    # Verify directly in DB
    user_doc = db.users.find_one({"id": user_id})
    db_loc = user_doc.get("delivery_location")
    print(f"DB Value: {db_loc}")
    if db_loc == "Test City 123456":
        print("SUCCESS: Delivery location persisted.")
    else:
        print("FAILURE: Delivery location mismatch.")

    # Test Recently Viewed
    print("\n3. Testing Recently Viewed Update...")
    viewed_ids = ["prod-1", "prod-2", "prod-3"]
    res = requests.put(f"{BASE_URL}/api/users/recently-viewed", json=viewed_ids, headers=headers)
    print(f"API Response: {res.status_code} - {res.text}")

    # Verify directly in DB
    user_doc = db.users.find_one({"id": user_id})
    db_viewed = user_doc.get("recently_viewed")
    print(f"DB Value: {db_viewed}")
    
    if db_viewed == viewed_ids:
        print("SUCCESS: Recently viewed persisted.")
    else:
        print("FAILURE: Recently viewed mismatch.")


if __name__ == "__main__":
    test_persistence()
