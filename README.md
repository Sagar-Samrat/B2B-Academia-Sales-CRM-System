# B2B Academia Sales CRM System 🚀

A modern, production-quality AI-powered B2B Academia Sales CRM designed for companies partnering with colleges and universities to deliver technical training programs, workshops, certifications, and industry initiatives. 

The system features a premium glassmorphic SaaS interface similar to HubSpot and Notion, supporting light/dark theme toggles, fluid transitions, global search palette, and a live AI chat assistant widget.

---

## 🛠️ Technology Stack
* **Frontend**: React.js, Tailwind CSS v4, Lucide Icons, Recharts, Framer Motion
* **Backend**: FastAPI (Python), PyJWT (Authentication), Pydantic (Schema Validation)
* **Database**: MongoDB (PyMongo) with an **automatic disk-serialization fallback** (`academia_crm_data.json`) if MongoDB is not running locally.
* **AI Integration**: Google Gemini / OpenAI (configurable in settings)

---

## 🌟 Key Features

1. **Dashboard Analytics**:
   * Modern KPI cards for total revenue, deal sizes, and conversion rates.
   * Interactive Recharts widgets (Area and Pie charts) displaying status distributions and monthly value trends.
   * Live collaboration activity logs and upcoming meeting agendas.

2. **Institution Management (Leads)**:
   * Multi-filter toolbar (Lead Status, Institution Type, Assigned rep, Search queries).
   * Double-pane grid view & list view.
   * Click-to-open **Detail Drawer** displaying institutional properties, internal notes, nested contact cards, and active proposals.

3. **Kanban Board**:
   * Interactive board tracking leads across 7 stages: *New Lead, Contacted, Meeting Scheduled, Proposal Sent, Negotiation, Closed Won, Closed Lost*.
   * Drag-and-drop or simple status toggles to transition leads.

4. **AI Lead Intelligence & Outreach**:
   * Analyzes partnership deals, generates a lead priority score (0-100), and provides logic reasoning.
   * Auto-drafts personalized cold emails and WhatsApp outreach copy with context tags.

5. **Meetings & Follow-ups**:
   * Monthly calendar grid highlighting scheduled meetings.
   * Daily scheduler forms with google meet links, agendas, and follow-up type reminders (Call, Email, WhatsApp).

6. **Proposals Registry**:
   * Tracks proposal titles, client associations, sent dates, and deal amounts.

7. **Global Navigation & Search**:
   * **Command Palette (`Ctrl + K` / `Cmd + K`)** to search across all colleges, contacts, or jump to navigation tabs.
   * Collapsible floating **AI Chat Copilot Widget** answering questions like *"How many institutions?"* or *"What is our revenue?"*.

8. **Notifications & Role Security**:
   * Notification Center panel for upcoming proposals and scheduling events.
   * Role-based permissions preventing Sales reps from deleting records (Admin-only privilege).

---

## 👥 Demo Credentials
You can log in immediately using the prefilled buttons on the Login page or use the credentials below:

### 👤 Admin Account
* **Email**: `admin@crm.com`
* **Password**: `admin123`
* **Role**: `Admin`

### 💼 Sales Executive Account
* **Email**: `sales@crm.com`
* **Password**: `sales123`
* **Role**: `Sales Executive`

---

## 🚀 Getting Started

### 1. Backend Setup (FastAPI)
Navigate to the backend directory, set up your python environment, install packages, and start the server:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --port 8000 --reload
```
*Note: The server will automatically seed 5 mock universities if the database is empty.*

### 2. Frontend Setup (React + Vite)
Navigate to the frontend directory, install npm packages, and launch the dev environment:

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to explore the CRM app.

---

## 🧪 Testing & Validation
The backend endpoints can be verified by running the Pytest suite:
```bash
cd backend
python3 -m pytest -v test_api.py
```
For production deployment, compile the React assets into static files:
```bash
cd frontend
npm run build
```
