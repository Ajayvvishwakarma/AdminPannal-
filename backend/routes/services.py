from fastapi import APIRouter, HTTPException
from typing import List
from uuid import uuid4

router = APIRouter()

# 🔧 Temporary in-memory database (later MongoDB laga denge)
services_db = [
    {
        "id": str(uuid4()),
        "name": "General Service",
        "category": "Maintenance",
        "vehicle_type": "bike",
        "price": 499,
        "duration_minutes": 60
    },
    {
        "id": str(uuid4()),
        "name": "Car Wash",
        "category": "Cleaning",
        "vehicle_type": "car",
        "price": 299,
        "duration_minutes": 30
    }
]

# ✅ GET all services
@router.get("/", response_model=List[dict])
def get_services():
    return services_db


# ✅ GET single service
@router.get("/{service_id}")
def get_service(service_id: str):
    for service in services_db:
        if service["id"] == service_id:
            return service
    raise HTTPException(status_code=404, detail="Service not found")


# ✅ CREATE service
@router.post("/")
def create_service(service: dict):
    service["id"] = str(uuid4())
    services_db.append(service)
    return {"message": "Service created", "data": service}


# ✅ UPDATE service
@router.put("/{service_id}")
def update_service(service_id: str, updated_data: dict):
    for service in services_db:
        if service["id"] == service_id:
            service.update(updated_data)
            return {"message": "Service updated", "data": service}
    raise HTTPException(status_code=404, detail="Service not found")


# ✅ DELETE service
@router.delete("/{service_id}")
def delete_service(service_id: str):
    for service in services_db:
        if service["id"] == service_id:
            services_db.remove(service)
            return {"message": "Service deleted"}
    raise HTTPException(status_code=404, detail="Service not found")