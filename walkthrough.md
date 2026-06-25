# B2B Academia Sales CRM - Walkthrough & Project Explanation

Welcome to the **B2B Academia Sales CRM System**! This document explains the purpose of the application, its architecture, what has been implemented step-by-step, and how to operate and verify it.

---

## 🌟 Project Overview
This B2B Sales CRM is tailored specifically for companies that partner with universities and colleges to offer technical training, workshops, internship programs, and certifications.
It models HubSpot/Salesforce experiences with a premium glassmorphic UI, supporting:
- **Lead and Institution Tracking**: Manage college partnerships across a 7-stage sales funnel.
- **AI-Powered Insights**: Rank leads by priority and auto-draft cold email / WhatsApp outreach materials.
- **Follow-ups and Meetings**: Calendar grids and reminders to keep sales reps productive.
- **Interactive Reports**: Track conversion rates, deal values, and export metrics.
- **Global Search**: Command Palette (`Ctrl+K`) to jump directly to contacts or pages.
- **AI CRM Chatbot**: Collapsible voice/text assistant widget for instant CRM queries.

---

## 🛠️ Tech Stack & Design System
- **Frontend**: React.js, Tailwind CSS v4, Lucide React (Icons), Recharts (Data Visualization), Framer Motion (Transitions).
- **Backend**: FastAPI (Python), PyJWT (Authentication), Pydantic (Validation).
- **Database Layer**: MongoDB client (PyMongo) with an **automatic disk-serialization fallback** (`academia_crm_data.json`) if MongoDB isn't running locally.
- **Design Language**: Harmonized Slate (Light Mode) / Zinc (Dark Mode) colors, semi-transparent overlays, and micro-interactions.

---

## 🚀 Step-by-Step Implementation Timeline

### Phase 1: Database Setup & Seeding
1. **Unified Database Layer**: Built [db.py](file:///Users/sagarsamrat/Desktop/CRM/backend/app/db.py) to transparently route queries to local MongoDB if available, otherwise saving directly to a JSON database on disk.
2. **Auto-Seeding**: Implemented auto-population of 5 real-world demo institutions on startup, complete with related contacts, meetings, proposals, notifications, and logs.

### Phase 2: FastAPI Backend API Building
Implemented secure REST endpoints in `backend/app/routes/`:
- **Auth**: Password hashing via bcrypt, JWT tokens (`/api/auth/login`, `/api/auth/register`).
- **Institutions & Contacts**: Standard CRUD supporting custom filtering and paginated searches.
- **Meetings & Followups**: Organizes schedule times, meeting modes (Online/In-person), and links.
- **AI Router**: Interfaced with Gemini to grade deals, generate reasoning, and draft marketing outreach messages.
- **Dashboard & Reports**: Aggregate statistics (Total Revenue, Closed Won pipeline status ratios) for Recharts.

### Phase 3: React Frontend Architecture & State
1. **Global Contexts**: Built [AuthContext.jsx](file:///Users/sagarsamrat/Desktop/CRM/frontend/src/context/AuthContext.jsx) for stateful session tokens and [ThemeContext.jsx](file:///Users/sagarsamrat/Desktop/CRM/frontend/src/context/ThemeContext.jsx) for persistent Light/Dark state.
2. **Layout & Shell**: Designed a modern sidebar and a responsive navbar with user status, notifications dropdown, and page breadcrumbs.
3. **Command Palette (`Ctrl+K`)**: Intercepts keyboard input to allow quick keyboard searches across the entire platform.

### Phase 4: UI Modules & Pages
- **Login / Signup**: Elegant glassmorphic cards with pre-filled credentials for quick testing.
- **Dashboard**: Recharts Area and Pie charts rendering monthly revenue and status distributions.
- **Institutions (Data Grid)**: Table view and Card grid options. Row clicks open a slide-out drawer displaying interactive sub-tabs for Contacts, Active Proposals, and follow-ups.
- **Kanban Board**: Drag-and-drop or status-button workflow for the 7 stages of partnerships.
- **AI Assistant**: Deals list with priority scores, reasons, and a custom template builder.
- **Reports**: Real-time export buttons and conversions graphs.
- **AI CRM Chatbot**: Collapsible bot widget available on all views to answer queries locally.

---

## 📸 Media Demonstrations & Validation

Here is a visual summary of the validated user flows:

### 1. Main Dashboard View
![Dashboard View](/Users/sagarsamrat/.gemini/antigravity-ide/brain/b2952b46-2461-4461-818c-125e626d6b4c/dashboard_metrics_1782384765088.png)
*Renders active revenue statistics, sales pipelines, monthly closed won deal sizes, and live activity feeds.*

### 2. Institutions Detail Drawer
![Stanford Contact Info](/Users/sagarsamrat/.gemini/antigravity-ide/brain/b2952b46-2461-4461-818c-125e626d6b4c/stanford_contact_info_1782385543947.png)
*Slide-out panel for Stanford Engineering displaying details, contacts list, proposals, and logs.*

### 3. CRM Walkthrough Flow Video
![B2B CRM Flow](/Users/sagarsamrat/.gemini/antigravity-ide/brain/b2952b46-2461-4461-818c-125e626d6b4c/b2b_crm_flow_1782384717743.webp)
*Interactive browser recording showcasing the transition from login to dashboard navigation, contact additions, and detail retrieval.*

---

## 🧪 Verification & Test Success
We wrote automated tests and verified build files:
1. **API Integration Tests**: `test_api.py` checks registration, session tokens, institutional creation, contact associations, and AI endpoints. All tests passed.
2. **Compilation**: `npm run build` compiles Vite assets and outputs clean JS/CSS bundles.
