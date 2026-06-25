from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from ..models import UserCreate, UserLogin, UserResponse
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user
from ..db import get_db_collection
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate):
    users_coll = get_db_collection("users")
    
    # Check email domain limits (B2B corporate/academic email requirement)
    email_lower = user_in.email.lower().strip()
    if email_lower.endswith("@gmail.com") or "@gmail." in email_lower:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="B2B CRM requires professional or corporate emails. Personal Gmail accounts are not allowed."
        )
    
    # Check if user already exists
    existing_user = users_coll.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    hashed_password = get_password_hash(user_in.password)
    user_dict = user_in.dict()
    user_dict["password"] = hashed_password
    user_dict["_id"] = str(uuid.uuid4())
    
    users_coll.insert_one(user_dict)
    
    # Return user details
    return user_dict

@router.post("/login")
def login(credentials: UserLogin):
    users_coll = get_db_collection("users")
    user = users_coll.find_one({"email": credentials.email})
    
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user["email"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "id": str(user["_id"])
        }
    }

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: dict = Depends(get_current_user)):
    return current_user
