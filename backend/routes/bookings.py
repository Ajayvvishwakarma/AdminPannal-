from fastapi import APIRouter
from db import bookings_collection

router = APIRouter()

@router.get("/")
async def get_bookings():
    data = list(bookings_collection.find({}, {"_id": 0}))
    return data