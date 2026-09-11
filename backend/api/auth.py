from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from models.schemas import UserCreate, Token
from services.auth import get_password_hash, verify_password, create_access_token
from config import ACCESS_TOKEN_EXPIRE_MINUTES
from database import get_database

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=dict)
async def register(user: UserCreate):
    db = get_database()
    users_collection = db["users"]
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_password = get_password_hash(user.password)
    new_user = {
        "username": user.username,
        "hashed_password": hashed_password
    }
    
    await users_collection.insert_one(new_user)
    return {"message": "User created successfully"}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    users_collection = db["users"]
    
    user = await users_collection.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
