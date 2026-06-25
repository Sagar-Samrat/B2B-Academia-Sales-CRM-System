from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from ..models import InstitutionCreate, InstitutionUpdate, InstitutionResponse
from ..auth import get_current_user, require_admin
from ..db import get_db_collection
from ..utils import log_activity, create_notification
import uuid
from datetime import datetime

router = APIRouter(prefix="/institutions", tags=["Institutions"])

@router.get("", response_model=dict)
def get_institutions(
    search: Optional[str] = Query(None, description="Search by college name, location, or program interest"),
    status: Optional[str] = Query(None, description="Filter by Lead Status"),
    type: Optional[str] = Query(None, description="Filter by Institution Type"),
    source: Optional[str] = Query(None, description="Filter by Lead Source"),
    assigned: Optional[str] = Query(None, description="Filter by Assigned Sales Executive (email)"),
    sort_by: str = Query("college_name", description="Field to sort by"),
    sort_order: str = Query("asc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    current_user: dict = Depends(get_current_user)
):
    inst_coll = get_db_collection("institutions")
    contacts_coll = get_db_collection("contacts")
    
    # Build query
    query = {}
    if status:
        query["lead_status"] = status
    if type:
        query["institution_type"] = type
    if source:
        query["lead_source"] = source
    if assigned:
        query["assigned_sales_executive"] = assigned
        
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        # In Mongo/JSON fallback, we can use an OR search.
        # For standard mongo we use $or, let's implement $or check or do regex filter in Python / Mongo.
        # Pymongo supports $or. Our JSON Fallback find supports basic dict matching, let's make sure it handles search.
        # Actually, let's write a query builder that supports search in a Mongo-compatible way.
        # In db.py, JSONCollection.find handles dict matching. Let's make sure it handles basic $or if we use it, 
        # or we can filter in python if fallback is active. Python filtering is extremely simple and robust.
        query["$or"] = [
            {"college_name": search_regex},
            {"location": search_regex},
            {"program_interest": search_regex}
        ]

    # For JSON fallback, handling $or in find() can be tricky, so let's check db type.
    # In db.py, JSONCollection find is basic. Let's fetch all records and filter in Python if not MongoDB, 
    # to avoid complex query parser implementations. This is extremely safe and easy!
    from ..db import is_mongodb
    
    if not is_mongodb:
        # Fetch all from JSON
        all_records = inst_coll.find()
        # Filter in Python
        filtered = []
        for r in all_records:
            # Check filters
            if status and r.get("lead_status") != status:
                continue
            if type and r.get("institution_type") != type:
                continue
            if source and r.get("lead_source") != source:
                continue
            if assigned and r.get("assigned_sales_executive") != assigned:
                continue
            if search:
                s_lower = search.lower()
                name_match = s_lower in r.get("college_name", "").lower()
                loc_match = s_lower in r.get("location", "").lower()
                prog_match = s_lower in r.get("program_interest", "").lower()
                if not (name_match or loc_match or prog_match):
                    continue
            filtered.append(r)
        records = filtered
    else:
        # Real MongoDB query
        # Remove $or if search is empty
        if not search:
            query.pop("$or", None)
        else:
            # Reformat search regex for pymongo
            query["$or"] = [
                {"college_name": {"$regex": search, "$options": "i"}},
                {"location": {"$regex": search, "$options": "i"}},
                {"program_interest": {"$regex": search, "$options": "i"}}
            ]
        records = inst_coll.find(query)
        # Convert to list to sort and paginate
        records = list(records)

    # Sort
    reverse = (sort_order.lower() == "desc")
    records.sort(key=lambda x: str(x.get(sort_by, "")).lower(), reverse=reverse)

    # Paginate
    total = len(records)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_records = records[start_idx:end_idx]

    # Populate contacts for each institution
    result_list = []
    for inst in paginated_records:
        inst_id = str(inst.get("_id"))
        inst["_id"] = inst_id
        # Fetch contacts
        contacts = list(contacts_coll.find({"institution_id": inst_id}))
        for c in contacts:
            c["_id"] = str(c["_id"])
        inst["contacts"] = contacts
        result_list.append(inst)

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": result_list
    }

@router.get("/{inst_id}", response_model=InstitutionResponse)
def get_institution(inst_id: str, current_user: dict = Depends(get_current_user)):
    inst_coll = get_db_collection("institutions")
    contacts_coll = get_db_collection("contacts")
    
    inst = inst_coll.find_one({"_id": inst_id})
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    inst["_id"] = str(inst["_id"])
    contacts = list(contacts_coll.find({"institution_id": inst_id}))
    for c in contacts:
        c["_id"] = str(c["_id"])
    inst["contacts"] = contacts
    return inst

@router.post("", response_model=InstitutionResponse)
def create_institution(inst_in: InstitutionCreate, current_user: dict = Depends(get_current_user)):
    inst_coll = get_db_collection("institutions")
    
    inst_dict = inst_in.dict()
    inst_dict["_id"] = str(uuid.uuid4())
    inst_dict["created_at"] = datetime.utcnow().isoformat()
    
    inst_coll.insert_one(inst_dict)
    inst_dict["contacts"] = []
    
    log_activity(
        current_user,
        "Created Institution",
        f"Registered college {inst_in.college_name} with status {inst_in.lead_status}"
    )
    create_notification(
        "New Lead Created",
        f"{inst_in.college_name} has been added by {current_user.get('name')}.",
        "info"
    )
    return inst_dict

@router.put("/{inst_id}", response_model=InstitutionResponse)
def update_institution(inst_id: str, inst_in: InstitutionUpdate, current_user: dict = Depends(get_current_user)):
    inst_coll = get_db_collection("institutions")
    contacts_coll = get_db_collection("contacts")
    
    existing = inst_coll.find_one({"_id": inst_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    update_data = {k: v for k, v in inst_in.dict(exclude_unset=True).items() if v is not None}
    
    # Handle status changes for notifications
    status_changed = "lead_status" in update_data and update_data["lead_status"] != existing.get("lead_status")
    
    updated = inst_coll.update_one({"_id": inst_id}, {"$set": update_data})
    
    # Re-fetch
    inst = inst_coll.find_one({"_id": inst_id})
    inst["_id"] = str(inst["_id"])
    contacts = list(contacts_coll.find({"institution_id": inst_id}))
    for c in contacts:
        c["_id"] = str(c["_id"])
    inst["contacts"] = contacts
    
    log_activity(
        current_user,
        "Updated Institution",
        f"Modified fields of {inst.get('college_name')}: {', '.join(update_data.keys())}"
    )
    
    if status_changed:
        create_notification(
            "Lead Status Updated",
            f"{inst.get('college_name')} status changed to {update_data['lead_status']}.",
            "proposal" if "Proposal" in update_data["lead_status"] else "info"
        )
        
    return inst

@router.delete("/{inst_id}")
def delete_institution(inst_id: str, current_user: dict = Depends(require_admin)):
    inst_coll = get_db_collection("institutions")
    contacts_coll = get_db_collection("contacts")
    
    existing = inst_coll.find_one({"_id": inst_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    inst_coll.delete_one({"_id": inst_id})
    # Cascade delete contacts
    contacts_coll.delete_one({"institution_id": inst_id})
    
    log_activity(
        current_user,
        "Deleted Institution",
        f"Deleted college {existing.get('college_name')} and associated contacts"
    )
    return {"message": f"Institution {existing.get('college_name')} successfully deleted."}
