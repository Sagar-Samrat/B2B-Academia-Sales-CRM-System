from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import json
import re
import uuid
from ..models import AIInsightResponse
from ..auth import get_current_user
from ..db import get_db_collection
from ..config import settings
from ..utils import log_activity

router = APIRouter(prefix="/ai", tags=["AI Lead Intelligence"])

class ChatRequest(BaseModel):
    message: str

class InsightsRequest(BaseModel):
    institution_id: str

def generate_insights_live(inst: dict, api_key: str, provider: str = "gemini") -> dict:
    prompt = f"""
    Analyze the following B2B academic partnership lead and output a JSON object containing:
    1. "lead_priority_score": integer between 1 and 100
    2. "priority_level": "High", "Medium", or "Low"
    3. "reason": detailed explanation of the score and level based on student strength, program interest, and source
    4. "next_best_action": concrete sales task to execute next
    5. "personalized_outreach_email": professional sales pitch email using the institution details
    6. "personalized_whatsapp_message": concise WhatsApp follow-up message
    7. "recommended_followup_date": date string (YYYY-MM-DD) about 3-5 days in the future
    8. "suggested_meeting_agenda": a short bulleted meeting agenda structure

    Lead Details:
    College Name: {inst.get('college_name')}
    Location: {inst.get('location')}
    Institution Type: {inst.get('institution_type')}
    Student Strength: {inst.get('student_strength')}
    Program Interest: {inst.get('program_interest')}
    Lead Source: {inst.get('lead_source')}
    Lead Status: {inst.get('lead_status')}

    Return ONLY raw JSON, with no markdown code blocks or extra text.
    """
    
    if provider == "gemini":
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        text = response.text
    else:
        import openai
        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        text = response.choices[0].message.content

    # Parse JSON
    try:
        # Clean potential markdown wrapping
        cleaned = re.sub(r'```json\s*|\s*```', '', text.strip())
        return json.loads(cleaned)
    except Exception as e:
        print(f"Error parsing live LLM response: {e}. Content: {text}")
        raise ValueError("Could not parse AI response as JSON")

def generate_insights_fallback(inst: dict) -> dict:
    # Context-aware fallback generator
    name = inst.get('college_name', 'Institution')
    interest = inst.get('program_interest', 'Technical Training')
    location = inst.get('location', 'Location')
    strength = inst.get('student_strength', 500)
    source = inst.get('lead_source', 'Cold Call')
    
    # Calculate deterministic priority
    score = 50
    if strength > 1000:
        score += 20
    if source in ["Website", "Referral"]:
        score += 15
    if inst.get('lead_status') == "Meeting Scheduled":
        score += 10
        
    score = min(score, 98)
    
    if score >= 80:
        priority = "High"
    elif score >= 60:
        priority = "Medium"
    else:
        priority = "Low"
        
    reason = (
        f"This institution has a enrollment size of {strength} students, representing high engagement potential for '{interest}'. "
        f"The lead source is '{source}' which usually yields receptive prospects. The location in {location} is highly accessible."
    )
    
    next_action = f"Reach out to the Head of Placement/CS Department at {name} to propose a customized syllabus outline for '{interest}'."
    
    email = f"""Subject: Industry Collaboration Proposal: {interest} | {name}

Dear Director / Placement Officer,

I hope this email finds you well.

I am writing from our Academic Relations division. We partner with leading institutions like {name} to prepare engineering and technical graduates for global careers. We notice a strong demand from students in the {location} region for industry-aligned certification in {interest}.

We would love to discuss implementing our technical training and certification programs for your students. We handle the syllabus alignment, cloud labs, and placement drives.

Could we schedule a brief 10-minute introductory call next Tuesday or Wednesday to explore this partnership?

Warm regards,
[Sales Executive]
Technical Partnerships Manager
"""

    whatsapp = (
        f"Hello! I am [Sales Executive] from the Industry Partnerships team. We are introducing our technical certification in {interest} "
        f"for students at {name}. Would love to share our curriculum draft. Can we connect briefly? Thanks!"
    )
    
    rec_date = (datetime.utcnow() + timedelta(days=4)).strftime("%Y-%m-%d")
    
    agenda = (
        "1. Brief introduction of technical training scope.\n"
        "2. Review of syllabus alignment with university regulations.\n"
        "3. Lab credits allocation & student certification fees.\n"
        "4. Q&A and next steps for MoU signing."
    )
    
    return {
        "lead_priority_score": score,
        "priority_level": priority,
        "reason": reason,
        "next_best_action": next_action,
        "personalized_outreach_email": email.strip(),
        "personalized_whatsapp_message": whatsapp,
        "recommended_followup_date": rec_date,
        "suggested_meeting_agenda": agenda
    }

