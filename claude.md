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
- Here is the erd code:
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