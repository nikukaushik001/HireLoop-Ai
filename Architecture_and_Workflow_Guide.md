# 🚀 HireLoop-AI: Technical Architecture & Deep Dive Guide

This document is designed to prepare your team for a rigorous technical review. It explains **how** the system works, **why** these specific architectural decisions were made, and traces the data flow deep into the code so anyone on the team can answer complex questions from a senior engineer.

---

## 1. High-Level Architecture Overview

HireLoop-AI uses a **Microservices Architecture** built on a "Triple Stack" (Frontend -> Core Backend -> AI Backend) connected by a high-performance **Message Queue (BullMQ + Redis)**. 

### Why not put everything in one server?
A senior engineer will almost certainly ask: *"Why did you separate Node.js and Python?"*
**The Answer:** Separation of concerns and resource scaling. 
- **Node.js (Express)** is highly efficient at asynchronous I/O operations. It handles thousands of simultaneous users reading jobs, authenticating, and updating the database without blocking the main thread.
- **Python (FastAPI)** is the undisputed king of Machine Learning. Libraries for LangGraph, AI vector embeddings, and PDF extraction are native to Python. AI operations are **CPU/Memory bound**. If we put heavy AI processing inside Node.js, it would block the event loop, causing the entire website to freeze for all users while one resume is parsed. By splitting them, we can scale the AI service independently on GPU/high-CPU servers.

---

## 2. The Tech Stack Deep Dive

### A. The Frontend (Vite + React)
- **Why Vite?** It uses native ES modules, making local development server startup nearly instantaneous compared to older bundlers like Webpack (Create React App).
- **State Management:** We use the React Context API (`AuthContext`) for global state (like user login tokens) rather than Redux, keeping the bundle lightweight since our state is relatively simple.
- **API Communication:** We use `Axios` (`apiClient.ts`). It automatically attaches our JWT (JSON Web Token) to the `Authorization: Bearer <token>` header of every outgoing request via an **Axios Interceptor**.

### B. The Core Backend (Node.js + Express)
- **Database:** Supabase (PostgreSQL). We connect to it using **Prisma ORM**.
  - *Why Prisma?* It provides strict TypeScript typing. If the database schema changes, the TypeScript compiler will immediately flag errors in our code where old fields were used, preventing runtime crashes.
- **Background Workers (BullMQ):** We use BullMQ backed by a local Redis instance. This allows us to handle heavy tasks (like parsing 500 resumes or sending emails) asynchronously in the background.

### C. The AI Backend (Python + FastAPI)
- **Why FastAPI?** It is asynchronous (like Node.js) and uses Pydantic for data validation. It automatically generates Swagger documentation and is currently the industry standard for wrapping ML models.
- **Orchestration:** **LangGraph**. We treat resume parsing as a "State Graph" (a pipeline) rather than a single script. 
  - *Why LangGraph?* If a resume fails at the text-extraction stage, the graph gracefully catches it and stops. If it succeeds, it routes the data to the LLM. It allows us to build complex, multi-agent workflows in the future.

---

## 3. Data Flow: "What happens when a user uploads 500 Resumes?"

If asked to trace the exact flow of data from click to database, walk through this sequence:

### Step 1: The Browser (Frontend)
1. In `ResumesPage.tsx`, the user selects up to 500 PDF files and clicks upload.
2. The browser generates a `FormData` object.
3. Axios sends an HTTP POST request to `http://api.hireloopai.me/api/v1/resumes/upload`.

### Step 2: The Core Backend (Express) & S3 Storage
1. The request hits Express. The `requireAuth` middleware validates the JWT token.
2. The route uses **Multer** to parse the incoming multipart data and temporarily stores the PDFs in memory/disk.
3. The `ResumeController` immediately uploads the raw PDF files directly to an **AWS S3 Bucket** and gets a secure URL back.
4. It creates a Database record for the candidate with a status of `PROCESSING`.
5. It then adds a Job to the **BullMQ Redis Queue** (e.g., "Parse Resume ID #123") and instantly returns an HTTP 200 Success to the Frontend. 
   - *Why is this amazing?* The user doesn't have to sit at their computer waiting for 500 resumes to be read by an AI. The UI is instantly freed up!

### Step 3: The Background Worker & AI Backend (FastAPI)
1. The BullMQ Worker pulls the job from Redis in the background.
2. The Worker makes a request to the Python FastAPI server at `http://127.0.0.1:8000/api/v1/ai/process-resumes`, passing the PDF file.
3. **Node 1 (PyPDF):** Reads the PDF and extracts raw unstructured text. It checks if the text is empty (e.g. an image) and fails early if so.
4. **Node 2 (Groq LLM):** Sends the raw text to `llama-3.3-70b-versatile` via the Groq API. 
   - *Prompt Engineering & Validation:* We instruct the LLM to return strict JSON. The very first field it evaluates is `is_valid_resume`. If the uploaded file is a restaurant receipt or a fake document, it flags it as `False` and halts parsing.
5. **Node 3 (Embedding):** We combine the candidate's Skills and Job Title into a single string. We pass this string through the `all-MiniLM-L6-v2` Sentence Transformer. This converts the text into a dense 384-dimensional mathematical vector representing the semantic "meaning" of the candidate's profile.
6. FastAPI returns the structured JSON and the 384-d vector back to the Node worker.

### Step 4: Database Update (Express Worker -> Prisma)
1. The Node Worker receives the structured data.
2. It uses `prisma.candidate.update()` to save the extracted skills, experience, and the embedding vector, changing the status from `PROCESSING` to `COMPLETED`.

---

## 4. How does AI Candidate Ranking Work?

When a Recruiter views a Job:
1. During Job Creation, the Node backend silently called the AI `/embed` endpoint to convert the Job Description and Requirements into a 384-dimensional vector.
2. When ranking is triggered, `ranking.service.ts` pulls the **Job Vector** and all applicant **Candidate Vectors** from the database.
3. It runs a **Cosine Similarity Algorithm**. 
   - *How it works:* Vectors are just arrows pointing in a 384-dimensional space. Cosine Similarity measures the angle between the Job arrow and the Candidate arrow. If they point in the exact same direction, the score is `1.0` (100% match). If they point in perpendicular directions, the score is `0.0`.
   - *Why this is powerful:* It doesn't rely on exact keyword matches. If a job asks for "Frontend Developer" and the candidate wrote "React UI Engineer", the AI mathematical embedding knows these concepts exist in the same semantic space, resulting in a high match score!

---

## 5. Potential "Gotcha" Questions from a Senior Engineer

**Q: What happens if Groq API goes down or takes too long?**
> "Because we use BullMQ, our system handles failures gracefully. If Groq times out, the background worker catches the error and marks the job as `FAILED` in the database. The worker simply moves on to the next resume in the queue. The whole server doesn't crash, and the UI remains perfectly responsive. We can even configure BullMQ to automatically retry failed jobs 3 times with exponential backoff!"

**Q: Why are we sending files from Frontend -> Node -> Python? Why not Frontend -> Python directly?**
> "Security and Database integrity. If the frontend talked directly to the AI service, we would have to duplicate our entire JWT Authentication logic, Job ID validation, and database saving logic in Python. By using Node as an API Gateway and orchestrator, Python remains a 'dumb', stateless processing engine. Node handles all security, routing, and database writes."

**Q: How do you handle CORS (Cross-Origin Resource Sharing)?**
> "CORS is handled at the Express middleware layer using the `cors` package, restricted to our exact production frontend origin (`hireloopai.me`). The Python backend does not need strict CORS because it sits behind our firewall and is only accessed by the Node backend via `127.0.0.1`, never directly from the open internet."
