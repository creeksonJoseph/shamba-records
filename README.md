# SmartSeason Field Monitoring System

A full-stack web application designed to track crop progress across multiple fields during a growing season. Built as a technical assignment.

## Tech Stack
- **Backend:** Django & Django REST Framework (Python)
- **Frontend:** React, Vite, React Router v6, TailwindCSS, React Query
- **Database:** SQLite (default for easy assessment review, completely swappable for PostgreSQL via `settings.py`)

---

## 1. Setup Instructions

You will need Python 3.10+ and Node.js 18+ installed on your system.

### Starting the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
5. Run migrations and start the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```
   The backend will be available at `http://127.0.0.1:8000`.

### Running Tests
To run the automated test suite for the backend:
1. Ensure your virtual environment is active in the `backend/` directory.
2. Execute `pytest`:
   ```bash
   pytest
   ```

### Starting the Frontend
1. Open a new terminal tab and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install NodeJS dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

### API Interactivity
The backend API exposes RESTful endpoints at `http://127.0.0.1:8000/api/`.

---

## 2. Demo Credentials

To make testing easy, the following demo users are seeded by default when you run the project (or can be easily verified/re-created from the Django admin if needed).

**Admin (Coordinator):**
- Email: `admin@smartseason.com`
- Password: `smartadmin123`

**Field Agent:**
- Email: `agent@smartseason.com`
- Password: `smartagent123`

---

## 3. Design Decisions & Trade-offs

#### The Data Model: Separation of Fields and Plants
While the prompt states a field should have a "Name, Crop type, Planting date, Current stage", I structured the data model to separate **Fields** from **Plants (Crops)**. 
- A **Field** is a physical location (e.g., "North Block").
- A **Plant** represents a specific crop lifecycle occurring on a field (e.g., "Maize").
This is a more robust, scalable design because a single physical Field can host multiple crop cycles across different seasons, retaining historical data without overwriting the Field record. The prompt permitted structuring the data model as seen fit, and this normalization guarantees better long-term analytics.

#### Frontend Architecture
I intentionally decoupled the frontend from Server Side Rendering frameworks (like Next.js or TanStack Start) and used a classic **Vite SPA with React Router v6**. This provides a heavily simplified deployment model, eliminates double-rendering bugs with authentication localStorage state, and provides incredible snappy performance for a dashboard architecture.

#### Authentication
I utilized SimpleJWT to manage authentication. The tokens map seamlessly to the frontend via an `AuthGuard` layout wrapper which forces login, whereas an `AdminGuard` wrapper restricts explicit UI routes (like User Management) instantly without needing to make round-trip network queries.

---

## 4. Field Status Logic

The status of a crop is strictly **computed automatically** by the Django model upon saving, based on the following algorithm:

1. **Completed:** If a crop's current stage is manually updated to `harvested`, the system permanently considers the crop completely finished and marks the status as `completed`.
2. **At Risk:** The system takes the `planting_date` and adds `expected_days` to determine an expected harvest date. If the crop is completely past its harvest date but has still not been marked as "harvested" or "ready", the plant is flagged as `at_risk`.
3. **Active:** All other plants that are growing functionally within their expected timeframe remain `active`.

---

## 5. Assumptions Made
- **Database:** SQLite is intentionally left as the persistent database rather than forcing a heavy Dockerized PostgreSQL orchestration. Since this is an assessment meant to be reviewed locally by an evaluator, reducing the barrier-to-entry for starting the application is prioritized. Django's ORM ensures the code behaves identically regardless of the underlying DB.
- **Agent Filtering:** It was assumed that an Admin Coordinator orchestrates the entire farm architecture, therefore creating new `Fields` or giving out user accounts belongs only to Admins. Agents log in solely to maintain the integrity of their daily `Plants` logs.

