import os
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional

# Define the expected combined JSON structure using Pydantic
class CandidateData(BaseModel):
    is_valid_resume: bool = Field(
        description="""
        Determine if the uploaded document is an actual Candidate Resume/CV.
        
        CRITICAL RULES:
        1. A valid resume is a personal career history document created by an individual applying for a job, typically containing contact info, chronological employment history, and education details.
        
        2. RETURN FALSE IF:
           - The document is a travel ticket (train, flight, bus), booking confirmation, receipt, invoice, or utility bill.
           - The document is a list of interview questions, exam prep sheet, syllabus, assignment, or course tutorial, even if it lists a creator's name and experience at the top.
           - The document is a general book chapter, research paper, documentation guide, or corporate report.
           - The document is missing a chronological work history or personal profile.
        
        Return True ONLY if the document is a genuine resume/CV. If it is any other type of document, return False.
        """
    )
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
You are an expert HR Recruiter and Applicant Tracking System (ATS) document classifier.
Your task is to analyze the Candidate Resume Text and extract structured details only if the document is a genuine resume.

STEP 1: Classify the Document
Analyze the entire document. Determine its primary purpose and layout:
- If the document contains lists of study questions, exam mock papers, train/flight ticket booking layouts, general articles, or homework tasks, classify it as a non-resume (is_valid_resume = false).
- A teacher's study guide that says "Prepared by: Prof. John Doe, 10 years experience" is a study guide, not a resume. Classify it as is_valid_resume = false.
- A resume must look like a personal application: it has contact info, past employers with dates, and a personal list of skills.

STEP 2: Parse Candidates
If and only if `is_valid_resume` is True, extract the candidate details.
If `is_valid_resume` is False, return empty values for all other fields (name, email, skills, experience, etc.) and write the reason in the `reasoning` field.

Always return ONLY valid JSON matching the exact schema provided. Do not include markdown code blocks like ```json.

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
