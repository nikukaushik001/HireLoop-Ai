# Database Schema Overview — HireLoop AI

## Design Philosophy

- **Candidate email is globally UNIQUE** — same email always updates, never duplicates
- **Soft deletes** — `deleted_at` nullable timestamp on users and candidates
- **Append-only timeline** — full audit trail for every candidate event
- **Timezone-aware** — all timestamps use `timestamptz`
- **UUID primary keys** — avoid sequential ID exposure
- **Proper normalization** — skills and institutions are lookup tables
- **pgvector** — vector embeddings stored directly in PostgreSQL

---

## Tables

### 1. `organizations`

The multi-tenant container. Every user belongs to exactly one organization.

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `name` | VARCHAR(255) | NOT NULL |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE |
| `logo_url` | TEXT | NULLABLE |
| `website` | TEXT | NULLABLE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Indexes:** `slug` (UNIQUE)

---

### 2. `users`

Recruiters, admins, and interviewers. Each belongs to one org.

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK |
| `organization_id` | UUID | FK → organizations, NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `password_hash` | TEXT | NOT NULL |
| `first_name` | VARCHAR(100) | NOT NULL |
| `last_name` | VARCHAR(100) | NOT NULL |
| `role` | ENUM('admin','recruiter','interviewer') | NOT NULL, DEFAULT 'recruiter' |
| `avatar_url` | TEXT | NULLABLE |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true |
| `last_login_at` | TIMESTAMPTZ | NULLABLE |
| `refresh_token` | TEXT | NULLABLE |
| `deleted_at` | TIMESTAMPTZ | NULLABLE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Indexes:** `email` (UNIQUE), `organization_id`, `role`

---

### 3. `candidates`

Lifetime candidate profiles. **Email is globally unique.**

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK |
| `organization_id` | UUID | FK → organizations, NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `first_name` | VARCHAR(100) | NOT NULL |
| `last_name` | VARCHAR(100) | NOT NULL |
| `phone` | VARCHAR(20) | NULLABLE |
| `linkedin_url` | TEXT | NULLABLE |
| `github_url` | TEXT | NULLABLE |
| `portfolio_url` | TEXT | NULLABLE |
| `current_company` | VARCHAR(255) | NULLABLE |
| `current_title` | VARCHAR(255) | NULLABLE |
| `experience_years` | INTEGER | NULLABLE |
| `location` | VARCHAR(255) | NULLABLE |
| `summary` | TEXT | NULLABLE |
| `status` | ENUM('new','screening','interviewing','offered','hired','rejected','archived') | NOT NULL, DEFAULT 'new' |
| `source` | VARCHAR(100) | NULLABLE |
| `embedding` | VECTOR(384) | NULLABLE (pgvector) |
| `created_by` | UUID | FK → users, NOT NULL |
| `deleted_at` | TIMESTAMPTZ | NULLABLE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Indexes:** `email` (UNIQUE), `organization_id`, `status`, `embedding` (IVFFlat for vector search)

---

### 4. `resumes`

Parsed resume data + file path. One candidate can have multiple resume versions.

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK |
| `candidate_id` | UUID | FK → candidates, NOT NULL |
| `file_path` | TEXT | NOT NULL |
| `file_name` | VARCHAR(255) | NOT NULL |
| `file_size` | INTEGER | NOT NULL |
| `mime_type` | VARCHAR(50) | NOT NULL, DEFAULT 'application/pdf' |
| `raw_text` | TEXT | NULLABLE |
| `parsed_data` | JSONB | NULLABLE |
| `ai_score` | DECIMAL(3,2) | NULLABLE |
| `parse_status` | ENUM('pending','processing','completed','failed') | NOT NULL, DEFAULT 'pending' |
| `parsed_at` | TIMESTAMPTZ | NULLABLE |
| `is_primary` | BOOLEAN | NOT NULL, DEFAULT false |
| `uploaded_by` | UUID | FK → users, NOT NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Indexes:** `candidate_id`, `parse_status`

---

### 5. `roles`

Open job positions within an organization.

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK |
| `organization_id` | UUID | FK → organizations, NOT NULL |
| `title` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | NOT NULL |
| `requirements` | JSONB | NULLABLE |
| `department` | VARCHAR(100) | NULLABLE |
| `location` | VARCHAR(255) | NULLABLE |
| `employment_type` | ENUM('full_time','part_time','contract','internship') | NOT NULL, DEFAULT 'full_time' |
| `experience_min` | INTEGER | NULLABLE |
| `experience_max` | INTEGER | NULLABLE |
| `salary_min` | INTEGER | NULLABLE |
| `salary_max` | INTEGER | NULLABLE |
| `status` | ENUM('draft','open','paused','closed','filled') | NOT NULL, DEFAULT 'draft' |
| `embedding` | VECTOR(384) | NULLABLE |
| `created_by` | UUID | FK → users, NOT NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Indexes:** `organization_id`, `status`, `embedding` (IVFFlat)

---

### 6. `applications`

