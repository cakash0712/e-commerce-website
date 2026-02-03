
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import certifi

# Expanded list of Indian States and some major Districts/Cities
INDIA_LOCATIONS = [
    # Andhra Pradesh
    "Visakhapatnam, Andhra Pradesh", "Vijayawada, Andhra Pradesh", "Guntur, Andhra Pradesh", "Nellore, Andhra Pradesh", "Kurnool, Andhra Pradesh",
    # Arunachal Pradesh
    "Itanagar, Arunachal Pradesh", "Tawang, Arunachal Pradesh",
    # Assam
    "Guwahati, Assam", "Silchar, Assam", "Dibrugarh, Assam", "Jorhat, Assam",
    # Bihar
    "Patna, Bihar", "Gaya, Bihar", "Bhagalpur, Bihar", "Muzaffarpur, Bihar", "Purnia, Bihar",
    # Chhattisgarh
    "Raipur, Chhattisgarh", "Bhilai, Chhattisgarh", "Bilaspur, Chhattisgarh", "Korba, Chhattisgarh",
    # Goa
    "Panaji, Goa", "Margao, Goa", "Vasco da Gama, Goa",
    # Gujarat
    "Ahmedabad, Gujarat", "Surat, Gujarat", "Vadodara, Gujarat", "Rajkot, Gujarat", "Bhavnagar, Gujarat", "Jamnagar, Gujarat", "Gandhinagar, Gujarat",
    # Haryana
    "Gurugram, Haryana", "Faridabad, Haryana", "Panipat, Haryana", "Ambala, Haryana", "Rohtak, Haryana", "Hisar, Haryana", "Karnal, Haryana",
    # Himachal Pradesh
    "Shimla, Himachal Pradesh", "Manali, Himachal Pradesh", "Dharamshala, Himachal Pradesh", "Solan, Himachal Pradesh",
    # Jharkhand
    "Ranchi, Jharkhand", "Jamshedpur, Jharkhand", "Dhanbad, Jharkhand", "Bokaro, Jharkhand",
    # Karnataka
    "Bangalore, Karnataka", "Mysore, Karnataka", "Hubli, Karnataka", "Mangalore, Karnataka", "Belgaum, Karnataka", "Gulbarga, Karnataka", "Bellary, Karnataka",
    # Kerala
    "Thiruvananthapuram, Kerala", "Kochi, Kerala", "Kozhikode, Kerala", "Thrissur, Kerala", "Kollam, Kerala", "Kannur, Kerala",
    # Madhya Pradesh
    "Indore, Madhya Pradesh", "Bhopal, Madhya Pradesh", "Jabalpur, Madhya Pradesh", "Gwalior, Madhya Pradesh", "Ujjain, Madhya Pradesh", "Sagar, Madhya Pradesh",
    # Maharashtra
    "Mumbai, Maharashtra", "Pune, Maharashtra", "Nagpur, Maharashtra", "Thane, Maharashtra", "Pimpri-Chinchwad, Maharashtra", "Nashik, Maharashtra", "Kalyan-Dombivli, Maharashtra", "Vasai-Virar, Maharashtra", "Aurangabad, Maharashtra", "Navi Mumbai, Maharashtra",
    # Manipur
    "Imphal, Manipur",
    # Meghalaya
    "Shillong, Meghalaya",
    # Mizoram
    "Aizawl, Mizoram",
    # Nagaland
    "Kohima, Nagaland", "Dimapur, Nagaland",
    # Odisha
    "Bhubaneswar, Odisha", "Cuttack, Odisha", "Rourkela, Odisha", "Berhampur, Odisha", "Sambalpur, Odisha",
    # Punjab
    "Ludhiana, Punjab", "Amritsar, Punjab", "Jalandhar, Punjab", "Patiala, Punjab", "Mohali, Punjab", "Bathinda, Punjab",
    # Rajasthan
    "Jaipur, Rajasthan", "Jodhpur, Rajasthan", "Kota, Rajasthan", "Bikaner, Rajasthan", "Ajmer, Rajasthan", "Udaipur, Rajasthan", "Bhilwara, Rajasthan",
    # Sikkim
    "Gangtok, Sikkim",
    # Tamil Nadu
    "Chennai, Tamil Nadu", "Coimbatore, Tamil Nadu", "Madurai, Tamil Nadu", "Tiruchirappalli, Tamil Nadu", "Salem, Tamil Nadu", "Tirunelveli, Tamil Nadu", "Erode, Tamil Nadu", "Vellore, Tamil Nadu", "Thoothukudi, Tamil Nadu", "Thanjavur, Tamil Nadu", "Dindigul, Tamil Nadu", "Ranipet, Tamil Nadu", "Virudhunagar, Tamil Nadu", "Karur, Tamil Nadu", "Nilgiris, Tamil Nadu", "Kanchipuram, Tamil Nadu", "Chengalpattu, Tamil Nadu", "Tiruppur, Tamil Nadu", "Sivaganga, Tamil Nadu", "Nagapattinam, Tamil Nadu", "Cuddalore, Tamil Nadu", "Kanyakumari, Tamil Nadu", "Nagercoil, Tamil Nadu", "Hosur, Tamil Nadu", "Krishnagiri, Tamil Nadu", "Dharmapuri, Tamil Nadu", "Tiruvallur, Tamil Nadu", "Tiruvannamalai, Tamil Nadu", "Villupuram, Tamil Nadu", "Kallakurichi, Tamil Nadu", "Pudukkottai, Tamil Nadu", "Ramanathapuram, Tamil Nadu", "Ariyalur, Tamil Nadu", "Perambalur, Tamil Nadu", "Namakkal, Tamil Nadu", "Tenkasi, Tamil Nadu", "Theni, Tamil Nadu", "Tiruvarur, Tamil Nadu", "Mayiladuthurai, Tamil Nadu",
    # Telangana
    "Hyderabad, Telangana", "Warangal, Telangana", "Nizamabad, Telangana", "Khammam, Telangana", "Karimnagar, Telangana",
    # Tripura
    "Agartala, Tripura",
    # Uttar Pradesh
    "Lucknow, Uttar Pradesh", "Kanpur, Uttar Pradesh", "Ghaziabad, Uttar Pradesh", "Agra, Uttar Pradesh", "Meerut, Uttar Pradesh", "Varanasi, Uttar Pradesh", "Prayagraj, Uttar Pradesh", "Bareilly, Uttar Pradesh", "Aligarh, Uttar Pradesh", "Moradabad, Uttar Pradesh", "Saharanpur, Uttar Pradesh", "Gorakhpur, Uttar Pradesh", "Noida, Uttar Pradesh", "Greater Noida, Uttar Pradesh",
    # Uttarakhand
    "Dehradun, Uttarakhand", "Haridwar, Uttarakhand", "Haldwani, Uttarakhand", "Roorkee, Uttarakhand",
    # West Bengal
    "Kolkata, West Bengal", "Howrah, West Bengal", "Durgapur, West Bengal", "Asansol, West Bengal", "Siliguri, West Bengal", "Maheshtala, West Bengal",
    # Union Territories
    "Delhi, Delhi", "Chandigarh, Chandigarh", "Puducherry, Puducherry", "Srinagar, Jammu and Kashmir", "Jammu, Jammu and Kashmir", "Leh, Ladakh"
]

async def seed():
    ROOT_DIR = Path(__file__).parent
    load_dotenv(ROOT_DIR / '.env')
    client = AsyncIOMotorClient(os.environ['MONGO_URL'], tlsCAFile=certifi.where())
    db = client['food_delivery']
    
    # Clear existing locations
    await db.locations.delete_many({})
    
    # Prepare documents
    docs = [{"name": loc} for loc in INDIA_LOCATIONS]
    
    if docs:
        await db.locations.insert_many(docs)
        print(f"Successfully seeded {len(docs)} locations to MongoDB.")

if __name__ == "__main__":
    asyncio.run(seed())
