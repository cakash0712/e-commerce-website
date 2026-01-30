from fastapi import APIRouter
from database import db

router = APIRouter()

@router.get("/force_approve/{vendor_name}")
async def force_approve(vendor_name: str):
    result = await db.vendors.update_one(
        {"name": vendor_name},
        {"$set": {"status": "active"}}
    )
    return {"matched": result.matched_count, "modified": result.modified_count}
