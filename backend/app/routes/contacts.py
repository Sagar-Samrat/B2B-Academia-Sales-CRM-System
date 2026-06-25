from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..models import ContactCreate, ContactUpdate, ContactResponse
from ..auth import get_current_user
from ..db import get_db_collection
from ..utils import log_activity
import uuid

router = APIRouter(prefix="/contacts", tags=["Contacts"])

@router.get("/institution/{inst_id}", response_model=List[ContactResponse])
def get_contacts_by_institution(inst_id: str, current_user: dict = Depends(get_current_user)):
    contacts_coll = get_db_collection("contacts")
    contacts = contacts_coll.find({"institution_id": inst_id})
    for c in contacts:
        c["_id"] = str(c["_id"])
    return contacts

@router.post("/institution/{inst_id}", response_model=ContactResponse)
def create_contact(inst_id: str, contact_in: ContactCreate, current_user: dict = Depends(get_current_user)):
    inst_coll = get_db_collection("institutions")
    contacts_coll = get_db_collection("contacts")
    
    inst = inst_coll.find_one({"_id": inst_id})
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    contact_dict = contact_in.dict()
    contact_dict["_id"] = str(uuid.uuid4())
    contact_dict["institution_id"] = inst_id
    
    contacts_coll.insert_one(contact_dict)
    
    log_activity(
        current_user,
        "Created Contact",
        f"Added contact {contact_in.name} ({contact_in.designation}) for {inst.get('college_name')}"
    )
    return contact_dict

@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(contact_id: str, contact_in: ContactUpdate, current_user: dict = Depends(get_current_user)):
    contacts_coll = get_db_collection("contacts")
    
    existing = contacts_coll.find_one({"_id": contact_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    update_data = {k: v for k, v in contact_in.dict(exclude_unset=True).items() if v is not None}
    contacts_coll.update_one({"_id": contact_id}, {"$set": update_data})
    
    updated = contacts_coll.find_one({"_id": contact_id})
    updated["_id"] = str(updated["_id"])
    
    log_activity(
        current_user,
        "Updated Contact",
        f"Modified contact details of {updated.get('name')}"
    )
    return updated

@router.delete("/{contact_id}")
def delete_contact(contact_id: str, current_user: dict = Depends(get_current_user)):
    contacts_coll = get_db_collection("contacts")
    
    existing = contacts_coll.find_one({"_id": contact_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    contacts_coll.delete_one({"_id": contact_id})
    
    log_activity(
        current_user,
        "Deleted Contact",
        f"Removed contact {existing.get('name')} from system"
    )
    return {"message": f"Contact {existing.get('name')} successfully removed."}
