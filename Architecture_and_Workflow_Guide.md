# HireLoop-AI: Technical Architecture & Deep Dive Guide

This document is designed to prepare your team for a rigorous technical review. It explains **how** the system works, **why** these specific architectural decisions were made, and traces the data flow deep into the code so anyone on the team can answer complex questions from a senior engineer.

---

## 1. High-Level Architecture Overview

HireLoop-AI uses a **Microservices Architecture** built on a "Triple Stack" (Frontend -> Core Backend -> AI Backend). 

### Why not put everything in one server?
A senior engineer will almost certainly ask: *"Why did you separate Node.js and Python?"*
**The Answer:** Separation of concerns and resource scaling. 
- **Node.js (Express)** is highly efficient at asynchronous I/O operations. It handles thousands of simultaneous users reading jobs, authenticating, and updating the database without blocking the main thread.
- **Python (FastAPI)** is the undisputed king of Machine Learning. Libraries for LangGraph, AI vector embeddings, and PyMuPDF are native to Python. AI operations are **CPU/Memory bound**. If we put heavy AI processing inside Node.js, it would block the event loop, causing the entire website to freeze for all users while one resume is parsed. By splitting them, we can scale the AI service independently on GPU/high-CPU servers, while the Node backend runs cheaply on standard web servers.

---

## 2. The Tech Stack Deep Dive

### A. The Frontend (Vite + React)
- **Why Vite?** It uses native ES modules, making local development server startup nearly instantaneous compared to older bundlers like Webpack (Create React App).
- **State Management:** We use the React Context API (`AuthContext`) for global state (like user login tokens) rather than Redux, keeping the bundle lightweight since our state is relatively simple.
- **API Communication:** We use `Axios` (`apiClient.ts`). It automatically attaches our JWT (JSON Web Token) to the `Authorization: Bearer <token>` header of every outgoing request via an **Axios Interceptor**.

### B. The Core Backend (Node.js + Express)
- **Database:** Supabase (PostgreSQL). We connect to it using **Prisma ORM**.
  - *Why Prisma?* It provides strict TypeScript typing. If the database schema changes, the TypeScript compiler will immediately flag errors in our code where old fields were used, preventing runtime crashes.
  - *Connection Pooling:* We use Supabase's transaction pooler (port 6543) for the `DATABASE_URL` to prevent exhausting database connections when multiple Express instances or serverless functions spin up.
- **Authentication:** JWT (JSON Web Token). We issue a short-lived Access Token for security. Express verifies this token in the `requireAuth` middleware before allowing access to protected routes.

### C. The AI Backend (Python + FastAPI)
- **Why FastAPI?** It is asynchronous (like Node.js) and uses Pydantic for data validation. It automatically generates Swagger documentation and is currently the industry standard for wrapping ML models.
- **Orchestration:** **LangGraph**. We treat resume parsing as a "State Graph" (a pipeline) rather than a single script. 
  - *Why LangGraph?* If a resume fails at the text-extraction stage, the graph gracefully catches it and stops. If it succeeds, it routes the data to the LLM. It allows us to build complex, multi-agent workflows in the future (like having one agent review skills and another review education) without creating spaghetti code.

---

## 3. Data Flow: "What happens when a user uploads a Resume?"

If asked to trace the exact flow of data from click to database, walk through this sequence:

### Step 1: The Browser (Frontend)
1. In `ResumesPage.tsx`, the user selects PDF files.
2. The browser generates a `FormData` object. *Crucial Detail:* We do **NOT** manually set `Content-Type: multipart/form-data`. We let Axios and the browser set it automatically because the browser must generate a unique "boundary" string to separate multiple files in the HTTP payload.
3. Axios sends an HTTP POST request to `http://localhost:4000/api/v1/resumes/upload`.

### Step 2: The Core Backend (Express)
1. The request hits Express. The `requireAuth` middleware validates the JWT token.
2. The route uses **Multer** (`upload.array('files')`) to parse the incoming multipart data. Multer reads the byte streams into server RAM (`file.buffer`).
3. The `ResumeController` forwards the files to `ResumeService.processResumes()`.
4. **The Relay:** The Node.js backend acts as a secure intermediary. It creates a *new* `FormData` object, converts the RAM buffers back into Blobs, and sends a `fetch` POST request to the Python FastAPI server at `http://127.0.0.1:8000/api/v1/ai/process-resumes`.

