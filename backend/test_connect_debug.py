
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import ssl

async def test_connection(name, **kwargs):
    load_dotenv()
    mongo_url = os.environ.get('MONGO_URL')
    print(f"\n--- Testing connection: {name} ---")
    print(f"Options: {kwargs}")
    try:
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000, **kwargs)
        await client.admin.command('ismaster')
        print(f"SUCCESS: {name}")
        return True
    except Exception as e:
        print(f"FAILED: {name} - {e}")
        return False
    finally:
        if 'client' in locals():
            client.close()

async def run_tests():
    # Test 1: Default
    await test_connection("Default")
    
    # Test 2: tlsAllowInvalidCertificates
    await test_connection("tlsAllowInvalidCertificates", tlsAllowInvalidCertificates=True)
    
    # Test 3: Explicit tls=True
    await test_connection("Explicit TLS", tls=True)

    # Test 4: Higher timeout
    await test_connection("High Timeout", connectTimeoutMS=30000, socketTimeoutMS=30000)

if __name__ == "__main__":
    asyncio.run(run_tests())
