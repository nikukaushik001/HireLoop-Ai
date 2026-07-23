from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import asyncio
from app.services.langgraph_pipeline import process_resume_pipeline
from app.services.embedding import generate_embedding

class EmbedRequest(BaseModel):
    text: str

router = APIRouter()

@router.post("/process-resumes")
async def process_resumes(
    files: List[UploadFile] = File(...),
    job_description: Optional[str] = Form(None)
):
    """
    Receives one or more PDF files and an optional job description, 
    runs them through the LangGraph AI pipeline,
    and returns the structured candidate data, evaluation, and embeddings.
    Note: Concurrency is managed by the Node.js BullMQ backend (1 at a time).
    """
    async def process_file(file: UploadFile) -> dict:
        if not file.filename.lower().endswith('.pdf'):
            return {
                "filename": file.filename,
                "status": "failed",
                "error": "Only PDF files are supported."
            }
            
        try:
            pdf_bytes = await file.read()
            # Run the synchronous LangGraph pipeline in a threadpool to avoid blocking event loop
            pipeline_result = await asyncio.to_thread(
                process_resume_pipeline, pdf_bytes, job_description
            )
            return {
                "filename": file.filename,
                "pipeline_result": pipeline_result
            }
        except Exception as e:
            return {
                "filename": file.filename,
                "status": "failed",
                "error": str(e)
            }

    tasks = [process_file(file) for file in files]
    results = await asyncio.gather(*tasks)
            
    return {"success": True, "results": results}

@router.post("/embed")
async def create_embedding(request: EmbedRequest):
    """
    Receives raw text (like a job description) and returns its embedding vector.
    """
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    try:
        embedding = generate_embedding(request.text)
        return {"success": True, "embedding": embedding}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
