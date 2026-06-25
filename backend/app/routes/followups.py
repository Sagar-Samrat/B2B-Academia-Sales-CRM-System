from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from ..models import FollowupCreate, FollowupUpdate, FollowupResponse
from ..auth import get_current_user
from ..db import get_db_collection
from ..utils import log_activity, create_notification
import uuid
from datetime import datetime

router = APIRouter(prefix="/followups", tags=["Follow-ups"])

@router.get("", response_model=List[FollowupResponse])
def get_followups(assigned_to: Optional[str] = None, status: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    followups_coll = get_db_collection("followups")
    
    query = {}
    if assigned_to:
        query["assigned_to"] = assigned_to
    if status:
        query["status"] = status
        
    followups = followups_coll.find(query)
    result = []
    for f in followups:
        f["_id"] = str(f["_id"])
        result.append(f)
        
    # Sort followups by date/time ascending by default
    result.sort(key=lambda x: (x.get("followup_date", ""), x.get("reminder_time", "")))
    return result

@router.post("", response_model=FollowupResponse)
def create_followup(followup_in: FollowupCreate, current_user: dict = Depends(get_current_user)):
    inst_coll = get_db_collection("institutions")
    followups_coll = get_db_collection("followups")
    
    inst = inst_coll.find_one({"_id": followup_in.institution_id})
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    followup_dict = followup_in.dict()
    followup_dict["_id"] = str(uuid.uuid4())
    followup_dict["institution_name"] = inst.get("college_name")
    
    followups_coll.insert_one(followup_dict)
    
    log_activity(
        current_user,
        "Created Follow-up",
        f"Scheduled a follow-up ({followup_in.reminder_type}) for {inst.get('college_name')} on {followup_in.followup_date}"
    )
    create_notification(
        "Follow-up Scheduled",
        f"Reminder created for {inst.get('college_name')} on {followup_in.followup_date} via {followup_in.reminder_type}.",
        "followup"
    )
    return followup_dict

@router.put("/{followup_id}", response_model=FollowupResponse)
def update_followup(followup_id: str, followup_in: FollowupUpdate, current_user: dict = Depends(get_current_user)):
    followups_coll = get_db_collection("followups")
    
    existing = followups_coll.find_one({"_id": followup_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Follow-up not found")
        
    update_data = {k: v for k, v in followup_in.dict(exclude_unset=True).items() if v is not None}
    
    # Check if status has changed
    status_changed = "status" in update_data and update_data["status"] != existing.get("status")
    
    followups_coll.update_one({"_id": followup_id}, {"$set": update_data})
    
    updated = followups_coll.find_one({"_id": followup_id})
    updated["_id"] = str(updated["_id"])
    
    log_activity(
        current_user,
        "Updated Follow-up",
        f"Updated follow-up for {updated.get('institution_name')} to status {updated.get('status')}"
    )
    
    if status_changed and updated.get("status") == "Completed":
        create_notification(
            "Follow-up Completed",
            f"Follow-up reminder for {updated.get('institution_name')} marked as Completed.",
            "info"
        )
        
    return updated

@router.delete("/{followup_id}")
def delete_followup(followup_id: str, current_user: dict = Depends(get_current_user)):
    followups_coll = get_db_collection("followups")
    
    existing = followups_coll.find_one({"_id": followup_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Follow-up not found")
        
    followups_coll.delete_one({"_id": followup_id})
    
    log_activity(
        current_user,
        "Deleted Follow-up",
        f"Removed follow-up reminder for {existing.get('institution_name')} scheduled on {existing.get('followup_date')}"
    )
    return {"message": "Follow-up successfully deleted."}
