import os
import sys

# Add the parent directory to sys.path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv('.env')

from app.services.groq_extractor import extract_structured_data

def test_groq():
    raw_text = "John Doe, Software Engineer, 5 years experience in Python and React. Worked at Google."
    try:
        print("Testing Groq extraction...")
        data = extract_structured_data(raw_text)
        print("Success!", data)
    except Exception as e:
        print("Failed!", str(e))

if __name__ == "__main__":
    test_groq()
