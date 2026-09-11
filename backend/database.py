from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI

client = None
db = None

def get_database():
    return db

def connect_to_mongo():
    global client, db
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.get_database("minelawgpt")
    print("Connected to MongoDB!")

def close_mongo_connection():
    global client
    if client is not None:
        client.close()
        print("MongoDB connection closed.")
