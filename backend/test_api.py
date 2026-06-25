import pytest
from fastapi.testclient import TestClient
from app.main import app, seed_database
from app.db import get_db_collection, is_mongodb

@pytest.fixture(scope="module", autouse=True)
def clean_and_seed_db():
    # Clear all collections to ensure a clean test state
    collections = ["users", "institutions", "contacts", "meetings", "followups", "proposals", "notifications", "activity_logs", "ai_insights"]
    for name in collections:
        coll = get_db_collection(name)
        if is_mongodb:
            coll.delete_many({})
        else:
            coll.db.data[name] = []
            coll.db.save()
            
    # Explicitly seed database after clearing
    seed_database()
    yield

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
    assert "service" in response.json()

def test_auth_login(client):
    # Test login with seeded sales credentials
    response = client.post("/api/auth/login", json={
        "email": "sales@crm.com",
        "password": "sales123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "sales@crm.com"
    assert data["user"]["role"] == "Sales Executive"

def test_auth_login_invalid(client):
    # Test login with wrong password
    response = client.post("/api/auth/login", json={
        "email": "sales@crm.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "detail" in response.json()

def test_auth_register_existing(client):
    # Test registering existing user
    response = client.post("/api/auth/register", json={
        "name": "Alex Mercer Duplicate",
        "email": "sales@crm.com",
        "role": "Sales Executive",
        "password": "salespassword"
    })
    assert response.status_code == 400
    assert "detail" in response.json()

def test_get_dashboard_without_auth(client):
    # Get dashboard without JWT
    response = client.get("/api/dashboard")
    assert response.status_code == 401

def test_full_flow(client):
    # 1. Login
    login_resp = client.post("/api/auth/login", json={
        "email": "sales@crm.com",
        "password": "sales123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get Dashboard
    dash_resp = client.get("/api/dashboard", headers=headers)
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    assert dash_data["kpis"]["total_institutions"] == 5
    assert dash_data["kpis"]["closed_deals"] == 1
    
    # 3. Create a new Institution
    new_inst = {
        "college_name": "Harvard University",
        "location": "Cambridge, MA",
        "institution_type": "University",
        "student_strength": 2000,
        "program_interest": "Blockchain Workshop",
        "lead_source": "Website",
        "lead_status": "New Lead",
        "assigned_sales_executive": "sales@crm.com",
        "website": "https://harvard.edu",
        "notes": "Testing institution creation"
    }
    create_resp = client.post("/api/institutions", json=new_inst, headers=headers)
    assert create_resp.status_code == 200
    inst_id = create_resp.json()["_id"]
    
    # 4. Create Contact for it
    new_contact = {
        "name": "Dr. John Harvard",
        "designation": "Director of CS Placement",
        "department": "Computer Science Cell",
        "email": "john.harvard@harvard.edu",
        "phone": "+1 617-555-9000"
    }
    contact_resp = client.post(f"/api/contacts/institution/{inst_id}", json=new_contact, headers=headers)
    assert contact_resp.status_code == 200
    
    # 5. Check if contact appears in institution details
    inst_details = client.get(f"/api/institutions/{inst_id}", headers=headers)
    assert len(inst_details.json()["contacts"]) == 1
    assert inst_details.json()["contacts"][0]["name"] == "Dr. John Harvard"
    
    # 6. Generate AI Insights for Harvard
    ai_resp = client.post("/api/ai/insights", json={"institution_id": inst_id}, headers=headers)
    assert ai_resp.status_code == 200
    assert "lead_priority_score" in ai_resp.json()
    assert "personalized_outreach_email" in ai_resp.json()

if __name__ == "__main__":
    import pytest
    import sys
    sys.exit(pytest.main(["-v", __file__]))
