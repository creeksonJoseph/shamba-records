Join Shamba Records as a Software Engineer Intern and help build digital platforms for agricultural data, farmer management and financial tracking systems across Kenya.
At Shamba Records we build digital platforms for agricultural data, farmer management and financial tracking systems across Kenya. As a Software Engineer Intern you will contribute to real product work from day one — shipping full-stack features alongside senior engineers on systems that directly impact smallholder farmers and agribusinesses.
This is a hands-on internship: you will design, implement and ship, rather than simply observe. You will be mentored through code reviews, pairing sessions and design discussions, and expected to translate requirements into clean, working software.
Office: Mitsumi Business Park, Muthithi Road, Westlands, Nairobi.
Responsibilities

Build and maintain features across the full stack — backend APIs, frontend UI and data layer
Translate product requirements into working, well-structured software
Design reasonable data models and implement core business logic
Collaborate on code reviews, architecture discussions and sprint planning
Write clear, readable code that prioritises simplicity over over-engineering
Contribute to documentation (READMEs, setup instructions, design decisions)
Requirements

Working knowledge of at least one backend framework — Laravel, Django or Node.js
Comfort with a modern frontend framework (React or similar)
Experience with relational databases — MySQL or PostgreSQL
Ability to design clean systems and implement working APIs end-to-end
Clear thinking, sensible trade-offs and an instinct for clean separation of concerns
Eagerness to learn, ship, and improve — we prioritise clarity over completeness
Take-home task (required)
Completing this task is a mandatory part of our recruitment process. Download the brief, complete the assignment, and submit your solution together with your CV. Applications without the completed task will not be reviewed.
📄Download SmartSeason Field Monitoring System — Technical Assessment.pdf------
Full Stack Developer Technical Assessment 
SmartSeason Field Monitoring System 
Overview 
Build a simple web application that helps track crop progress across multiple fields during a growing season. 
The goal is to demonstrate your ability to: 
● design a clean system 
● implement core business logic 
● build a usable interface 
Core Requirements 
1. Users & Access 
The system should support two roles: 
● Admin (Coordinator) 
● Field Agent 
Implement authentication and ensure users only access what is relevant to them. 
2. Field Management 
The system should allow: 
● Creating and managing fields 
● Assigning fields to field agents 
Each field should have, at minimum: 
● Name 
● Crop type 
● Planting date 
● Current stage 
You may structure your data model as you see fit.
3. Field Updates 
Field Agents should be able to: 
● Update the stage of a field 
● Add notes or observations 
Admins should be able to: 
● View all fields 
● Monitor updates across agents 
4. Field Stages 
Use a simple lifecycle for fields (you may extend if needed): 
● Planted 
● Growing 
● Ready 
● Harvested 
5. Field Status Logic 
Each field should have a computed status based on its data. At minimum, handle: 
● Active 
● At Risk 
● Completed 
Define and implement reasonable logic for how status is determined. (Briefly explain your approach in the README.)
6. Dashboard 
Provide a basic dashboard for: 
● Admin: overview of all fields 
● Field Agent: overview of assigned fields 
Include simple summaries such as: 
● total fields
● status breakdown 
● any insights you find useful 
Technical Expectations 
You are free to choose your stack, but a typical setup may include: 
● Backend: Laravel, Django, or Node.js 
● Frontend: React (or similar) 
● Database: relational (MySQL/PostgreSQL) 
Focus on: 
● clean structure 
● working APIs 
● clear separation of concerns 
What to Submit 
● GitHub repository (frontend + backend or monorepo) ● README with: 
○ setup instructions 
○ design decisions 
○ any assumptions made 
● Demo credentials 
● (Optional) Live deployment link 
Evaluation Criteria 
We are looking for: 
● clear thinking and sensible trade-offs 
● working, reliable functionality 
● clean and readable code 
● simple, intuitive UI 
● ability to translate requirements into a working system 
Notes 
● You do not need to over-engineer the solution ● Keep it simple and functional 
● Prioritize clarity over completeness
Deadline: 25/04/2026 
Submission: Email with repository link and access details

 -------
How to apply
To apply, complete the technical assessment linked above (SmartSeason Field Monitoring System). When ready, email the following to __careers@shambarecords.com__ with the subject line Software Engineer Intern — Application:

Link to your GitHub repository (frontend + backend, or monorepo)
README with setup instructions, design decisions and assumptions made
Demo credentials for testing
Your CV and a short cover note
A live deployment link (required) — your solution must be publicly accessible online Submission deadline: 25 April 2026. Applications without the completed assessment and a live deployment link will not be reviewed. I need you to help me structure this plan from start to finish start with the necessary erd diagram and then the api structure to scaffold a complete backend then I'll implement it
Show more
12:19 PM
Great, here's the full plan — ERD first, then a complete API scaffold.

ERD


Design decisions baked into the schema:

