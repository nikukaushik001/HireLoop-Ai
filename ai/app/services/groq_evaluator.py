import os
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

class CandidateEvaluation(BaseModel):
    score: int = Field(description="A score between 0 and 100 indicating how well the candidate fits the job description.")
    reasoning: str = Field(description="A brief explanation of why this score was given, highlighting matches and missing skills.")

def evaluate_candidate(parsed_data: dict, job_description: str) -> dict:
    """
    Evaluates the parsed candidate data against the job description using Groq.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is missing.")

    if not job_description or not job_description.strip():
        return {"score": 50, "reasoning": "No job description provided for evaluation."}

    llm = ChatGroq(
        groq_api_key=api_key,
        model_name="llama-3.3-70b-versatile",
        temperature=0.0
    )

    parser = JsonOutputParser(pydantic_object=CandidateEvaluation)

    prompt = PromptTemplate(
        template="""
You are an expert HR recruiter AI. Your task is to evaluate a candidate's profile against a job description.
Provide a score between 0 and 100, where 100 is a perfect match, and a brief reasoning for your score.
Always return ONLY valid JSON matching the exact schema provided. Do not include markdown code blocks like ```json or any conversational text.

Candidate Profile:
{parsed_data}

Job Description:
{job_description}

Formatting Instructions:
{format_instructions}
""",
        input_variables=["parsed_data", "job_description"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    chain = prompt | llm | parser

    try:
        result = chain.invoke({
            "parsed_data": str(parsed_data),
            "job_description": job_description
        })
        return result
    except Exception as e:
        print(f"Error during Groq evaluation: {e}")
        return {"score": 0, "reasoning": f"Evaluation failed: {str(e)}"}