Junction between candidates and roles.

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK |
| `candidate_id` | UUID | FK → candidates, NOT NULL |
| `role_id` | UUID | FK → roles, NOT NULL |
| `status` | ENUM('applied','screening','shortlisted','interviewing','offered','hired','rejected','withdrawn') | NOT NULL, DEFAULT 'applied' |
| `match_score` | DECIMAL(3,2) | NULLABLE |
| `ai_reasoning` | TEXT | NULLABLE |
| `notes` | TEXT | NULLABLE |
| `applied_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Indexes:** UNIQUE(`candidate_id`, `role_id`), `status`

---

### 7. `interviews`

Scheduled interview slots.

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK |
| `application_id` | UUID | FK → applications, NOT NULL |
| `interviewer_id` | UUID | FK → users, NOT NULL |
| `scheduled_at` | TIMESTAMPTZ | NOT NULL |
| `duration_minutes` | INTEGER | NOT NULL, DEFAULT 60 |
| `type` | ENUM('phone','video','onsite','technical','hr') | NOT NULL, DEFAULT 'video' |
| `location` | TEXT | NULLABLE |
| `meeting_link` | TEXT | NULLABLE |
| `status` | ENUM('scheduled','in_progress','completed','cancelled','no_show') | NOT NULL, DEFAULT 'scheduled' |
| `notes` | TEXT | NULLABLE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Indexes:** `application_id`, `interviewer_id`, `scheduled_at`, `status`

---

### 8. `interview_feedback`

Interviewer's feedback and scoring for each interview.

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK |
| `interview_id` | UUID | FK → interviews, NOT NULL |
| `interviewer_id` | UUID | FK → users, NOT NULL |
| `overall_score` | INTEGER | NOT NULL, CHECK 1–5 |
| `technical_score` | INTEGER | NULLABLE, CHECK 1–5 |
| `communication_score` | INTEGER | NULLABLE, CHECK 1–5 |
| `culture_fit_score` | INTEGER | NULLABLE, CHECK 1–5 |
| `strengths` | TEXT | NULLABLE |
| `weaknesses` | TEXT | NULLABLE |
| `notes` | TEXT | NULLABLE |
| `recommendation` | ENUM('strong_hire','hire','no_hire','strong_no_hire') | NOT NULL |
| `ai_summary` | TEXT | NULLABLE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Indexes:** `interview_id`, `interviewer_id`, UNIQUE(`interview_id`, `interviewer_id`)

---

### 9. `candidate_timeline`

Append-only audit log for every candidate event.

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK |
| `candidate_id` | UUID | FK → candidates, NOT NULL |
| `event_type` | VARCHAR(50) | NOT NULL |
| `title` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | NULLABLE |
| `metadata` | JSONB | NULLABLE |
| `performed_by` | UUID | FK → users, NULLABLE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Event types:** `created`, `resume_uploaded`, `resume_parsed`, `applied`, `interview_scheduled`, `interview_completed`, `feedback_submitted`, `status_changed`, `profile_updated`, `note_added`

**Indexes:** `candidate_id`, `event_type`, `created_at` (DESC)

**Rules:** This table is **append-only**. No updates. No deletes. Ever.

---

### 10. `institutions`

Normalized lookup table for universities and colleges.

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK |
| `name` | VARCHAR(255) | NOT NULL, UNIQUE |
| `location` | VARCHAR(255) | NULLABLE |
| `type` | ENUM('university','college','bootcamp','online','other') | NOT NULL, DEFAULT 'university' |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Indexes:** `name` (UNIQUE)

---

### 11. `skills`

Normalized skill taxonomy.

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE |
| `category` | VARCHAR(50) | NULLABLE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Categories:** `language`, `framework`, `database`, `tool`, `cloud`, `soft_skill`, `other`

**Indexes:** `name` (UNIQUE), `category`

---

### 12. `candidate_skills`

Junction table between candidates and skills.

| Column | Type | Constraints |
|--------|------|------------|
| `candidate_id` | UUID | FK → candidates, NOT NULL |
| `skill_id` | UUID | FK → skills, NOT NULL |
| `proficiency` | ENUM('beginner','intermediate','advanced','expert') | NULLABLE |
| `years_of_experience` | INTEGER | NULLABLE |
| `source` | ENUM('resume','manual','ai') | NOT NULL, DEFAULT 'ai' |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Constraints:** PRIMARY KEY (`candidate_id`, `skill_id`)

---

## Relationships Summary

```
organizations  1 ──── * users
organizations  1 ──── * candidates
organizations  1 ──── * roles
users          1 ──── * candidates (created_by)
candidates     1 ──── * resumes
candidates     1 ──── * applications
candidates     1 ──── * candidate_skills
candidates     1 ──── * candidate_timeline
skills         1 ──── * candidate_skills
roles          1 ──── * applications
applications   1 ──── * interviews
interviews     1 ──── * interview_feedback
users          1 ──── * interviews (interviewer)
users          1 ──── * interview_feedback (interviewer)
```

---

## PostgreSQL Extensions Required

| Extension | Purpose |
|-----------|---------|
| `uuid-ossp` | UUID generation |
| `pgvector` | Vector embeddings for semantic search |