USERS has a single role enum — keeps auth simple, no pivot table needed for two roles.
FIELDS has both assigned_agent_id and created_by (both FK to USERS) — admins create fields, agents are assigned.
status is a computed column (or a persisted computed field you refresh on update) — derived from stage + planting_date.
FIELD_UPDATES is an append-only audit log — it records every stage change and observation, giving admins a full history.
Status logic
Here's the rule you'll put in a service class:

Condition	Status
Stage is harvested	completed
Stage is ready OR growing and days since planting ≤ expected harvest window	active
planted or growing but days since planting exceeds expected window by 20%+	at_risk
Default	active
Keep it in one FieldStatusService / field_utils.py — not in the model or controller.

Full API scaffold
Here's everything you need to implement, organized by resource:

Auth
Method	Endpoint	Access	Description
POST	/api/auth/register	public	Create user (admin only in prod, open for demo)
POST	/api/auth/login	public	Returns JWT token
POST	/api/auth/logout	authenticated	Invalidate token
GET	/api/auth/me	authenticated	Current user profile
Users (admin only)
Method	Endpoint	Access	Description
GET	/api/users	admin	List all users
GET	/api/users/:id	admin	Get single user
PATCH	/api/users/:id	admin	Update role or name
DELETE	/api/users/:id	admin	Remove user
Fields
Method	Endpoint	Access	Description
GET	/api/fields	admin = all, agent = assigned only	List fields
POST	/api/fields	admin	Create a field
GET	/api/fields/:id	admin or assigned agent	Get single field
PATCH	/api/fields/:id	admin	Update name/crop/date/assignment
DELETE	/api/fields/:id	admin	Delete field
PATCH	/api/fields/:id/stage	assigned agent	Update stage (logs to FIELD_UPDATES)
Field updates (audit log)
Method	Endpoint	Access	Description
GET	/api/fields/:id/updates	admin or assigned agent	History of updates for a field
POST	/api/fields/:id/updates	assigned agent	Add observation/note
Dashboard
Method	Endpoint	Access	Description
GET	/api/dashboard	authenticated	Returns role-appropriate summary
The dashboard response shape:

json
{
  "total_fields": 12,
  "by_status": { "active": 7, "at_risk": 3, "completed": 2 },
  "by_stage":  { "planted": 2, "growing": 5, "ready": 3, "harvested": 2 },
  "at_risk_fields": [ /* compact field objects */ ],
  "recent_updates": [ /* last 5 across assigned/all fields */ ]
}
Implementation order
Build in this sequence to stay unblocked:

DB migrations — users → fields → field_updates
Auth — register, login, JWT middleware, role guard middleware
Users CRUD — simple, lets you create test accounts
Fields CRUD — with status computed on read (or a recompute_status helper called on write)
Field updates — stage change endpoint + observation endpoint
Dashboard — aggregation queries, one endpoint, two shapes (admin vs agent)
Frontend — login → role-based redirect → dashboard → field list → field detail
Once you've scaffolded this, share what stack you're using (Node/Laravel/Django + React or similar) and I can generate the actual boilerplate code for any layer.

gimme code for the erd to have it in dbdiagram.io

12:23 PM
Table users {
  id uuid [pk]
  name varchar
  email varchar [unique]
  password_hash varchar
  role varchar [note: 'admin | agent']
  created_at timestamp
  updated_at timestamp
}

Table fields {
  id uuid [pk]
  name varchar
  crop_type varchar
  planting_date date
  stage varchar [note: 'planted | growing | ready | harvested']
  status varchar [note: 'active | at_risk | completed']
  notes text
  assigned_agent_id uuid [ref: > users.id]
  created_by uuid [ref: > users.id]
  created_at timestamp
  updated_at timestamp
}

Table field_updates {
  id uuid [pk]
  field_id uuid [ref: > fields.id]
  agent_id uuid [ref: > users.id]
  new_stage varchar [note: 'planted | growing | ready | harvested']
  observation text
  created_at timestamp
}
Paste that directly into dbdiagram.io and it'll render with all the relationships. The ref: > notation means many-to-one (many fields/updates → one user).

so does it make sense when when a field is created an expected number of days is also input so as to calculate the status of the plants? also who creates the fields is it the moderators then the agents are responsible to create plants and update their stages?

12:32 PM
Yes, both make sense — let me address them separately.

Expected days — absolutely, add an expected_days integer column to fields. That gives you a concrete number to diff against planting_date, making the at-risk logic precise instead of guesswork. Without it you'd have to hardcode estimates per crop type which is fragile.

Who creates what — your instinct is a cleaner separation of concerns. The revised flow would be:

Admin creates and manages fields (the land parcels — name, location, assignment)
Agent creates plants on a field and owns the stage lifecycle
This means you'd split what's currently one fields table into two entities:

fields — the land, owned by admin. Has name, location, assigned agent.
plants — the crop record on a field, created by the agent. Has crop type, planting date, expected days, current stage, status.
This is actually more realistic too — the same field can have multiple planting seasons over time, and an agent might manage several crops on one field simultaneously.

The updated ERD would look like:

Table users { ... }

