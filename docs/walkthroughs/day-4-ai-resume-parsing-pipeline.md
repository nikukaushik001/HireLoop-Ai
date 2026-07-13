# Day 4: AI Resume Parsing Pipeline

## What was built (`ai/` directory):
1. **`app/main.py`**: A dedicated FastAPI server that runs independently of Express, keeping heavy AI processing from blocking the main backend.
2. **`app/services/resume_parser.py`**: Uses `pypdf` to extract raw, unstructured text from uploaded PDF resumes.
3. **`app/services/gemini_extractor.py`**: Takes the raw text and sends it to `gemini-1.5-flash` with a strict prompt to extract a structured JSON object containing the candidate's name, skills, experience, and contact info.
4. **`app/services/embedding.py`**: Uses HuggingFace's `all-MiniLM-L6-v2` via `sentence-transformers` to generate a 384-dimensional vector embedding of the candidate's skills and title. This is crucial for Resume Ranking.
5. **`app/services/langgraph_pipeline.py`**: A LangGraph `StateGraph` that orchestrates the entire flow: `Extract Text` → `Parse JSON` → `Generate Embedding`. If any step fails, it safely catches the error and short-circuits.
6. **`app/routers/process.py`**: Exposes the `POST /api/v1/ai/process-resumes` endpoint which receives multipart PDF file uploads and runs them through the pipeline.

## LangGraph State Machine:
```
[Extract Text] → [Parse JSON via Gemini] → [Generate Embedding via HuggingFace] → END
       ↓ (fail)            ↓ (fail)                      ↓ (fail)
      END                 END                            END
```

## Tech Stack for AI Service:
- **FastAPI** - Python async web framework
- **LangGraph** - State graph orchestration for AI workflows
- **Google Gemini Flash** - LLM for structured data extraction
- **HuggingFace sentence-transformers** - Local embedding model (`all-MiniLM-L6-v2`)
- **pypdf** - PDF text extraction
- **PyTorch** - ML runtime for sentence-transformers

## How to Run:
```bash
cd ai
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

## API Endpoint:
- `POST /api/v1/ai/process-resumes` - Upload PDF files for AI parsing
- `GET /health` - Health check
