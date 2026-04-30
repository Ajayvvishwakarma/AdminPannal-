from fastapi import APIRouter
from db import users_collection
from auth import create_token

router = APIRouter()

@router.post("/login")
async def login(data: dict):
    user = users_collection.find_one({"email": data["email"]})

    if not user or user["password"] != data["password"]:
        return {"error": "Invalid credentials"}

    token = create_token({"user_id": str(user["_id"])})
    return {"access_token": token}