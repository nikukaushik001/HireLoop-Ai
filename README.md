<div align="center">
  
# 🚀 HireLoop-AI (Vercel + EC2 Production)

**Next-Generation AI-Powered Recruitment Platform**

[![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
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

- **🛡️ Secure Multi-Role Authentication**: JWT and Google OAuth authentication for Recruiters, with a dedicated SuperAdmin portal for user approval and access revocation.
- **💼 Job Management**: Create, track, and manage job openings and their requirements.
- **🤖 AI Resume Parsing**: Upload PDFs and automatically extract candidate Name, Email, Phone, Skills, and Experience using **Google Gemini 1.5 Flash** and **LangGraph**.
- **🧠 Semantic Candidate Ranking**: Automatically ranks applicants based on how well their skills match the job description using **HuggingFace (`all-MiniLM-L6-v2`)** vector embeddings and Cosine Similarity.
- **⚡ Microservice Architecture**: Heavy AI processing runs independently on a **FastAPI** server, ensuring the main **Express** backend remains lightning-fast.
- **🌐 Cloud Native Deployment**: Frontend hosted statically on **Vercel** with the Node.js/Python microservices clustered via **PM2** on **AWS EC2**.

---

## 🏗️ Architecture

The project is structured as a monorepo containing three main services:

### 1. Frontend (`/frontend`)
- **Framework**: React + Vite + TypeScript (Deployed on **Vercel**)
- **Role**: The premium, glassmorphism-styled UI for recruiters to manage jobs, view ranked candidates, and for SuperAdmins to approve/revoke access.

### 2. Backend (`/backend`)
- **Framework**: Node.js + Express.js + TypeScript (Deployed on **AWS EC2**)
- **Database**: PostgreSQL (hosted on Supabase) via Prisma ORM, Redis (for BullMQ)
- **Role**: Handles Auth, CRUD operations, background email jobs (AWS SES), database transactions, and acts as a proxy for resume uploads to AWS S3.

### 3. AI Service (`/ai`)
- **Framework**: Python + FastAPI (Deployed on **AWS EC2** via Docker)
- **AI/ML Stack**: LangGraph, Gemini Flash, PyTorch, sentence-transformers, pypdf
- **Role**: Dedicated microservice for PDF parsing, text extraction, structured JSON generation, and generating 384-dimensional vector embeddings.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL Database
- Redis (Upstash or local)

### 1. Setup the Backend (Express)
```bash
cd backend
npm install
cp .env.example .env
```
Run database migrations and start the server:
```bash
npx prisma generate
npx prisma db push
npm run dev
```

### 2. Setup the AI Service (FastAPI)
```bash
cd ai
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate
pip install -r requirements.txt
```
Start the AI server:
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Setup the Frontend (React + Vite)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 🚀 Quick Start (Windows)
To quickly launch the Backend, AI Service, and Frontend simultaneously, run the included batch script from the root directory:
```cmd
start_servers.bat
```

---

## ☁️ Production Deployment

### Frontend (Vercel)
The React frontend is optimized for Vercel. 
- Ensure `vercel.json` contains rewrites for SPA routing to avoid 404s.
- Environment variables (`VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`) must be set in the Vercel dashboard.

### Backend + AI (AWS EC2)
The backend is orchestrated using PM2 to run both the API and background workers concurrently.
- Run `npm run build` to compile TypeScript.
- Run `pm2 start ecosystem.config.js` to launch the Node services and Python server.
- Reverse proxy managed via Nginx mapping `api.yourdomain.com` to internal ports.

---

<div align="center">
  <i>Built for the Future of Hiring.</i>
</div>
