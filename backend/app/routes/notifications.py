from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..models import NotificationResponse
from ..auth import get_current_user
from ..db import get_db_collection

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(current_user: dict = Depends(get_current_user)):
    notif_coll = get_db_collection("notifications")
    notifications = notif_coll.find()
    
    result = []
    for n in notifications:
        n["_id"] = str(n["_id"])
        result.append(n)
        
    # Sort by created_at desc (newest first)
    result.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return result

@router.put("/{notif_id}/read")
def mark_as_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    notif_coll = get_db_collection("notifications")
    
    existing = notif_coll.find_one({"_id": notif_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif_coll.update_one({"_id": notif_id}, {"$set": {"is_read": True}})
    return {"message": "Notification marked as read."}

@router.put("/read-all")
def mark_all_as_read(current_user: dict = Depends(get_current_user)):
    notif_coll = get_db_collection("notifications")
    notifs = notif_coll.find({"is_read": False})
    for n in notifs:
        notif_coll.update_one({"_id": n["_id"]}, {"$set": {"is_read": True}})
    return {"message": "All notifications marked as read."}
