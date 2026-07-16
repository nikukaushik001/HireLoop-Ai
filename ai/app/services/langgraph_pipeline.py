from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END
from app.services.resume_parser import extract_text_from_pdf
from app.services.groq_extractor import extract_structured_data, evaluate_candidate_fit
from app.services.embedding import generate_embedding

class ResumeState(TypedDict):
    job_description: Optional[str]
    pdf_bytes: bytes
    raw_text: Optional[str]
    parsed_data: Optional[dict]
    embedding: Optional[list[float]]
    evaluation: Optional[dict]
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

def parse_json_node(state: ResumeState):
    try:
        data = extract_structured_data(state["raw_text"])
        if not data:
            return {"status": "failed", "error": "Gemini failed to parse JSON."}
        return {"parsed_data": data, "status": "parsed"}
    except Exception as e:
        return {"status": "failed", "error": str(e)}

def embed_node(state: ResumeState):
    try:
        # We embed a combination of skills and experience to capture the candidate's core profile
        skills = " ".join(state["parsed_data"].get("skills", []))
        title = state["parsed_data"].get("currentCompany", "")
        text_to_embed = f"{skills} {title}"
        
        embedding = generate_embedding(text_to_embed)
        return {"embedding": embedding, "status": "embedded"}
    except Exception as e:
        return {"status": "failed", "error": str(e)}

def evaluate_node(state: ResumeState):
    try:
        # If no job description was provided, skip evaluation
        if not state.get("job_description"):
            return {"evaluation": {"score": 0, "reasoning": "No job description provided."}, "status": "completed"}
            
        evaluation = evaluate_candidate_fit(state["parsed_data"], state["job_description"])
        return {"evaluation": evaluation, "status": "completed"}
    except Exception as e:
        return {"status": "failed", "error": str(e)}

def route_next(state: ResumeState):
    if state["status"] == "failed":
        return "end"
    if state["status"] == "text_extracted":
        return "parse_json"
    if state["status"] == "parsed":
        return "embed"
    if state["status"] == "embedded":
        return "evaluate"
    return "end"

# Build Graph
builder = StateGraph(ResumeState)

builder.add_node("extract_text", extract_text_node)
builder.add_node("parse_json", parse_json_node)
builder.add_node("embed", embed_node)
builder.add_node("evaluate", evaluate_node)

builder.set_entry_point("extract_text")

builder.add_conditional_edges(
    "extract_text",
    route_next,
    {"parse_json": "parse_json", "end": END}
)

builder.add_conditional_edges(
    "parse_json",
    route_next,
    {"embed": "embed", "end": END}
)

builder.add_conditional_edges(
    "embed",
    route_next,
    {"evaluate": "evaluate", "end": END}
)

builder.add_conditional_edges(
    "evaluate",
    route_next,
    {"end": END}
)

graph = builder.compile()

def process_resume_pipeline(pdf_bytes: bytes, job_description: str = "") -> dict:
    """
    Runs the LangGraph pipeline for a single resume PDF.
    """
    initial_state = {
        "job_description": job_description,
        "pdf_bytes": pdf_bytes,
        "raw_text": None,
        "parsed_data": None,
        "embedding": None,
        "evaluation": None,
        "status": "started",
        "error": None
    }
    
    final_state = graph.invoke(initial_state)
    
    # We remove pdf_bytes before returning to save memory
    del final_state["pdf_bytes"]
    return final_state