### Step 3: The AI Backend (FastAPI)
1. FastAPI receives the files. For each file, it triggers the **LangGraph Pipeline**.
2. **Node 1 (PyMuPDF):** Reads the PDF byte stream and extracts raw unstructured text.
3. **Node 2 (Groq LLM):** Sends the raw text to `llama-3.3-70b-versatile` via the Groq API. 
   - *Prompt Engineering:* We use a `JsonOutputParser` from Langchain. The LLM is strictly instructed to return a JSON object matching our exact Pydantic schema (Name, Email, Skills, Experience).
4. **Node 3 (Embedding):** We combine the candidate's Skills and Job Title into a single string. We pass this string through the `all-MiniLM-L6-v2` Sentence Transformer. This converts the text into a dense 384-dimensional mathematical vector (an array of 384 floating-point numbers) representing the semantic "meaning" of the candidate's profile.
5. FastAPI returns the JSON data and the 384-d vector back to the Node backend.

### Step 4: The Database (Express -> Prisma)
1. The Node backend receives the structured data.
2. It uses `prisma.candidate.upsert()` to save the candidate details, and saves the embedding vector.
3. It creates an `Application` record linking the Candidate to the Job.

---

## 4. How does AI Candidate Ranking Work?

When the user clicks "Rank Candidates with AI":

1. During Job Creation, the Node backend silently called the AI `/embed` endpoint to convert the Job Description and Requirements into a 384-dimensional vector.
2. When ranking is triggered, `ranking.service.ts` pulls the **Job Vector** and the **Candidate Vector** from the database.
3. It runs a **Cosine Similarity Algorithm**. 
   - *How it works:* Vectors are just arrows pointing in a 384-dimensional space. Cosine Similarity measures the angle between the Job arrow and the Candidate arrow. If they point in the exact same direction, the score is `1.0` (100% match). If they point in perpendicular directions, the score is `0.0`.
   - *Why this is powerful:* It doesn't rely on exact keyword matches. If a job asks for "Frontend Developer" and the candidate wrote "React UI Engineer", the LLM embedding knows these concepts exist in the same semantic space, resulting in a high match score!

---

## 5. Potential "Gotcha" Questions from a Senior Engineer

**Q: What happens if Groq API goes down or takes too long?**
> "Our AI backend is designed to handle failures gracefully. The LangGraph pipeline wraps the LLM call in a try/catch block. If Groq times out, the pipeline status updates to `failed` and returns the error to Node.js. Node.js continues processing the remaining resumes in the batch without crashing the whole server, and returns a 'failed' status for that specific file to the frontend UI, so the user knows exactly which resume failed."

**Q: Why are we sending files from Frontend -> Node -> Python? Why not Frontend -> Python directly?**
> "Security and Database integrity. If the frontend talked directly to the AI service, we would have to duplicate our entire JWT Authentication logic, Job ID validation, and database saving logic in Python. By using Node as an API Gateway, Python remains a 'dumb', stateless processing engine. Node handles all security, routing, and database writes."

**Q: How do you handle CORS (Cross-Origin Resource Sharing)?**
> "CORS is handled at the Express middleware layer using the `cors` package, restricted to our exact Vite frontend origin (`localhost:5173`). The Python backend does not need strict CORS because it sits behind our firewall and is only accessed by the Node backend via `127.0.0.1`, never directly from the user's browser."

**Q: Why store embeddings in PostgreSQL instead of a dedicated Vector DB like Pinecone?**
> "To reduce infrastructure complexity for our MVP. PostgreSQL (via the `pgvector` extension, if enabled, or raw arrays in our current schema) can easily handle thousands of vectors. Adding Pinecone would introduce network latency and require syncing two separate databases (keeping relational candidate data in Postgres and vectors in Pinecone). Keeping it unified in Postgres is the most resilient architectural choice for this stage."