@router.post("/insights", response_model=AIInsightResponse)
def get_insights(req: InsightsRequest, current_user: dict = Depends(get_current_user)):
    inst_coll = get_db_collection("institutions")
    insights_coll = get_db_collection("ai_insights")
    
    inst = inst_coll.find_one({"_id": req.institution_id})
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    # Check if we already have insights, if so we can just return or overwrite. Let's overwrite/re-generate.
    ai_key = settings.GEMINI_API_KEY or current_user.get("gemini_api_key")
    openai_key = settings.OPENAI_API_KEY
    
    data = None
    if ai_key:
        try:
            data = generate_insights_live(inst, ai_key, provider="gemini")
        except Exception as e:
            print(f"Gemini API failure: {e}. Falling back...")
    elif openai_key:
        try:
            data = generate_insights_live(inst, openai_key, provider="openai")
        except Exception as e:
            print(f"OpenAI API failure: {e}. Falling back...")
            
    if not data:
        data = generate_insights_fallback(inst)
        
    data["institution_id"] = req.institution_id
    data["created_at"] = datetime.utcnow().isoformat()
    
    # Store or Update in database
    existing_insight = insights_coll.find_one({"institution_id": req.institution_id})
    if existing_insight:
        insights_coll.update_one({"_id": existing_insight["_id"]}, {"$set": data})
        data["_id"] = str(existing_insight["_id"])
    else:
        # Insert
        data["_id"] = str(uuid.uuid4())
        insights_coll.insert_one(data)
        
    log_activity(
        current_user,
        "Generated AI Insights",
        f"Generated priority score of {data['lead_priority_score']}% ({data['priority_level']}) for {inst.get('college_name')}"
    )
    
    return data

@router.post("/generate-email")
def generate_email(req: InsightsRequest, current_user: dict = Depends(get_current_user)):
    inst_coll = get_db_collection("institutions")
    inst = inst_coll.find_one({"_id": req.institution_id})
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    # Generate fallback or live email
    fallback_data = generate_insights_fallback(inst)
    return {
        "email_subject": f"Industry Collaboration Proposal: {inst.get('program_interest')} | {inst.get('college_name')}",
        "email_body": fallback_data["personalized_outreach_email"]
    }

@router.post("/chat")
def chat_assistant(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    # Let's count matching records to answer user queries from database!
    msg = req.message.lower()
    inst_coll = get_db_collection("institutions")
    meetings_coll = get_db_collection("meetings")
    proposals_coll = get_db_collection("proposals")
    
    # Simple semantic router
    if "how many institutions" in msg or "total college" in msg or "total lead" in msg:
        count = len(list(inst_coll.find()))
        reply = f"We currently have **{count} institutions** registered in the CRM."
    elif "won" in msg or "closed won" in msg or "deal closed" in msg:
        won_insts = list(inst_coll.find({"lead_status": "Closed Won"}))
        count = len(won_insts)
        colleges = ", ".join([x.get("college_name") for x in won_insts])
        reply = f"We have secured **{count} Closed Won deals**. {"The successful partnerships are: " + colleges + "." if count > 0 else "We are working on closing our first deals!"}"
    elif "revenue" in msg or "sales figure" in msg or "made" in msg:
        proposals = list(proposals_coll.find({"proposal_status": "Accepted"}))
        revenue = sum(p.get("proposal_amount", 0) for p in proposals)
        reply = f"Our current closed-won revenue is **${revenue:,.2f}** from accepted proposals."
    elif "meeting" in msg or "schedule" in msg:
        meetings = list(meetings_coll.find({"status": "Scheduled"}))
        count = len(meetings)
        reply = f"There are **{count} upcoming meetings** scheduled in the calendar."
    else:
        # Standard intelligent response fallback
        reply = (
            f"Hello {current_user.get('name')}. I am your CRM Assistant. "
            "You can ask me questions like 'How many institutions are in the database?', "
            "'What is our total revenue?', or 'Show me closed won deals'."
        )
        
    return {
        "reply": reply,
        "timestamp": datetime.utcnow().isoformat()
    }
