# UI Context & API Integration Guide

This document outlines the backend APIs provided, their inputs and outputs, and the expected frontend context. This guide is specifically written to aid an AI (or human developer) in constructing the frontend interfaces page by page.

## Global Concepts
* **Base URL:** `/api/`
* **Authentication:** Uses JSON Web Tokens (JWT). Most endpoints require an `Authorization` header formatted as: `Bearer <access_token>`.
* **Roles:** There are two main roles: `admin` and `agent`.
  * **Admin:** Has full access to read, create, update, and delete all resources (Users, Fields, Plants).
  * **Agent:** Has read-only access to their assigned fields and can only create/update plants on their assigned fields.
* **Status vs Stage (Plants):**
  * `stage` is the lifecycle of the plant (`planted`, `growing`, `ready`, `harvested`).
  * `status` is automatically computed based on time (`active`, `at_risk`, `completed`).

---

## 1. Authentication Pages (Login)

These pages handle user access and token acquisition.

### Login Page
* **Endpoint:** `POST /api/auth/login/`
* **Needed (Request Body):**
  * `email` (string, required)
  * `password` (string, required)
* **Produced (Response):**
  * `access` (string, JWT Access Token)
  * `refresh` (string, JWT Refresh Token)
  * `user` (object: `id`, `name`, `email`, `role`)
* **AI Frontend Context:** The frontend should store the tokens (e.g., in localStorage or cookies) and the user details in a global state/context to drive RBAC (Role-Based Access Control) in the UI. There is no "Registration" page; initial Admin accounts are seeded by the developer, and Admins create Agents from their dashboard.


---

## 2. Dashboard Page

The main landing page after logging in. Provides a high-level overview. The data returned is scoped to the user's role (Admin sees all, Agent sees only their assigned metrics).

* **Endpoint:** `GET /api/dashboard/`
* **Needed:** Authorization Header.
* **Produced (Response):**
  * `total_fields` (integer)
  * `total_plants` (integer)
  * `by_status` (object: counts for `active`, `at_risk`, `completed`)
  * `by_stage` (object: counts for `planted`, `growing`, `ready`, `harvested`)
  * `at_risk_plants` (list of plant objects that require attention)
  * `recent_updates` (list of the 5 most recent observation/stage update objects)
* **AI Frontend Context:** Construct summary cards or charts using the `by_status` and `by_stage` objects. Show a list/table for `at_risk_plants` to alert the user immediately, and a timeline/feed for `recent_updates`.

---

## 3. Fields Management Page

A page summarizing agricultural fields.

* **Endpoint:** `GET /api/fields/`
* **Needed:** Authorization Header.
* **Produced (Response):** A list of Field objects.
  * Example Field: `{"id": "...", "name": "...", "location": "...", "assigned_agent": {user_obj}, "created_by": {user_obj}}`

### Create / Edit Field Modal (Admin Only)
* **Endpoints:** `POST /api/fields/` (Create), `PATCH /api/fields/{id}/` (Update)
* **Needed (Request Body):**
  * `name` (string)
  * `location` (string)
  * `assigned_agent` (string - UUID of an agent user)
* **Produced (Response):** The created/updated Field object.
* **AI Frontend Context:** The UI must hide the "Create Field" button if the current user is an `agent`. Admin users will need a dropdown of users (from `/api/users/`) to assign an agent.

---

## 4. Plants Directory Page

A page showing all plants/crops being monitored. Agents will only see crops for their assigned fields.

* **Endpoint:** `GET /api/plants/`
* **Needed:** Authorization Header.
* **Produced (Response):** A list of Plant objects. Include nested details like `field`, `stage`, `status`, `planting_date`.

### Create Plant Modal
* **Endpoint:** `POST /api/plants/`
* **Needed (Request Body):**
  * `field` (string - UUID of the field)
  * `crop_type` (string)
  * `planting_date` (date string YYYY-MM-DD)
  * `expected_days` (integer - days to maturity)
  * `notes` (string, optional)
* **Produced (Response):** The created Plant object.
* **AI Frontend Context:** The frontend needs to fetch available fields (`GET /api/fields/`) to populate the `field` selection dropdown.

---

## 5. Plant Details & Updates Page

A detailed view of a specific plant showing its timeline and allowing users to log updates or change stages.

* **Endpoint:** `GET /api/plants/{id}/`
* **Needed:** Authorization Header.
* **Produced (Response):** Single Plant object. This object includes an `updates` array containing the history of stage changes and observations.

### Update Stage Modal/Action
* **Endpoint:** `PATCH /api/plants/{id}/stage/`
* **Needed (Request Body):**
  * `new_stage` (string: "planted", "growing", "ready", "harvested")
  * `observation` (string, optional - notes regarding the stage change)
* **Produced (Response):** The updated Plant object.

### Log Observation Modal/Action
* **Endpoint:** `POST /api/plants/{id}/updates/`
* **Needed (Request Body):**
  * `observation` (string - required text note)
* **Produced (Response):** A new PlantUpdate record object.
* **AI Frontend Context:** Provide a timeline UI component that iterates over the `updates` array. Provide two independent actions: one for simply logging a note ("Add Observation") and one for formally advancing the plant's lifecycle ("Update Stage").

---

## 6. User Management / Settings (Admin Only)

A page for managing agents and the user's own profile.

* **Endpoints:** 
  * `GET /api/users/` (List all users - for Admin to manage or for populating agent dropdowns)
  * `POST /api/users/` (Create a new user/agent. Needed: `name`, `email`, `password`, `role`. Produced: User object)
  * `GET /api/auth/me/` (Get the currently logged-in user's profile)
* **AI Frontend Context:** Use `/api/users/` to feed into any Select/Combobox where an Admin needs to assign an agent to a Field. Provide a form here mapping to `POST /api/users/` where Admins can register new agents. Use `/api/auth/me/` for a profile view or in the main layout navbar.
