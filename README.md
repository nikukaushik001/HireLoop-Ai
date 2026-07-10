# HireLoop AI

> **AI-Powered Recruitment Intelligence Platform**
> "Never lose a good candidate."

---

## What is HireLoop?

HireLoop is an **internal AI-powered recruitment intelligence platform** for organizations that want to build and maintain a lifetime candidate database.

**This is NOT a job portal.** HireLoop is an internal tool where:

- Organizations upload resumes once
- Every candidate gets a **lifetime profile**
- Interview history is **preserved forever**
- Recruiters search previous candidates **before hiring externally**
- AI scores and matches candidates to open roles automatically

---

## Architecture

HireLoop is a **three-service microservice architecture**:

| Service | Tech | Port | Responsibility |
|---------|------|------|---------------|
| **Frontend** | Next.js 14 | `3000` | SaaS Dashboard UI |
| **API Gateway** | Express.js + TypeScript | `4000` | Auth, CRUD, DB Owner |
| **AI Engine** | FastAPI + Python | `8000` | Resume Parsing, LLM, Embeddings |

```
Frontend → Express → PostgreSQL
                  → FastAPI → LLM Providers
```

---

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TailwindCSS v4
- shadcn/ui
- TanStack Query
- React Hook Form + Zod

### Backend
- Express.js + TypeScript
- Drizzle ORM
- PostgreSQL + pgvector
- JWT + bcrypt
- Swagger

### AI Engine
- FastAPI + Python
- LangGraph (Agentic Workflows)
- PyMuPDF (PDF Extraction)
- Sentence Transformers (Embeddings)
- Gemini / HuggingFace (Provider Pattern)

### Infrastructure
- Docker + Docker Compose
- NGINX (Reverse Proxy)
- GitHub Actions (CI/CD)
- AWS EC2

---

## Project Structure

```
HireLoop-Ai/
├── apps/
│   ├── web/          # Next.js Frontend
│   ├── api/          # Express.js Backend
│   └── ai-engine/    # FastAPI AI Service
├── packages/
│   └── shared/       # Shared types & validation
├── docker/           # Docker configs
├── docs/             # Documentation
├── .github/          # CI/CD workflows
└── scripts/          # Dev utilities
```

---

## Getting Started

### Prerequisites

- Node.js >= 20
- Python >= 3.11
- PostgreSQL >= 15
- Docker & Docker Compose (optional)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/HireLoop-Ai.git
cd HireLoop-Ai

# 2. Copy environment variables
cp .env.example .env
# Edit .env with your values

# 3. Start with Docker (recommended)
docker compose up -d

# OR start services individually:

# 3a. Start Express API
cd apps/api
npm install
npm run dev

# 3b. Start FastAPI AI Engine
cd apps/ai-engine
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 3c. Start Next.js Frontend
cd apps/web
npm install
npm run dev
```

---

## Development Roadmap

| Phase | Milestones | Focus |
|-------|-----------|-------|
| **Phase 1** | M1–M3 | Foundation — Architecture, DB Schema |
| **Phase 2** | M4–M8 | Auth, RBAC, Core CRUD |
| **Phase 3** | M9–M12 | AI Engine — Parsing, LangGraph, Search |
| **Phase 4** | M13–M18 | Frontend — Dashboard, UI |
| **Phase 5** | M19–M22 | Integration, Email, Testing |
| **Phase 6** | M23–M25 | Docker, NGINX, CI/CD, Deployment |

---

## Team

Built with ❤️ by the HireLoop team.

---

## License

Private — Internal use only.
