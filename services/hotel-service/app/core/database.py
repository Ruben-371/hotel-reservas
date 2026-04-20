import os
import motor.motor_asyncio

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017")
MONGO_DB = os.getenv("MONGO_DB", "hotels_db")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[MONGO_DB]
