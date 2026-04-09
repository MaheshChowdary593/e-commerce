from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.security import OAuth2PasswordBearer
import schemas
from database import get_db

SECRET_KEY = "your-secret-key-for-jwt-token" # In production, this should be in an environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = schemas.TokenData(id=user_id)
    except JWTError:
        raise credentials_exception
        
    # Try searching by 'id' field first
    user_dict = db.login.find_one({"id": token_data.id})
    if user_dict is None:
        # Fallback to searching by '_id' if 'id' lookup fails (allows migration/manual entries)
        from bson import ObjectId
        try:
            user_dict = db.login.find_one({"_id": ObjectId(token_data.id)})
        except:
            # Maybe it is a string _id
            user_dict = db.login.find_one({"_id": token_data.id})
            
    if user_dict is None:
        raise credentials_exception
        
    # Ensure role and is_blocked are present even if missing in DB for compatibility
    user_dict.setdefault("role", "user")
    user_dict.setdefault("is_blocked", False)
    # Ensure 'id' is present in the object fed to the schema
    if "id" not in user_dict:
        user_dict["id"] = str(user_dict["_id"])
        
    return schemas.User(**user_dict)

def get_current_admin(current_user: schemas.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have sufficient permissions to access this resource"
        )
    return current_user

def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme_optional), db = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        user_dict = db.login.find_one({"id": user_id})
        if user_dict is None:
            return None
        return schemas.User(**user_dict)
    except:
        return None
