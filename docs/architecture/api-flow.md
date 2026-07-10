# API Flow — HireLoop AI

## Communication Pattern

```
Frontend (Next.js :3000)
    │
    │  HTTP REST (JSON)
    │  Authorization: Bearer <JWT>
    │
    ▼
API Gateway (Express :4000)
    │
    ├── Validates JWT token
    ├── Checks RBAC permissions
    ├── Validates request body (Zod)
    │
    ├──────────────────────────────────┐
    │  Database Operations             │  AI Operations
    │                                  │
    ▼                                  ▼
PostgreSQL (:5432)              FastAPI AI Engine (:8000)
    │                                  │
    │                                  ├── API Key Auth
    │                                  ├── Process Request
    │                                  ├── Call LLM Provider
    │                                  │
    │                                  ▼
    │                           LLM (Gemini/HuggingFace)
    │                                  │
    │                                  │  Returns JSON
    │                                  ▼
    │                           Express receives AI response
    │                                  │
    │  ◄──── Stores results ───────────┘
    │
    ▼
Express sends response to Frontend
```

---

## Request Lifecycle

### 1. Frontend → Express

Every request from the frontend follows this pattern:

```
POST /api/v1/candidates
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Body:
  { "email": "jane@example.com", "name": "Jane Doe" }
```

### 2. Express Middleware Pipeline

```
Request
  → CORS check
  → Rate limiter
  → Helmet security headers
  → JSON body parser
  → Route matcher
  → Auth middleware (JWT verify)
  → RBAC middleware (role check)
  → Validation middleware (Zod schema)
  → Controller
  → Service (business logic)
  → Repository (database query)
  → Response
```

### 3. Express → FastAPI (when AI is needed)

```
POST http://localhost:8000/api/v1/parse-resume
Headers:
  X-API-Key: <AI_ENGINE_API_KEY>
  Content-Type: application/json

Body:
  { "text": "extracted resume text...", "file_name": "resume.pdf" }

Response:
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "skills": ["Python", "React", "PostgreSQL"],
    "experience": [...],
    "education": [...],
    "score": 0.85
  }
```

### 4. Standard API Response Format

**Success:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "meta": {
    "timestamp": "2026-07-10T17:00:00Z"
  }
}
```

**Success (List):**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful GET, PATCH |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Invalid request body/params |
| `401` | Unauthorized | Missing or invalid JWT |
| `403` | Forbidden | Valid JWT but insufficient role |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource (e.g., email exists) |
| `422` | Unprocessable Entity | Validation error |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |

---

## API Versioning

All endpoints are prefixed with `/api/v1/`. When breaking changes are needed, we create `/api/v2/` while keeping v1 alive for backward compatibility.

---

## Authentication Flow

```
1. User logs in:  POST /api/v1/auth/login
   Response: { accessToken, refreshToken }

2. User makes request:
   GET /api/v1/candidates
   Header: Authorization: Bearer <accessToken>

3. Access token expires (15 min):
   POST /api/v1/auth/refresh
   Body: { refreshToken }
   Response: { accessToken (new), refreshToken (rotated) }

4. User logs out:
   POST /api/v1/auth/logout
   (Invalidates refresh token)
```

---

## Endpoint Overview

| Method | Endpoint | Service | Auth |
|--------|----------|---------|------|
| POST | `/api/v1/auth/register` | Auth | Public |
| POST | `/api/v1/auth/login` | Auth | Public |
| POST | `/api/v1/auth/refresh` | Auth | Public |
| POST | `/api/v1/auth/logout` | Auth | Required |
| GET | `/api/v1/users` | Users | Admin |
| GET | `/api/v1/users/:id` | Users | Admin |
| PATCH | `/api/v1/users/:id` | Users | Admin |
| DELETE | `/api/v1/users/:id` | Users | Admin |
| GET | `/api/v1/organizations` | Orgs | Admin |
| PATCH | `/api/v1/organizations/:id` | Orgs | Admin |
| GET | `/api/v1/candidates` | Candidates | Recruiter+ |
| POST | `/api/v1/candidates` | Candidates | Recruiter+ |
| GET | `/api/v1/candidates/:id` | Candidates | Recruiter+ |
| PATCH | `/api/v1/candidates/:id` | Candidates | Recruiter+ |
| GET | `/api/v1/candidates/:id/timeline` | Timeline | Recruiter+ |
| POST | `/api/v1/candidates/:id/resume` | Resumes | Recruiter+ |
| GET | `/api/v1/roles` | Roles | Recruiter+ |
| POST | `/api/v1/roles` | Roles | Admin |
| GET | `/api/v1/roles/:id` | Roles | Recruiter+ |
| PATCH | `/api/v1/roles/:id` | Roles | Admin |
| GET | `/api/v1/applications` | Applications | Recruiter+ |
| POST | `/api/v1/applications` | Applications | Recruiter+ |
| PATCH | `/api/v1/applications/:id` | Applications | Recruiter+ |
| GET | `/api/v1/interviews` | Interviews | Interviewer+ |
| POST | `/api/v1/interviews` | Interviews | Recruiter+ |
| PATCH | `/api/v1/interviews/:id` | Interviews | Recruiter+ |
| POST | `/api/v1/interviews/:id/feedback` | Feedback | Interviewer |
| GET | `/api/v1/dashboard/stats` | Dashboard | Recruiter+ |
| GET | `/api/v1/search` | Search | Recruiter+ |
