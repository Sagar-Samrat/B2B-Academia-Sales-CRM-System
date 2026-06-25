from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .db import get_db_collection
from .auth import get_password_hash
from .routes import auth, institutions, contacts, meetings, followups, proposals, dashboard, reports, ai, notifications
from .utils import log_activity, create_notification
import uuid
from datetime import datetime, timedelta

app = FastAPI(
    title="B2B Academia Sales CRM API",
    description="Backend API for managing institutional academic partnerships, sales tracking, and AI insights.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For demo / ease of setup
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(institutions.router, prefix="/api")
app.include_router(contacts.router, prefix="/api")
app.include_router(meetings.router, prefix="/api")
app.include_router(followups.router, prefix="/api")
app.include_router(proposals.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Academia B2B CRM API Server",
        "timestamp": datetime.utcnow().isoformat()
    }

def seed_database():
    users_coll = get_db_collection("users")
    if users_coll.find_one():
        print("Database already seeded. Skipping...")
        return
        
    print("Seeding database with mock data...")
    
    # 1. Seed Users (passwords are 'admin123' and 'sales123')
    admin_user = {
        "_id": str(uuid.uuid4()),
        "name": "Admin Director",
        "email": "admin@crm.com",
        "role": "Admin",
        "password": get_password_hash("admin123")
    }
    sales_user = {
        "_id": str(uuid.uuid4()),
        "name": "Alex Mercer",
        "email": "sales@crm.com",
        "role": "Sales Executive",
        "password": get_password_hash("sales123")
    }
    users_coll.insert_one(admin_user)
    users_coll.insert_one(sales_user)
    
    # 2. Seed Institutions
    inst_coll = get_db_collection("institutions")
    
    inst1_id = str(uuid.uuid4())
    inst1 = {
        "_id": inst1_id,
        "college_name": "MIT CSAIL",
        "location": "Cambridge, MA",
        "institution_type": "University",
        "student_strength": 1400,
        "program_interest": "Cloud Computing Certification",
        "lead_source": "Website",
        "lead_status": "Closed Won",
        "assigned_sales_executive": "sales@crm.com",
        "website": "https://mit.edu",
        "notes": "Interested in a long term partnership for graduate workshops.",
        "created_at": (datetime.utcnow() - timedelta(days=30)).isoformat()
    }
    
    inst2_id = str(uuid.uuid4())
    inst2 = {
        "_id": inst2_id,
        "college_name": "Stanford Engineering",
        "location": "Stanford, CA",
        "institution_type": "University",
        "student_strength": 1800,
        "program_interest": "AI/ML Internship",
        "lead_source": "Referral",
        "lead_status": "Negotiation",
        "assigned_sales_executive": "sales@crm.com",
        "website": "https://stanford.edu",
        "notes": "Dean requested detailed syllabus and cost model.",
        "created_at": (datetime.utcnow() - timedelta(days=20)).isoformat()
    }
    
    inst3_id = str(uuid.uuid4())
    inst3 = {
        "_id": inst3_id,
        "college_name": "Georgia Tech Placement Cell",
        "location": "Atlanta, GA",
        "institution_type": "University",
        "student_strength": 2500,
        "program_interest": "Web Dev Workshop",
        "lead_source": "LinkedIn",
        "lead_status": "Meeting Scheduled",
        "assigned_sales_executive": "sales@crm.com",
        "website": "https://gatech.edu",
        "notes": "Wants a summer workshop scheduled for 3rd year engineering students.",
        "created_at": (datetime.utcnow() - timedelta(days=15)).isoformat()
    }
    
    inst4_id = str(uuid.uuid4())
    inst4 = {
        "_id": inst4_id,
        "college_name": "Boston University CS Dept",
        "location": "Boston, MA",
        "institution_type": "Degree College",
        "student_strength": 1200,
        "program_interest": "Cybersecurity Training",
        "lead_source": "Cold Call",
        "lead_status": "New Lead",
        "assigned_sales_executive": "admin@crm.com",
        "website": "https://bu.edu",
        "notes": "HOD was receptive, asked to send materials.",
        "created_at": (datetime.utcnow() - timedelta(days=5)).isoformat()
    }
    
    inst5_id = str(uuid.uuid4())
    inst5 = {
        "_id": inst5_id,
        "college_name": "University of Texas at Austin",
        "location": "Austin, TX",
        "institution_type": "University",
        "student_strength": 3200,
        "program_interest": "Full Stack Boot Camp",
        "lead_source": "Event",
        "lead_status": "Proposal Sent",
        "assigned_sales_executive": "sales@crm.com",
        "website": "https://utexas.edu",
        "notes": "Proposal sent for 120 credits license. Awaiting response.",
        "created_at": (datetime.utcnow() - timedelta(days=8)).isoformat()
    }
    
    inst_coll.insert_one(inst1)
    inst_coll.insert_one(inst2)
    inst_coll.insert_one(inst3)
    inst_coll.insert_one(inst4)
    inst_coll.insert_one(inst5)
    
    # 3. Seed Contacts
    contacts_coll = get_db_collection("contacts")
    
    contacts_coll.insert_one({
        "_id": str(uuid.uuid4()),
        "institution_id": inst1_id,
        "name": "Dr. Bob Johnson",
        "designation": "Lab Administrator",
        "department": "Computer Science",
        "email": "bob.j@mit.edu",
        "phone": "+1 617-555-0192"
    })
    contacts_coll.insert_one({
        "_id": str(uuid.uuid4()),
        "institution_id": inst2_id,
        "name": "Dr. Alice Smith",
        "designation": "HOD, Computer Science",
        "department": "Engineering Department",
        "email": "alice.smith@stanford.edu",
        "phone": "+1 650-555-0143"
    })
    contacts_coll.insert_one({
        "_id": str(uuid.uuid4()),
        "institution_id": inst3_id,
        "name": "Carol Danvers",
        "designation": "Placement Officer",
        "department": "Corporate Relations Cell",
        "email": "carol.d@gatech.edu",
        "phone": "+1 404-555-0211"
    })
    
    # 4. Seed Meetings
    meetings_coll = get_db_collection("meetings")
    
    meetings_coll.insert_one({
        "_id": str(uuid.uuid4()),
        "institution_id": inst3_id,
        "institution_name": "Georgia Tech Placement Cell",
        "meeting_date": datetime.utcnow().strftime("%Y-%m-%d"),
        "meeting_time": "14:00",
        "meeting_mode": "Online",
        "google_meet_link": "https://meet.google.com/abc-defg-hij",
        "agenda": "Review syllabus alignment and batch timings for the Web Dev Workshop.",
        "meeting_notes": "First meeting on pricing completed. Today we align on course structure.",
        "status": "Scheduled"
    })
    meetings_coll.insert_one({
        "_id": str(uuid.uuid4()),
        "institution_id": inst2_id,
        "institution_name": "Stanford Engineering",
        "meeting_date": (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d"),
        "meeting_time": "11:00",
        "meeting_mode": "Online",
        "google_meet_link": "https://meet.google.com/xyz-qprs-tuv",
        "agenda": "Present proposal details and pricing model to the Dean.",
        "meeting_notes": "",
        "status": "Scheduled"
    })
    
    # 5. Seed Follow-ups
    followups_coll = get_db_collection("followups")
    
    followups_coll.insert_one({
        "_id": str(uuid.uuid4()),
        "institution_id": inst2_id,
        "institution_name": "Stanford Engineering",
        "assigned_to": "sales@crm.com",
        "followup_date": (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d"),
        "reminder_time": "09:30",
        "reminder_type": "Call",
        "notes": "Call CS Dept HOD to follow up on curriculum approval.",
        "status": "Pending"
    })
    followups_coll.insert_one({
        "_id": str(uuid.uuid4()),
        "institution_id": inst4_id,
        "institution_name": "Boston University CS Dept",
        "assigned_to": "admin@crm.com",
        "followup_date": (datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%d"),
        "reminder_time": "15:00",
        "reminder_type": "Email",
        "notes": "Email brochure for Cybersecurity program to the dean.",
        "status": "Pending"
    })
    
    # 6. Seed Proposals
    proposals_coll = get_db_collection("proposals")
    
    proposals_coll.insert_one({
        "_id": str(uuid.uuid4()),
        "institution_id": inst1_id,
        "institution_name": "MIT CSAIL",
        "proposal_title": "Cloud Computing certification - 100 students",
        "proposal_amount": 45000.0,
        "proposal_status": "Accepted",
        "proposal_file": "/proposals/proposal_mit.pdf",
        "sent_date": (datetime.utcnow() - timedelta(days=10)).strftime("%Y-%m-%d")
    })
    proposals_coll.insert_one({
        "_id": str(uuid.uuid4()),
        "institution_id": inst5_id,
        "institution_name": "University of Texas at Austin",
        "proposal_title": "Full Stack Bootcamp MoU",
        "proposal_amount": 35000.0,
        "proposal_status": "Sent",
        "proposal_file": "/proposals/proposal_utaustin.pdf",
        "sent_date": (datetime.utcnow() - timedelta(days=3)).strftime("%Y-%m-%d")
    })
    
    # 7. Seed Notifications
    notifications_coll = get_db_collection("notifications")
    
    notifications_coll.insert_one({
        "_id": str(uuid.uuid4()),
        "title": "Proposal Approved",
        "message": "MIT CSAIL has officially accepted the Cloud Computing proposal of $45,000.",
        "type": "proposal",
        "is_read": False,
        "created_at": (datetime.utcnow() - timedelta(hours=5)).isoformat()
    })
    notifications_coll.insert_one({
        "_id": str(uuid.uuid4()),
        "title": "Meeting scheduled today",
        "message": "You have a meeting with Georgia Tech Placement Cell at 2:00 PM.",
        "type": "meeting",
        "is_read": False,
        "created_at": datetime.utcnow().isoformat()
    })
    
    # 8. Activity Logs
    activity_logs = get_db_collection("activity_logs")
    
    activity_logs.insert_one({
        "_id": str(uuid.uuid4()),
        "user_name": "System",
        "user_email": "system@crm.com",
        "action": "Seeded Database",
        "details": "Initialized CRM database with demo data.",
        "timestamp": datetime.utcnow().isoformat()
    })
    activity_logs.insert_one({
        "_id": str(uuid.uuid4()),
        "user_name": "Alex Mercer",
        "user_email": "sales@crm.com",
        "action": "Updated Institution",
        "details": "Moved Stanford Engineering status to Negotiation",
        "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat()
    })
    
    print("Database seeding completed.")

@app.on_event("startup")
def startup_db_seed():
    seed_database()
