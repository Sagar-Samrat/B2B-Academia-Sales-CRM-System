from pydantic import BaseModel, EmailStr, Field, HttpUrl
from typing import Optional, List
from datetime import datetime, date, time

# User Models
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "Sales Executive"  # "Admin" or "Sales Executive"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str = Field(..., alias="_id")

    class Config:
        populate_by_name = True

# Contact Models
class ContactBase(BaseModel):
    name: str
    designation: str
    department: str
    email: EmailStr
    phone: str

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class ContactResponse(ContactBase):
    id: str = Field(..., alias="_id")
    institution_id: str

    class Config:
        populate_by_name = True

# Institution Models
class InstitutionBase(BaseModel):
    college_name: str
    location: str
    institution_type: str  # "University", "Engineering College", "Management Institute", "Degree College"
    student_strength: int
    program_interest: str  # e.g., "Web Dev Workshop", "Cloud Computing Certification", "AI/ML Internship"
    lead_source: str       # "Website", "Referral", "Cold Call", "Event", "LinkedIn"
    lead_status: str = "New Lead"  # "New Lead", "Contacted", "Meeting Scheduled", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"
    assigned_sales_executive: str  # Email or Name of sales rep
    website: str
    notes: Optional[str] = ""

class InstitutionCreate(InstitutionBase):
    pass

class InstitutionUpdate(BaseModel):
    college_name: Optional[str] = None
    location: Optional[str] = None
    institution_type: Optional[str] = None
    student_strength: Optional[int] = None
    program_interest: Optional[str] = None
    lead_source: Optional[str] = None
    lead_status: Optional[str] = None
    assigned_sales_executive: Optional[str] = None
    website: Optional[str] = None
    notes: Optional[str] = None

class InstitutionResponse(InstitutionBase):
    id: str = Field(..., alias="_id")
    contacts: List[ContactResponse] = []
    created_at: Optional[str] = None

    class Config:
        populate_by_name = True

# Follow-up Models
class FollowupBase(BaseModel):
    institution_id: str
    institution_name: Optional[str] = ""
    assigned_to: str
    followup_date: str  # YYYY-MM-DD
    reminder_time: str  # HH:MM
    reminder_type: str  # "Call", "Email", "Meeting", "WhatsApp"
    notes: Optional[str] = ""
    status: str = "Pending"  # "Pending", "Completed", "Missed"

class FollowupCreate(FollowupBase):
    pass

class FollowupUpdate(BaseModel):
    followup_date: Optional[str] = None
    reminder_time: Optional[str] = None
    reminder_type: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class FollowupResponse(FollowupBase):
    id: str = Field(..., alias="_id")

    class Config:
        populate_by_name = True

# Meeting Models
class MeetingBase(BaseModel):
    institution_id: str
    institution_name: Optional[str] = ""
    meeting_date: str  # YYYY-MM-DD
    meeting_time: str  # HH:MM
    meeting_mode: str  # "Online", "In-person"
    google_meet_link: Optional[str] = ""
    agenda: str
    meeting_notes: Optional[str] = ""
    status: str = "Scheduled"  # "Scheduled", "Completed", "Cancelled"

class MeetingCreate(MeetingBase):
    pass

class MeetingUpdate(BaseModel):
    meeting_date: Optional[str] = None
    meeting_time: Optional[str] = None
    meeting_mode: Optional[str] = None
    google_meet_link: Optional[str] = None
    agenda: Optional[str] = None
    meeting_notes: Optional[str] = None
    status: Optional[str] = None

class MeetingResponse(MeetingBase):
    id: str = Field(..., alias="_id")

    class Config:
        populate_by_name = True

# Proposal Models
class ProposalBase(BaseModel):
    institution_id: str
    institution_name: Optional[str] = ""
    proposal_title: str
    proposal_amount: float
    proposal_status: str = "Draft"  # "Draft", "Sent", "Accepted", "Rejected"
    proposal_file: Optional[str] = ""
    sent_date: Optional[str] = None  # YYYY-MM-DD

class ProposalCreate(ProposalBase):
    pass

class ProposalUpdate(BaseModel):
    proposal_title: Optional[str] = None
    proposal_amount: Optional[float] = None
    proposal_status: Optional[str] = None
    proposal_file: Optional[str] = None
    sent_date: Optional[str] = None

class ProposalResponse(ProposalBase):
    id: str = Field(..., alias="_id")

    class Config:
        populate_by_name = True

# AI Insights Models
class AIInsightResponse(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    institution_id: str
    lead_priority_score: int
    priority_level: str  # "High", "Medium", "Low"
    reason: str
    next_best_action: str
    personalized_outreach_email: str
    personalized_whatsapp_message: str
    recommended_followup_date: str
    suggested_meeting_agenda: str
    created_at: Optional[str] = None

    class Config:
        populate_by_name = True

# Notification Models
class NotificationResponse(BaseModel):
    id: str = Field(..., alias="_id")
    title: str
    message: str
    type: str  # "followup", "meeting", "proposal", "info"
    is_read: bool = False
    created_at: str

    class Config:
        populate_by_name = True

# Activity Log Models
class ActivityLogResponse(BaseModel):
    id: str = Field(..., alias="_id")
    user_name: str
    user_email: str
    action: str
    details: str
    timestamp: str

    class Config:
        populate_by_name = True
