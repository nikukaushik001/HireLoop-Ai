import os
import json
import google.generativeai as genai

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)

def extract_structured_data(raw_text: str) -> dict:
    """
    Uses Gemini Flash to extract structured candidate information from raw resume text.
    """
    if not api_key:
        print("Warning: GEMINI_API_KEY not set. Returning mock data.")
        return mock_extraction(raw_text)

    prompt = f"""
    You are an expert ATS (Applicant Tracking System) parser.
    Extract the following information from the resume text below and return ONLY a valid JSON object.
    Do not wrap the JSON in markdown blocks like ```json.
    
    Required JSON structure:
    {{
        "name": "string (Full Name)",
        "email": "string (Email Address)",
        "phone": "string (Phone Number)",
        "skills": ["skill1", "skill2"],
        "experienceYears": integer (Total years of experience, estimate if necessary),
        "currentCompany": "string (Most recent company)",
        "location": "string (City, State/Country)"
    }}

    Resume Text:
    {raw_text}
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        # Clean response string to parse JSON
        json_str = response.text.strip()
        if json_str.startswith('```json'):
            json_str = json_str[7:]
        if json_str.endswith('```'):
            json_str = json_str[:-3]
            
        return json.loads(json_str.strip())
    except Exception as e:
        print(f"Error during Gemini extraction: {e}")
        return {}

def mock_extraction(raw_text: str) -> dict:
    return {
        "name": "John Doe (Mock)",
        "email": "johndoe@example.com",
        "phone": "123-456-7890",
        "skills": ["Python", "React", "Node.js"],
        "experienceYears": 3,
        "currentCompany": "Tech Corp",
        "location": "New York, NY"
    }
