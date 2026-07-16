from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
from pydantic import BaseModel
from app.services.langgraph_pipeline import process_resume_pipeline
from app.services.embedding import generate_embedding

class EmbedRequest(BaseModel):
    text: str

router = APIRouter()

@router.post("/process-resumes")
async def process_resumes(
    files: List[UploadFile] = File(...),
    job_description: str = Form("")
):
    """
    Receives one or more PDF files, runs them through the LangGraph AI pipeline,
    and returns the structured candidate data and embeddings.
    """
    results = []
    for file in files:
        if not file.filename.endswith('.pdf'):
            results.append({
                "filename": file.filename,
                "status": "failed",
                "error": "Only PDF files are supported."
            })
            continue
            
        try:
            pdf_bytes = await file.read()
            pipeline_result = process_resume_pipeline(pdf_bytes, job_description)
            
            results.append({
                "filename": file.filename,
                "pipeline_result": pipeline_result
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "failed",
                "error": str(e)
            })
            
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
