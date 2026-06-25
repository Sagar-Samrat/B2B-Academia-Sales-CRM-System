from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from ..models import ProposalCreate, ProposalUpdate, ProposalResponse
from ..auth import get_current_user
from ..db import get_db_collection
from ..utils import log_activity, create_notification
import uuid
from datetime import datetime

router = APIRouter(prefix="/proposals", tags=["Proposals"])

@router.get("", response_model=List[ProposalResponse])
def get_proposals(institution_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    proposals_coll = get_db_collection("proposals")
    
    query = {}
    if institution_id:
        query["institution_id"] = institution_id
        
    proposals = proposals_coll.find(query)
    result = []
    for p in proposals:
        p["_id"] = str(p["_id"])
        result.append(p)
        
    result.sort(key=lambda x: x.get("sent_date", "") or "", reverse=True)
    return result

@router.post("", response_model=ProposalResponse)
def create_proposal(proposal_in: ProposalCreate, current_user: dict = Depends(get_current_user)):
    inst_coll = get_db_collection("institutions")
    proposals_coll = get_db_collection("proposals")
    
    inst = inst_coll.find_one({"_id": proposal_in.institution_id})
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    prop_dict = proposal_in.dict()
    prop_dict["_id"] = str(uuid.uuid4())
    prop_dict["institution_name"] = inst.get("college_name")
    if not prop_dict.get("sent_date"):
        prop_dict["sent_date"] = datetime.utcnow().strftime("%Y-%m-%d")
    
    # Auto-generate a dummy PDF proposal link
    prop_dict["proposal_file"] = f"/proposals/proposal_{uuid.uuid4().hex[:6]}.pdf"
    
    proposals_coll.insert_one(prop_dict)
    
    # Update lead status of the institution to Proposal Sent if it was in a lower state
    if inst.get("lead_status") in ["New Lead", "Contacted", "Meeting Scheduled"]:
        inst_coll.update_one({"_id": proposal_in.institution_id}, {"$set": {"lead_status": "Proposal Sent"}})
        create_notification(
            "Lead Status Updated",
            f"{inst.get('college_name')} status updated to 'Proposal Sent'.",
            "proposal"
        )
        
    log_activity(
        current_user,
        "Created Proposal",
        f"Drafted proposal '{proposal_in.proposal_title}' worth ${proposal_in.proposal_amount:,.2f} for {inst.get('college_name')}"
    )
    create_notification(
        "Proposal Sent",
        f"Proposal '{proposal_in.proposal_title}' for ${proposal_in.proposal_amount:,.2f} sent to {inst.get('college_name')}.",
        "proposal"
    )
    return prop_dict

@router.put("/{proposal_id}", response_model=ProposalResponse)
def update_proposal(proposal_id: str, proposal_in: ProposalUpdate, current_user: dict = Depends(get_current_user)):
    proposals_coll = get_db_collection("proposals")
    inst_coll = get_db_collection("institutions")
    
    existing = proposals_coll.find_one({"_id": proposal_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    update_data = {k: v for k, v in proposal_in.dict(exclude_unset=True).items() if v is not None}
    
    status_changed = "proposal_status" in update_data and update_data["proposal_status"] != existing.get("proposal_status")
    
    proposals_coll.update_one({"_id": proposal_id}, {"$set": update_data})
    
    updated = proposals_coll.find_one({"_id": proposal_id})
    updated["_id"] = str(updated["_id"])
    
    log_activity(
        current_user,
        "Updated Proposal",
        f"Updated proposal '{updated.get('proposal_title')}' status to {updated.get('proposal_status')}"
    )
    
    if status_changed:
        new_status = updated.get("proposal_status")
        inst_id = updated.get("institution_id")
        inst = inst_coll.find_one({"_id": inst_id})
        
        if inst:
            # Sync Lead Status
            if new_status == "Accepted":
                inst_coll.update_one({"_id": inst_id}, {"$set": {"lead_status": "Closed Won"}})
                create_notification(
                    "Deal Closed Won!",
                    f"Partnered successfully with {inst.get('college_name')}! Proposal accepted for ${updated.get('proposal_amount'):,.2f}.",
                    "proposal"
                )
            elif new_status == "Rejected":
                inst_coll.update_one({"_id": inst_id}, {"$set": {"lead_status": "Closed Lost"}})
                create_notification(
                    "Proposal Rejected",
                    f"Proposal for {inst.get('college_name')} was marked as rejected.",
                    "info"
                )
            elif new_status == "Sent":
                inst_coll.update_one({"_id": inst_id}, {"$set": {"lead_status": "Proposal Sent"}})
                
    return updated

@router.delete("/{proposal_id}")
def delete_proposal(proposal_id: str, current_user: dict = Depends(get_current_user)):
    proposals_coll = get_db_collection("proposals")
    
    existing = proposals_coll.find_one({"_id": proposal_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    proposals_coll.delete_one({"_id": proposal_id})
    
    log_activity(
        current_user,
        "Deleted Proposal",
        f"Removed proposal '{existing.get('proposal_title')}' associated with {existing.get('institution_name')}"
    )
    return {"message": "Proposal successfully deleted."}
