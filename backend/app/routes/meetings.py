from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from ..models import MeetingCreate, MeetingUpdate, MeetingResponse
from ..auth import get_current_user
from ..db import get_db_collection
from ..utils import log_activity, create_notification
import uuid
from datetime import datetime

router = APIRouter(prefix="/meetings", tags=["Meetings"])

@router.get("", response_model=List[MeetingResponse])
def get_meetings(institution_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    meetings_coll = get_db_collection("meetings")
    
    query = {}
    if institution_id:
        query["institution_id"] = institution_id
        
    meetings = meetings_coll.find(query)
    result = []
    for m in meetings:
        m["_id"] = str(m["_id"])
        result.append(m)
        
    # Sort meetings by date/time ascending by default
    result.sort(key=lambda x: (x.get("meeting_date", ""), x.get("meeting_time", "")))
    return result

@router.post("", response_model=MeetingResponse)
def create_meeting(meeting_in: MeetingCreate, current_user: dict = Depends(get_current_user)):
    inst_coll = get_db_collection("institutions")
    meetings_coll = get_db_collection("meetings")
    
    inst = inst_coll.find_one({"_id": meeting_in.institution_id})
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    meet_dict = meeting_in.dict()
    meet_dict["_id"] = str(uuid.uuid4())
    meet_dict["institution_name"] = inst.get("college_name")
    
    # Auto-generate a dummy Google Meet link if Online and not provided
    if meeting_in.meeting_mode == "Online" and not meeting_in.google_meet_link:
        meet_dict["google_meet_link"] = f"https://meet.google.com/{uuid.uuid4().hex[:3]}-{uuid.uuid4().hex[:4]}-{uuid.uuid4().hex[:3]}"
        
    meetings_coll.insert_one(meet_dict)
    
    # Update lead status if it was New Lead or Contacted to Meeting Scheduled
    if inst.get("lead_status") in ["New Lead", "Contacted"]:
        inst_coll.update_one({"_id": meeting_in.institution_id}, {"$set": {"lead_status": "Meeting Scheduled"}})
        create_notification(
            "Lead Status Updated",
            f"{inst.get('college_name')} status updated to 'Meeting Scheduled'.",
            "meeting"
        )

    log_activity(
        current_user,
        "Scheduled Meeting",
        f"Scheduled {meeting_in.meeting_mode} meeting with {inst.get('college_name')} on {meeting_in.meeting_date}"
    )
    create_notification(
        "Meeting Scheduled",
        f"Meeting scheduled with {inst.get('college_name')} for {meeting_in.meeting_date} at {meeting_in.meeting_time}.",
        "meeting"
    )
    return meet_dict

@router.put("/{meeting_id}", response_model=MeetingResponse)
def update_meeting(meeting_id: str, meeting_in: MeetingUpdate, current_user: dict = Depends(get_current_user)):
    meetings_coll = get_db_collection("meetings")
    
    existing = meetings_coll.find_one({"_id": meeting_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    update_data = {k: v for k, v in meeting_in.dict(exclude_unset=True).items() if v is not None}
    
    meetings_coll.update_one({"_id": meeting_id}, {"$set": update_data})
    
    updated = meetings_coll.find_one({"_id": meeting_id})
    updated["_id"] = str(updated["_id"])
    
    log_activity(
        current_user,
        "Updated Meeting",
        f"Updated details for meeting with {updated.get('institution_name')}"
    )
    return updated

@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: str, current_user: dict = Depends(get_current_user)):
    meetings_coll = get_db_collection("meetings")
    
    existing = meetings_coll.find_one({"_id": meeting_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    meetings_coll.delete_one({"_id": meeting_id})
    
    log_activity(
        current_user,
        "Deleted Meeting",
        f"Cancelled meeting scheduled with {existing.get('institution_name')} on {existing.get('meeting_date')}"
    )
    return {"message": "Meeting successfully deleted."}
