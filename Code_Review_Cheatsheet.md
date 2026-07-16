# 🎓 The Ultimate Code Review Cheatsheet

If your supervisor asks you to "open the code and show me how X works," use this cheatsheet. It tells you exactly which file to open and what to say.

---

## 1. "Show me how the Frontend connects to the Backend"

**📂 Open File:** `frontend/src/api/client.ts`

**What to point out:**
- Show them the `axios.create()` block.
- **What to say:** *"We use Axios to handle all API requests. We defined a `baseURL` that points to our Node backend (`http://localhost:4000/api/v1`). We also added an **Axios Interceptor** here. This interceptor intercepts every outgoing request and automatically injects our JWT token into the `Authorization` header. This way, we don't have to manually attach the token on every page."*

---

## 2. "Show me your Middleware" (Crucial for Security!)

**📂 Open File:** `backend/src/middleware/auth.middleware.ts`

**What to point out:**
- Scroll to the `requireAuth` function.
- **What to say:** *"This is our Authentication Middleware. Before a user can access protected routes (like uploading a resume), the request hits this function first. It extracts the JWT token from the headers, verifies it using our secret key, and decodes the user's ID. If the token is fake or expired, this middleware instantly blocks the request and throws a 401 Unauthorized error, keeping our database safe."*

**📂 Open File:** `backend/src/app.ts` (Lines 13-17)
- **What to say:** *"We also use a CORS middleware here. We strictly configured it to only accept requests originating from our Vite frontend port (`http://localhost:5173`), protecting us from cross-origin attacks."*

---

## 3. "Show me how Node.js talks to the Python AI"

**📂 Open File:** `backend/src/services/resume.service.ts`

**What to point out:**
- Scroll down to where we build the `FormData` (around Line 34) and use `fetch()` (around Line 42).
- **What to say:** *"Since we use a microservice architecture, Node.js acts as a relay. It takes the PDFs uploaded by the user, converts the RAM buffers back into native `Blob` objects, and builds a new `FormData` payload. It then uses native `fetch` to make an internal HTTP POST request directly to the Python AI service running on port 8000."*

---

## 4. "Show me the AI Pipeline. How does it parse resumes?"

**📂 Open File:** `ai/app/services/langgraph_pipeline.py`

**What to point out:**
- Scroll to the bottom where `builder = StateGraph(ResumeState)` is defined.
- **What to say:** *"We didn't just write a single messy script. We used **LangGraph** to build a resilient State Machine. The pipeline flows through specific nodes:"*
  1. *"First, it hits the `extract_text_node` which uses PyMuPDF to rip the raw text out of the byte stream."*
  2. *"Next, it routes to `parse_json_node` where we query the Llama 3 LLM (via Groq) to intelligently format that raw text into strict JSON."*
  3. *"Finally, it routes to `embed_node` where we use a HuggingFace sentence transformer to convert the candidate's skills into a dense mathematical vector for later ranking."*

---

## 5. "Show me how the AI Ranking math works"

**📂 Open File:** `backend/src/services/ranking.service.ts`

**What to point out:**
- Scroll to the top and point to `private cosineSimilarity(vecA: number[], vecB: number[])`
- **What to say:** *"When we want to rank candidates, we compare the Job's AI embedding against the Candidate's AI embedding. We wrote a custom Cosine Similarity algorithm. It calculates the dot product of the two mathematical arrays and divides it by their magnitudes. It mathematically calculates the angle between the two vectors. An angle of 0 means a 100% semantic match!"*

---

## 6. "How do you handle Errors without crashing the server?"

**📂 Open File:** `backend/src/middleware/error.middleware.ts`

**What to point out:**
- Show them the `globalErrorHandler`.
- **What to say:** *"Instead of writing `try/catch` blocks that send manual error responses in every single controller, we use a centralized Global Error Handler middleware. If any function in our backend throws an `AppError` (like a 404 Not Found), Express catches it here and formats it into a standardized JSON response for the frontend, ensuring our server never crashes."*
