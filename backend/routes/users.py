from fastapi import APIRouter, HTTPException

router = APIRouter()

# demo admin
fake_user = {
    "email": "admin@ridenrepair.com",
    "password": "admin123"
}

@router.post("/login")
def login(user: dict):
    if user["email"] == fake_user["email"] and user["password"] == fake_user["password"]:
        return {
            "access_token": "admin-token",
            "user": {
                "email": user["email"],
                "role": "admin"
            }
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")