# Development Roadmap — HireLoop AI

## Overview

25 milestones across 6 phases. Each milestone is self-contained and must be fully working before proceeding.

---

## Phase 1 — Foundation (Milestones 1–3)

### ✅ Milestone 1: Project Planning & Architecture
- [x] System architecture design
- [x] Database schema overview
- [x] Tech stack decisions
- [x] Folder structure
- [x] Development roadmap
- [x] Git strategy
- [x] Documentation

### ⏳ Milestone 2: Express.js Backend Foundation
- [ ] Project initialization (TypeScript, ESLint, Prettier)
- [ ] Express app setup with middleware pipeline
- [ ] Environment variable validation (Zod)
- [ ] Database connection (Drizzle + PostgreSQL)
- [ ] Global error handler
- [ ] API response utilities
- [ ] Custom error classes
- [ ] Logger setup (Pino/Winston)
- [ ] Health check endpoint
- [ ] Swagger/OpenAPI setup

### ⏳ Milestone 3: Database Schema Implementation
- [ ] All 12 Drizzle table definitions
- [ ] Relations and foreign keys
- [ ] Indexes and constraints
- [ ] Enum types
- [ ] Migration generation and execution
- [ ] Seed data script
- [ ] pgvector extension setup

---

## Phase 2 — Authentication & Core CRUD (Milestones 4–8)

### ⏳ Milestone 4: Authentication & RBAC
- [ ] Register endpoint (with org creation)
- [ ] Login endpoint (JWT + Refresh Token)
- [ ] Refresh token endpoint (rotation)
- [ ] Logout endpoint
- [ ] Auth middleware (JWT verification)
- [ ] RBAC middleware (role checking)
- [ ] Password hashing (bcrypt)
- [ ] Input validation

### ⏳ Milestone 5: Organizations & Users CRUD
- [ ] Organization CRUD endpoints
- [ ] User CRUD endpoints (Admin only)
- [ ] User profile endpoint (self)
- [ ] User role management
- [ ] Pagination, filtering, sorting

### ⏳ Milestone 6: Candidates CRUD
- [ ] Create candidate (unique email check)
- [ ] Update candidate (upsert on email)
- [ ] Get candidate with relations
- [ ] List candidates (paginated, filtered)
- [ ] Candidate timeline (append events)
- [ ] Soft delete

### ⏳ Milestone 7: Roles & Applications CRUD
- [ ] Role CRUD (Admin creates, all view)
- [ ] Application CRUD (link candidate ↔ role)
- [ ] Unique constraint (candidate + role)
- [ ] Status transitions
- [ ] Match score storage

### ⏳ Milestone 8: Interviews & Feedback CRUD
- [ ] Interview scheduling endpoints
- [ ] Interview status management
- [ ] Feedback submission (1–5 scoring)
- [ ] Feedback retrieval per interview
- [ ] Unique constraint (interview + interviewer)

---

## Phase 3 — AI Engine (Milestones 9–12)

### ⏳ Milestone 9: FastAPI Foundation
- [ ] Project setup (FastAPI, Pydantic)
- [ ] Health check endpoint
- [ ] API key authentication
- [ ] Provider Pattern implementation
- [ ] Gemini provider
- [ ] HuggingFace provider
- [ ] Configuration management
- [ ] Error handling

### ⏳ Milestone 10: Resume Parsing
- [ ] PDF text extraction (PyMuPDF)
- [ ] LLM-powered structured parsing
- [ ] Structured JSON output schema
- [ ] Confidence scoring
- [ ] Error handling for malformed PDFs

### ⏳ Milestone 11: LangGraph Agentic Workflow
- [ ] Graph state schema
- [ ] Resume Parser node
- [ ] Candidate Analyzer node
- [ ] Skill Extractor node
- [ ] Role Matcher node
- [ ] Recommendation Agent node
- [ ] Graph compilation and execution
- [ ] Error handling per node

### ⏳ Milestone 12: Semantic Search & Embeddings
- [ ] Sentence Transformers setup
- [ ] Candidate embedding generation
- [ ] Role embedding generation
- [ ] pgvector similarity search
- [ ] Combined keyword + semantic search
- [ ] Search filters and ranking

---

## Phase 4 — Frontend (Milestones 13–18)

### ⏳ Milestone 13: Next.js Foundation
- [ ] Project setup (App Router, TailwindCSS v4, shadcn/ui)
- [ ] Design system (colors, typography, spacing)
- [ ] Root layout with providers
- [ ] Auth pages (Login, Signup)
- [ ] Dashboard layout (Sidebar, Header)
- [ ] Theme toggle (Dark/Light mode)
- [ ] Axios instance with interceptors
- [ ] TanStack Query setup

### ⏳ Milestone 14: Dashboard UI
- [ ] Stats cards (candidates, roles, interviews)
- [ ] Charts (hiring funnel, timeline)
- [ ] Recent activity feed
- [ ] Quick actions
- [ ] Skeleton loaders

### ⏳ Milestone 15: Candidates UI
- [ ] Candidates list (table, paginated)
- [ ] Candidate profile page
- [ ] Candidate timeline component
- [ ] Resume upload dialog
- [ ] Search and filters
- [ ] Empty states

### ⏳ Milestone 16: Roles & Applications UI
- [ ] Roles list and detail pages
- [ ] Create/edit role forms
- [ ] Application pipeline view
- [ ] Candidate-role matching display

### ⏳ Milestone 17: Interviews & Feedback UI
- [ ] Interview calendar/list view
- [ ] Schedule interview dialog
- [ ] Feedback form
- [ ] Feedback summary view
- [ ] Score visualization

### ⏳ Milestone 18: AI Search UI
- [ ] Search page with input
- [ ] Keyword vs semantic toggle
- [ ] Filter sidebar
- [ ] Search results with scores
- [ ] Result detail preview

---

## Phase 5 — Integration & Polish (Milestones 19–22)

### ⏳ Milestone 19: Resume Upload End-to-End
- [ ] Upload → Extract → Parse → Score → Display flow
- [ ] Progress indicators
- [ ] Error recovery
- [ ] Retry mechanism

### ⏳ Milestone 20: Email Notifications
- [ ] NodeMailer setup (development)
- [ ] Email templates (interview invite, etc.)
- [ ] AWS SES configuration (production)
- [ ] Email queue/retry logic

### ⏳ Milestone 21: API Documentation
- [ ] Swagger for all Express endpoints
- [ ] FastAPI auto-docs verification
- [ ] Request/response examples
- [ ] Authentication documentation

### ⏳ Milestone 22: Testing & QA
- [ ] Manual testing checklists
- [ ] Edge case documentation
- [ ] Cross-browser testing
- [ ] Mobile responsiveness audit

---

## Phase 6 — DevOps & Deployment (Milestones 23–25)

### ⏳ Milestone 23: Docker & Docker Compose
- [ ] Express Dockerfile
- [ ] FastAPI Dockerfile
- [ ] Next.js Dockerfile
- [ ] PostgreSQL container
- [ ] Docker Compose orchestration
- [ ] Volume management
- [ ] Health checks

### ⏳ Milestone 24: NGINX & SSL
- [ ] NGINX reverse proxy config
- [ ] SSL certificate setup
- [ ] Route mapping
- [ ] Static file serving
- [ ] Gzip compression

### ⏳ Milestone 25: CI/CD & AWS Deployment
- [ ] GitHub Actions workflow
- [ ] Automated testing
- [ ] Docker image building
- [ ] AWS EC2 deployment
- [ ] Environment variable management
- [ ] Production monitoring
