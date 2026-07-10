# System Design — HireLoop AI

## Overview

HireLoop is a three-service microservice architecture designed for AI-powered recruitment intelligence.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        NGINX (Reverse Proxy)                     │
│                     SSL Termination / Load Balancing              │
└──────────┬──────────────────────┬───────────────────────────────┘
           │                      │
           ▼                      ▼
┌─────────────────────┐  ┌─────────────────────┐
│   Next.js Frontend  │  │   Express.js API     │
│       :3000         │  │      :4000           │
│                     │  │                      │
│  • App Router       │  │  • Auth / RBAC       │
│  • shadcn/ui        │  │  • CRUD Operations   │
│  • TanStack Query   │  │  • File Upload       │
│  • React Hook Form  │  │  • Email Service     │
│  • Dark Mode        │  │  • Swagger Docs      │
│                     │  │  • Rate Limiting     │
└─────────────────────┘  └──────────┬───────────┘
                                    │
                         ┌──────────┼──────────┐
                         │          │          │
                         ▼          ▼          ▼
              ┌──────────────┐ ┌────────┐ ┌─────────────────┐
              │  PostgreSQL  │ │ Redis  │ │  FastAPI AI      │
              │    :5432     │ │ :6379  │ │  Engine :8000    │
              │              │ │(future)│ │                  │
              │  • Users     │ └────────┘ │  • LangGraph     │
              │  • Candidates│            │  • PyMuPDF       │
              │  • Resumes   │            │  • Embeddings    │
              │  • Roles     │            │  • Provider Pat. │
              │  • pgvector  │            │  • Gemini/HF     │
              └──────────────┘            └─────────────────┘
```

---

## Service Responsibilities

### Service 1 — Express.js API Gateway (:4000)

| Responsibility | Details |
|---------------|---------|
| Authentication | JWT access/refresh tokens, bcrypt hashing |
| Authorization | RBAC — Admin, Recruiter, Interviewer |
| Users & Orgs | CRUD for users, organizations |
| Candidates | Lifetime profiles, unique email, upsert |
| Resumes | File upload, storage, metadata |
| Roles | Job positions, requirements |
| Applications | Candidate ↔ Role linking |
| Interviews | Scheduling, feedback collection |
| Dashboard | Aggregated stats, charts data |
| Timeline | Append-only candidate event log |
| Email | NodeMailer (dev) / AWS SES (prod) |
| DB Owner | **ONLY service that writes to PostgreSQL** |

### Service 2 — FastAPI AI Engine (:8000)

| Responsibility | Details |
|---------------|---------|
| PDF Extraction | PyMuPDF text extraction from resumes |
| Resume Parsing | LLM-powered structured data extraction |
| Skill Extraction | Identify and categorize skills |
| Role Matching | Score candidates against open roles |
| Semantic Search | Embedding-based candidate search |
| Feedback Summary | Summarize interview feedback |
| Recommendations | AI-powered hiring recommendations |
| Provider Pattern | Swap LLM providers without code changes |

**FastAPI Rules:**
- Returns JSON only
- Never writes to database
- Stateless — no session management
- Called only by Express, never by Frontend

### Service 3 — Next.js Frontend (:3000)

| Responsibility | Details |
|---------------|---------|
| Authentication UI | Login, Signup, Forgot Password |
| Dashboard | Stats, charts, recent activity |
| Candidate Management | Search, view, edit profiles |
| Role Management | Create, edit job roles |
| Interview Management | Schedule, feedback, scoring |
| Search | Keyword + AI semantic search |
| Settings | User profile, org settings |

---

## Design Principles

1. **Single Writer** — Express is the only service that writes to PostgreSQL
2. **Stateless AI** — FastAPI has no state, can scale horizontally
3. **Security Boundary** — Frontend never sees AI API keys
4. **Clean Architecture** — Controller → Service → Repository pattern
5. **Provider Pattern** — LLM providers are swappable via factory
6. **Soft Deletes** — Data is never permanently deleted
7. **Audit Trail** — Every candidate action is logged in timeline
8. **Type Safety** — TypeScript on frontend + backend, Pydantic on AI engine

---

## Data Flow Patterns

### Resume Upload Flow
```
User uploads PDF → Frontend → Express (validates, stores file)
                                  → FastAPI (extracts, parses, scores)
                                  ← FastAPI returns structured JSON
                              Express stores results in PostgreSQL
                              Express updates candidate timeline
                          ← Frontend displays parsed results
```

### Search Flow
```
User searches → Frontend → Express (keyword search in DB)
                               → FastAPI (semantic search via embeddings)
                           Express merges and ranks results
                       ← Frontend displays combined results
```

### Interview Flow
```
Recruiter schedules → Frontend → Express (creates interview record)
                                     → Email service (notifies participants)
Interviewer submits feedback → Express (stores feedback, updates timeline)
                                   → FastAPI (summarizes feedback)
```
