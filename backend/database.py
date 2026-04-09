import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("DATABASE_URL", "mongodb://localhost:27017")

client = MongoClient(MONGODB_URL)
db = client["e-commerce"]

def get_db():
    yield db
