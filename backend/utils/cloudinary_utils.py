import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary
# Note: User must set these in their .env file
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def upload_image(file_path):
    """
    Uploads an image to Cloudinary and returns the URL.
    """
    try:
        result = cloudinary.uploader.upload(file_path, folder="shopsea/products")
        return result.get("secure_url")
    except Exception as e:
        print(f"Cloudinary upload failed: {e}")
        return None

def delete_image(public_id):
    """
    Deletes an image from Cloudinary.
    """
    try:
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception as e:
        print(f"Cloudinary deletion failed: {e}")
        return False
