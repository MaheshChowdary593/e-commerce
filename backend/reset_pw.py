from pymongo import MongoClient
from passlib.context import CryptContext

client = MongoClient('mongodb+srv://Mahesh:Mahi%40665@cluster0.rcy9qs6.mongodb.net/')
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
new_hash = pwd_context.hash('admin123')
client['e-commerce'].login.update_one({'email': 'admin@shopsea.com'}, {'$set': {'hashed_password': new_hash}})
print('Password successfully forced to admin123')
