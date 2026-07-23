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
        Determine if the uploaded document is a GENUINE and COMPLETE Candidate Resume/CV.
        
        CRITICAL RULES (YOU MUST RETURN FALSE IF ANY OF THESE ARE TRUE):
        1. RETURN FALSE if the document is a college receipt, payment receipt, invoice, bill, or fee structure.
        2. RETURN FALSE if the document is an admit card, hall ticket, ID card, or exam scheduling pass.
        3. RETURN FALSE if the document is a "fake", "dummy", or "example" resume containing placeholder text (e.g., Lorem Ipsum, John Doe generic templates) without real, substantial career history.
        4. RETURN FALSE if the document DOES NOT have clear, identifiable resume sections (e.g., Education, Skills, Work Experience, or Projects).
        5. RETURN FALSE if the document is an exam prep sheet, syllabus, course guide, or study material.
        
        FRESHER RULE: Freshers or recent graduates may not have work experience. A resume with Education, Skills, and Projects (but no work experience) is 100% VALID. Do NOT reject it.
        
        A REAL resume MUST contain a candidate's actual name, a list of actual hard/soft skills, and either real work experience OR real academic projects.
        Return True ONLY if you are 100% confident it is a genuine, real-world resume or CV. When in doubt, RETURN FALSE.
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
Analyze the entire document. You are a strict gatekeeper. Determine its primary purpose:
- If the document is a college receipt, admit card, hall ticket, payment invoice, ID card, or ticket, you MUST classify it as a non-resume (is_valid_resume = false).
- If the document is a dummy template, fake example resume, or contains placeholder text like 'Lorem Ipsum', you MUST classify it as a non-resume (is_valid_resume = false).
- If it is a study guide, syllabus, or list of questions, you MUST classify it as a non-resume (is_valid_resume = false).
- A valid resume MUST have real contact info, and clear, identifiable sections for Skills, Education, and either Work Experience or Projects. If it is just a plain paragraph of text with no resume structure, set is_valid_resume = false.
- FRESHER EXCEPTION: A fresher/student resume without work experience is 100% VALID as long as it has Education, Skills, and Academic Projects.
- If you are not 100% sure it is a real, completed candidate resume, set is_valid_resume = false.

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
            # Add a 1-second sleep to prevent hitting Groq's 30 RPM free tier limit
            import time
            time.sleep(1)
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
