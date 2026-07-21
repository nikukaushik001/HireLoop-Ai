import os
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional

# Define the expected combined JSON structure using Pydantic
class CandidateData(BaseModel):
    is_valid_resume: bool = Field(description="Return True if the text resembles a resume, CV, LinkedIn profile, or any professional summary. If in doubt, return True. Return False ONLY if it is obviously a non-resume document like a receipt or ticket.")
    name: str = Field(description="The full name of the candidate")
    email: str = Field(description="The email address of the candidate")
    phone: str = Field(description="The phone number of the candidate, or empty string if not found")
    skills: List[str] = Field(description="A list of technical and soft skills found in the resume")
    experienceYears: int = Field(description="Total years of professional experience, estimated from dates if necessary. Return 0 if none.")
    currentCompany: str = Field(description="The most recent company the candidate worked for, or empty string if none")
    location: str = Field(description="The physical location or city of the candidate, or empty string if not found")
    achievements: List[str] = Field(description="A list of key achievements, honors, awards, hackathons, certifications, research papers, open source contributions, or standout credentials found in the resume. Return empty list if none.")
    score: int = Field(description="A compatibility score between 0 and 100 indicating how well the candidate fits the job description. Default to 50 if job description is empty or not provided.")
    reasoning: str = Field(description="A brief explanation of why this score was given, highlighting matches, missing skills, and potential.")
    culture_fit_summary: str = Field(description="A 2-sentence AI analysis of the candidate's professional trajectory and potential culture fit based on their experience.")

def extract_structured_data(raw_text: str, job_description: str = "") -> dict:
    """
    Uses Groq to extract structured candidate details AND evaluate job fit in a single LLM call.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is missing.")

    # Initialize the Groq LLM
    llm = ChatGroq(
        groq_api_key=api_key,
        model_name="llama-3.3-70b-versatile",
        temperature=0.0
    )

    # Set up the JSON parser
    parser = JsonOutputParser(pydantic_object=CandidateData)

    # Create the prompt template
    prompt = PromptTemplate(
        template="""
You are an expert HR recruiter and Applicant Tracking System (ATS) parser. 
Your task is to extract structured details from the candidate's resume text, identify their key achievements, and evaluate their compatibility against the target job description.

Always return ONLY valid JSON matching the exact schema provided. Do not include markdown code blocks like ```json or any conversational text.

Candidate Resume Text:
{raw_text}

Target Job Description:
{job_description}

Formatting Instructions:
{format_instructions}
""",
        input_variables=["raw_text", "job_description"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    # Create the extraction chain
    chain = prompt | llm | parser

    # Run the chain with retry logic for rate limits
    max_retries = 3
    for attempt in range(max_retries):
        try:
            result = chain.invoke({
                "raw_text": raw_text,
                "job_description": job_description if job_description.strip() else "No job description provided."
            })
            return result
        except Exception as e:
            error_str = str(e).lower()
            if ("rate limit" in error_str or "429" in error_str) and attempt < max_retries - 1:
                import time
                sleep_time = (attempt + 1) * 2
                print(f"Rate limit hit, retrying in {sleep_time} seconds...")
                time.sleep(sleep_time)
            else:
                print(f"Error during Groq extraction and evaluation: {e}")
                raise
