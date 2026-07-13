# Day 5: Connection & AI Resume Ranking

The bridge between the Express backend and the FastAPI AI service is now fully complete, along with the candidate ranking system! 🚀

## 1. The Bridge (`Resume Service & Controller`)
When a recruiter uploads resumes, the Express backend acts as a smart proxy:
- We configured `multer` in `backend/src/routes/resume.routes.ts` to accept up to 20 PDF files in memory at a time.
- The `ResumeService` takes these files, packages them as `multipart/form-data`, and forwards them to the FastAPI `POST /process-resumes` endpoint.
- Once FastAPI returns the parsed candidate data (Name, Email, Skills, Experience) and the **384-dimensional HuggingFace vector embedding**, Express saves everything to the PostgreSQL database!

**New Endpoint:**
- `POST /api/v1/resumes/upload` (Requires `jobId` in body + PDF files)

## 2. The Ranking Engine (Cosine Similarity)
To rank candidates for a job, we built a mathematics-based comparison engine:
- We created `backend/src/services/ranking.service.ts` which implements a **Cosine Similarity** algorithm in pure TypeScript. 
- It works by taking the Job Description (Title + Requirements) and passing it to a brand new `POST /embed` endpoint we added to FastAPI.
- It then compares the Job's vector embedding against the vector embeddings of all Candidates who applied.
- The result is a highly accurate `0-100%` match score representing how well their skills align with the job!

**New Endpoints:**
- **Express**: `GET /api/v1/jobs/:id/rank` (Returns all candidates for a job, sorted by AI match score)
- **FastAPI**: `POST /api/v1/ai/embed` (Generates text embeddings on demand)

## What's Next?
The backend architecture is **100% complete**! 🎉
1. Database & Auth (Done)
2. Jobs & Candidates CRUD (Done)
3. Python AI Pipeline with LangGraph & Gemini (Done)
4. Express ↔ FastAPI API Connection & AI Ranking (Done)

The next step is to boot up both servers and connect the Frontend to test the end-to-end flow!
