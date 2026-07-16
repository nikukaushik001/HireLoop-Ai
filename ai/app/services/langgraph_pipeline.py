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
            return {"status": "failed", "error": "No text could be extracted from PDF."}
        return {"raw_text": text, "status": "text_extracted"}
    except Exception as e:
        return {"status": "failed", "error": str(e)}

def parse_and_evaluate_node(state: ResumeState):
    try:
        result = extract_structured_data(state["raw_text"], state.get("job_description", ""))
        if not result:
            return {"status": "failed", "error": "AI failed to parse and evaluate resume."}
        
        # Separate the profile details from the evaluation info
        parsed_data = {
            "name": result.get("name", ""),
            "email": result.get("email", ""),
            "phone": result.get("phone", ""),
            "skills": result.get("skills", []),
            "experienceYears": result.get("experienceYears", 0),
            "currentCompany": result.get("currentCompany", ""),
            "location": result.get("location", ""),
            "achievements": result.get("achievements", [])
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
