from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END
from app.services.resume_parser import extract_text_from_pdf
from app.services.groq_extractor import extract_structured_data
from app.services.embedding import generate_embedding

class ResumeState(TypedDict):
    pdf_bytes: bytes
    job_description: Optional[str]
    raw_text: Optional[str]
    parsed_data: Optional[dict]
    evaluation: Optional[dict]
    embedding: Optional[list[float]]
    status: str
    error: Optional[str]

def extract_text_node(state: ResumeState):
    try:
        text = extract_text_from_pdf(state["pdf_bytes"])
        if not text:
            return {"status": "failed", "error": "No text could be extracted from PDF. Ensure it is a standard text-based PDF, not a scanned image."}
        return {"raw_text": text, "status": "text_extracted"}
    except Exception as e:
        return {"status": "failed", "error": str(e)}

def parse_and_evaluate_node(state: ResumeState):
    try:
        result = extract_structured_data(state["raw_text"], state.get("job_description", ""))
        if not result:
            return {"status": "failed", "error": "AI failed to parse and evaluate resume."}
            
        if not result.get("is_valid_resume", True):
            return {"status": "failed", "error": "The uploaded file does not appear to be a valid resume or CV. Please upload a real resume."}
            
        # Hard Python Fallback: Even if AI says True, we reject if it doesn't meet basic resume thresholds
        extracted_skills = result.get("skills", [])
        extracted_name = result.get("name", "")
        extracted_email = result.get("email", "")
        extracted_phone = result.get("phone", "")
        raw_text_str = state.get("raw_text", "")
        raw_text_lower = raw_text_str.lower()
        raw_length = len(raw_text_str)
        
        # 1. Reject if it is too short (certificates/receipts are usually very short)
        if raw_length < 300:
            return {"status": "failed", "error": "The uploaded file is too short to be a valid resume. Real resumes contain more detailed history."}
            
        # 2. Reject if no valid name or contact info is found
        if not extracted_name or len(extracted_name.strip()) < 2:
            return {"status": "failed", "error": "No candidate name could be identified. The file does not appear to be a valid resume."}
            
        if not extracted_email and not extracted_phone:
            return {"status": "failed", "error": "No contact information (email or phone) detected. A valid resume must contain contact details."}
            
        # 3. Reject if no skills were found
        if not extracted_skills or len(extracted_skills) < 2:
            return {"status": "failed", "error": "Insufficient skills were detected. The file does not appear to be a valid resume."}
            
        # 4. Hardcoded Keyword Rejection (Block Certificates and Fake Templates)
        if "this is to certify" in raw_text_lower or "certificate of completion" in raw_text_lower or "certificate of participation" in raw_text_lower:
            return {"status": "failed", "error": "This document appears to be a certificate, not a valid resume."}
            
        if "lorem ipsum" in raw_text_lower:
            return {"status": "failed", "error": "This document appears to be a fake dummy template containing placeholder text."}

        
        # Separate the profile details from the evaluation info
        parsed_data = {
            "name": result.get("name", ""),
            "email": result.get("email", ""),
            "phone": result.get("phone", ""),
            "skills": result.get("skills", []),
            "experienceYears": result.get("experienceYears", 0),
            "currentCompany": result.get("currentCompany", ""),
            "location": result.get("location", ""),
            "achievements": result.get("achievements", []),
            "culture_fit_summary": result.get("culture_fit_summary", "")
        }
        
        evaluation = {
            "score": result.get("score", 50),
            "reasoning": result.get("reasoning", "")
        }
        
        return {
            "parsed_data": parsed_data,
            "evaluation": evaluation,
            "status": "parsed_and_evaluated"
        }
    except Exception as e:
        return {"status": "failed", "error": str(e)}

def embed_node(state: ResumeState):
    try:
        # We embed a combination of skills and experience to capture the candidate's core profile
        skills = " ".join(state["parsed_data"].get("skills", []))
        title = state["parsed_data"].get("currentCompany", "")
        text_to_embed = f"{skills} {title}"
        
        embedding = generate_embedding(text_to_embed)
        return {"embedding": embedding, "status": "completed"}
    except Exception as e:
        return {"status": "failed", "error": str(e)}

def route_next(state: ResumeState):
    if state["status"] == "failed":
        return "end"
    if state["status"] == "text_extracted":
        return "parse_and_evaluate"
    if state["status"] == "parsed_and_evaluated":
        return "embed"
    return "end"

# Build Graph
builder = StateGraph(ResumeState)

builder.add_node("extract_text", extract_text_node)
builder.add_node("parse_and_evaluate", parse_and_evaluate_node)
builder.add_node("embed", embed_node)

builder.set_entry_point("extract_text")

builder.add_conditional_edges(
    "extract_text",
    route_next,
    {"parse_and_evaluate": "parse_and_evaluate", "end": END}
)

builder.add_conditional_edges(
    "parse_and_evaluate",
    route_next,
    {"embed": "embed", "end": END}
)

builder.add_conditional_edges(
    "embed",
    route_next,
    {"end": END}
)

graph = builder.compile()

def process_resume_pipeline(pdf_bytes: bytes, job_description: str = None) -> dict:
    """
    Runs the LangGraph pipeline for a single resume PDF.
    """
    initial_state = {
        "pdf_bytes": pdf_bytes,
        "job_description": job_description,
        "raw_text": None,
        "parsed_data": None,
        "evaluation": None,
        "embedding": None,
        "status": "started",
        "error": None
    }
    
    final_state = graph.invoke(initial_state)
    
    # We remove pdf_bytes before returning to save memory
    if "pdf_bytes" in final_state:
        del final_state["pdf_bytes"]
    return final_state