Table fields {
  id uuid [pk]
  name varchar
  location text
  assigned_agent_id uuid [ref: > users.id]
  created_by uuid [ref: > users.id]
  created_at timestamp
  updated_at timestamp
}

Table plants {
  id uuid [pk]
  field_id uuid [ref: > fields.id]
  created_by uuid [ref: > users.id]
  crop_type varchar
  planting_date date
  expected_days int
  stage varchar [note: 'planted | growing | ready | harvested']
  status varchar [note: 'active | at_risk | completed']
  notes text
  created_at timestamp
  updated_at timestamp
}

Table plant_updates {
  id uuid [pk]
  plant_id uuid [ref: > plants.id]
  agent_id uuid [ref: > users.id]
  new_stage varchar [note: 'planted | growing | ready | harvested']
  observation text
  created_at timestamp
}
And your status logic becomes clean:

days_elapsed = today - planting_date
progress     = days_elapsed / expected_days

stage == 'harvested'        → completed
progress > 1.2              → at_risk   (20% overdue)
everything else             → active
Does this split feel right for the use case, or do you want to keep it flat and just add expected_days to the original fields table?

This split is okay and clean

12:35 PM
Here's the updated dbdiagram.io code:

Table users {
  id uuid [pk]
  name varchar
  email varchar [unique]
  password_hash varchar
  role varchar [note: 'admin | agent']
  created_at timestamp
  updated_at timestamp
}

Table fields {
  id uuid [pk]
  name varchar
  location text
  assigned_agent_id uuid [ref: > users.id]
  created_by uuid [ref: > users.id]
  created_at timestamp
  updated_at timestamp
}

Table plants {
  id uuid [pk]
  field_id uuid [ref: > fields.id]
  created_by uuid [ref: > users.id]
  crop_type varchar
  planting_date date
  expected_days int
  stage varchar [note: 'planted | growing | ready | harvested']
  status varchar [note: 'active | at_risk | completed']
  notes text
  created_at timestamp
  updated_at timestamp
}

Table plant_updates {
  id uuid [pk]
  plant_id uuid [ref: > plants.id]
  agent_id uuid [ref: > users.id]
  new_stage varchar [note: 'planted | growing | ready | harvested']
  observation text
  created_at timestamp
}
Now tell me your stack — what backend framework and frontend are you going with? Once I know that I'll generate the actual code: migrations, models, auth middleware, controllers, and the status service logic.

going django and react tho lets focus on the backend with djano

12:35 PM
Good choice. A few quick questions before I generate everything:

Will you use Django REST Framework (DRF) — the standard choice, or do you have a preference?
For auth, JWT via djangorestframework-simplejwt or session-based?
PostgreSQL as the database?
Assuming yes to all three, here's the full project structure I'll scaffold:

smartseason/
├── manage.py
├── requirements.txt
├── .env
├── config/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── apps/
    ├── users/
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── permissions.py
    ├── fields/
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   └── urls.py
    ├── plants/
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── services.py      ← status logic lives here
    └── dashboard/
        ├── views.py
        └── urls.py
I'll generate it in this order:

requirements.txt + settings.py
Custom user model + auth
Fields app
Plants app + status service
Plant updates
Dashboard
Root urls.py
Confirm the stack assumptions and I'll start generating file by file.

should i install the claude extension on vs code and if i do it how do i transfer this chat context to it?

12:47 PM
Good question. Quick honest answer on both:

Should you install it? Yes, Claude Code for VS Code is useful for this project specifically because it can see your actual files, run commands, catch errors in context, and help you debug as you implement. For a full backend scaffold like this it's more powerful than chat.

Recommended apps and extensions

Claude Code for VS Code
Ask Claude to explain, edit, or fix code right in VS Code.
Transferring this context — there's no direct "export chat to Claude Code" feature. The practical way to carry over what we've designed is to put it in a CLAUDE.md file at the root of your project. Claude Code reads that file automatically as project context. Here's what to put in it:

markdown
# SmartSeason — Project Context

## Stack
Django + DRF + SimpleJWT + PostgreSQL

## Roles
- Admin: manages fields, assigns agents, views all data
- Agent: creates plants on assigned fields, updates stages

## Data model
- users: custom user model with role enum (admin | agent)
- fields: created by admin, assigned to an agent
- plants: created by agent on a field, has crop_type, planting_date, expected_days, stage, status
- plant_updates: append-only log of every stage change + observation

## Status logic (plants/services.py)
progress = (today - planting_date).days / expected_days
- stage == harvested → completed
- progress > 1.2 → at_risk
- else → active

## API structure
- /api/auth/ — login, logout, me
- /api/users/ — admin only
- /api/fields/ — admin CRUD, agents read assigned
- /api/plants/ — agents create/update on their fields
- /api/plants/:id/updates/ — stage changes + observations
- /api/dashboard/ — role-aware summary
Then in Claude Code you can just say "implement the plants model based on the context in CLAUDE.md" and it'll have everything. Ready to generate the Django code now?

