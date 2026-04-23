# Smart Season Field Monitoring System

A full-stack, production-ready web application designed to track crop progress across multiple fields during a growing season. 

### Live Deployments
- **Frontend App:** [https://smartseas0n.vercel.app/](https://smartseas0n.vercel.app/)
- **Backend API:** [https://shamba-records-rkb7.onrender.com/](https://shamba-records-rkb7.onrender.com/)

## Tech Stack
- **Backend:** Django, Django REST Framework,(Deployed on Render via docker)
- **Frontend:** React, Vite, React Router v6, TailwindCSS, React Query, shadcn/ui (Deployed on Vercel)
- **Database:** PostgreSQL (Neon Serverless Postgres)
- **Containerization:** Multi-stage Dockerfile architecture for isolated, pristine production backend deployment.

---

## Table of Contents
1. [Setup & Deployment Instructions](#1-setup--deployment-instructions)
    - [Local Backend Development](#local-backend-development)
    - [Populating Test Data](#populating-test-data)
    - [Local Frontend Development](#local-frontend-development)
2. [Production Architecture & Performance Patterns](#2-production-architecture--performance-patterns)
    - [Decoupled Deployment Model](#decoupled-deployment-model)
    - [Progressive Rendering (UI Performance)](#progressive-rendering-ui-performance)
3. [Data & Risk Architecture](#3-data--risk-architecture)
    - [Separation of Fields and Plants](#separation-of-fields-and-plants)
    - [Automated Risk Algorithm](#automated-risk-algorithm)
4. [Demo Credentials](#4-demo-credentials)

---

## 1. Setup & Deployment Instructions

### Local Backend Development
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create your `.env` file (ensure your Neon `DATABASE_URL` is configured):
   ```bash
   cp .env.example .env
   ```
3. Build the Docker image:
   ```bash
   docker build -t smartseason-backend .
   ```
4. Run the Docker container (mapping port 8000 and feeding the environment file):
   ```bash
   docker run --env-file .env -p 8000:8000 smartseason-backend
   ```
   *The Django backend will now be cleanly running at `http://127.0.0.1:8000` via Gunicorn in a pristine Docker container without needing any local Python configuration!*

### Populating Test Data
We have a custom management command to effortlessly populate realistic farm data:
```bash
python manage.py seed_db
```
*This command intelligently generates 2 Admins, 3 Agents, 6 Fields, and 20 randomized Plants (with their audit logs) strictly without interfering with any existing production records.*

### Local Frontend Development
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

---

## 2. Production Architecture & Performance Patterns

### Decoupled Deployment Model
- **Vercel (Frontend):** Vercel natively handles the SPA routing. It contains an aggressive preconnect/fetch script injected straight into `index.html` headers-this reaches across the internet to manually "wake up" the Render free-tier instance the literal millisecond a user's browser opens the website.
- **Render (Backend):** Utilizes the `backend/Dockerfile` using a lightweight `python:3.8-slim` image, running `gunicorn` on port 8000. 

### Progressive Rendering (UI Performance)
Rather than locking the browser's main thread and stalling out when the backend returns hundreds of plants or users at a time, the UI takes an advanced React mapping approach:
- **Infinite Scrolling:** Uses hidden Intersection Observers that slice the React components dynamically. It instantly paints 12 cards on screen to keep the UI snappy, silently generating chunks of data as you scroll downward.
- **Dashboard Staggering:** Data payloads are split cosmetically on the client, fading the Stats in first, followed by Charts, and finally Lists, achieving an organic, fluid data cascade.

---

## 3. Data & Risk Architecture

![Entity Relationship Diagram](assets/Agent-Admin%20Plant-2026-04-23-045612.png)

Our database architecture prioritizes historical integrity and clear accountability:

- **Normalization (Fields vs. Plants):** We separated physical locations (**Fields**) from their temporal crop cycles (**Plants**). This allows a single field to host multiple different crops over many seasons, enabling rich historical performance analytics.
- **Audit Trail:** The `PlantUpdates` table acts as an append-only log. Every stage change or observation is recorded with a timestamp and the specific agent responsible, rather than just overwriting the main record.
- **Flexible Risk Logic:** While the system uses an automated algorithm to detect overdue crops, the `status_override` field allows users to manually mark plants as "Healthy" or "At Risk" to account for real-world environmental factors. 
- **Role-Based Constraints:** Fields are precisely linked to an `assigned_agent` while the system tracks the Admin who created the configuration, ensuring a clear chain of command.

### Automated Risk Algorithm
The backend `PlantStatusService` automatically computes health status based on the following precedence:
1. **Manual Override:** If a user has set a status override (Healthy/At Risk), that choice is respected immediately.
2. **Completed:** If a crop's current stage is `harvested`, the status is finalized as `completed`.
3. **Timeline Baseline:** The system calculates an expected harvest date (`planting_date` + `expected_days`). If the current date is past this milestone and the crop isn't ready/harvested, it is flagged as `at_risk`.
4. **Active:** All other crops within their expected growth window are marked as `active`.

---

## 4. Demo Credentials

If you seeded the database via `seed_db`, these specific accounts are available:

**Admin (Coordinator):**
- Email: `testadmin@gmail.com`
- Password: `Test.2026` (Notice the capital T and the dot)

**Field Agent:**
- Email: `navis@gmail.com`
- Password: `Navis.2026` (Notice the capital N and the dot)
