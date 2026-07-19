<div align="center">
  
# 🚀 HireLoop-AI

**Next-Generation AI-Powered Recruitment Platform**

[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)

HireLoop-AI is a powerful, AI-driven applicant tracking system (ATS) that automates the recruitment pipeline. It bridges a robust Node.js backend with a Python AI microservice to parse resumes, extract structured data, and rank candidates against job descriptions using vector embeddings.

</div>

---

## 🌟 Key Features

- **🛡️ Secure Authentication**: JWT-based authentication for recruiters.
- **💼 Job Management**: Create, track, and manage job openings and their requirements.
- **🤖 AI Resume Parsing**: Upload PDFs and automatically extract candidate Name, Email, Phone, Skills, and Experience using **Google Gemini 1.5 Flash** and **LangGraph**.
- **🧠 Semantic Candidate Ranking**: Automatically ranks applicants based on how well their skills match the job description using **HuggingFace (`all-MiniLM-L6-v2`)** vector embeddings and Cosine Similarity.
- **⚡ Microservice Architecture**: Heavy AI processing runs independently on a **FastAPI** server, ensuring the main **Express** backend remains lightning-fast.

---

## 🏗️ Architecture

The project is structured as a monorepo containing two main services:

### 1. Backend (`/backend`)
- **Framework**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL (hosted on Supabase) via Prisma ORM
- **Role**: Handles Auth, CRUD operations, database transactions, and acts as a proxy for resume uploads.

### 2. AI Service (`/ai`)
- **Framework**: Python + FastAPI
- **AI/ML Stack**: LangGraph, Gemini Flash, PyTorch, sentence-transformers, pypdf
- **Role**: Dedicated microservice for PDF parsing, text extraction, structured JSON generation, and generating 384-dimensional vector embeddings.

### 3. Frontend (`/frontend`)
- **Framework**: React + Vite + TypeScript
- **Role**: The user-facing application for recruiters to manage jobs and view ranked candidates.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL Database

### 1. Setup the Backend (Express)
```bash
cd backend
npm install
```
Copy the example environment file and fill in your keys:
```bash
cp .env.example .env
```

**Required Backend Keys to fill in `.env`:**
- **Database:** Supabase/PostgreSQL connection string.
- **Auth:** Generate a secret string for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
- **Google Auth:** `GOOGLE_CLIENT_ID` from the Google Cloud Console for SSO.
- **Email (Nodemailer):** `SMTP_USER` and `SMTP_PASS` (use an App Password if using Gmail).
- **AWS S3 (Resumes):** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_S3_BUCKET_NAME` for resume PDF storage.
- **Redis:** `REDIS_URL` for background task queues (e.g. from Upstash or a local Redis instance).

Run database migrations and start the server:
```bash
npx prisma generate
npx prisma db push
npm run dev
```
*(Runs on `http://localhost:4000`)*

### 2. Setup the AI Service (FastAPI)
Open a new terminal and navigate to the AI service:
```bash
cd ai
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
```
Create a `.env` file in the `ai/` directory:
```env
GEMINI_API_KEY="your_google_gemini_key"
```
Start the AI server:
```bash
uvicorn app.main:app --reload --port 8000
```
*(Runs on `http://localhost:8000`)*

### 3. Setup the Frontend (React + Vite)
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
```
Copy the example environment file and fill in your keys:
```bash
cp .env.example .env
```
**Required Frontend Keys:**
- **`VITE_API_URL`:** The backend URL (e.g. `http://localhost:4000/api/v1`)
- **`VITE_GOOGLE_CLIENT_ID`:** Your Google OAuth client ID

Start the development server:
```bash
npm run dev
```
*(Runs on `http://localhost:5173`)*

### 🚀 Quick Start (Windows)
To quickly launch the Backend, AI Service, and Frontend simultaneously, run the included batch script from the root directory:
```cmd
start_servers.bat
```

---

## 🛣️ API Endpoints

### Auth
- `POST /api/v1/auth/register` - Register a recruiter
- `POST /api/v1/auth/login` - Login to get JWT

### Jobs
- `GET /api/v1/jobs` - List all jobs
- `POST /api/v1/jobs` - Create a job
- `GET /api/v1/jobs/:id/rank` - Get candidates ranked by AI match score!

### Resumes & AI
- `POST /api/v1/resumes/upload` - Upload PDFs (Express forwards to FastAPI)

---

## 📚 Documentation Walkthroughs
For a deep dive into how each day of the backend was built, check out the docs:
- [Day 1-2: Setup, Auth, & Database](./docs/walkthroughs/day-1-2-setup-auth-database.md)
- [Day 3: Jobs & Candidates CRUD](./docs/walkthroughs/day-3-jobs-candidates-crud.md)
- [Day 4: AI Resume Parsing Pipeline](./docs/walkthroughs/day-4-ai-resume-parsing-pipeline.md)
- [Day 5: Express ↔ FastAPI Connection & Ranking](./docs/walkthroughs/day-5-connection-and-ranking.md)

---
<div align="center">
  <i>Built for the Future of Hiring.</i>
</div>
