import os
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional

# Define the expected JSON structure using Pydantic
class CandidateData(BaseModel):
    name: str = Field(description="The full name of the candidate")
    email: str = Field(description="The email address of the candidate")
    phone: str = Field(description="The phone number of the candidate, or empty string if not found")
    skills: List[str] = Field(description="A list of technical and soft skills found in the resume")
    experienceYears: int = Field(description="Total years of professional experience, estimated from dates if necessary. Return 0 if none.")
    currentCompany: str = Field(description="The most recent company the candidate worked for, or empty string if none")
    location: str = Field(description="The physical location or city of the candidate, or empty string if not found")

def extract_structured_data(raw_text: str) -> dict:
    """
    Uses Groq (Llama 3) to extract structured JSON data from raw resume text.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is missing.")

    # Initialize the Groq LLM (llama3-70b-8192 is great for extraction)
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
You are an expert HR recruiter AI. Your task is to extract structured information from the following resume text.
Always return ONLY valid JSON matching the exact schema provided. Do not include markdown code blocks like ```json or any conversational text.

Resume Text:
{raw_text}

Formatting Instructions:
{format_instructions}
""",
        input_variables=["raw_text"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    # Create the extraction chain
    chain = prompt | llm | parser

    # Run the chain
    try:
        # We enforce JSON output strictly
        result = chain.invoke({"raw_text": raw_text})
        return result
    except Exception as e:
        print(f"Error during Groq extraction: {e}")
        raise
