import os
import sys
import requests

# Add the parent directory to the path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Manually load GROQ_API_KEY from .env
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
if os.path.exists(env_path):
    print(f"Reading env from {env_path}")
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                key, val = line.split('=', 1)
                os.environ[key.strip()] = val.strip().strip('"').strip("'")

from app.services.groq_extractor import extract_structured_data

test_text = """
John Doe
Email: john.doe@example.com
Phone: +1-555-0199
Location: San Francisco, CA

Professional Experience:
Software Engineer at TechCorp (June 2021 - Present)
- Developed and maintained web applications using Python, TypeScript, and React.
- Optimized database queries to improve performance by 30%.

Skills:
Python, TypeScript, React, PostgreSQL, Docker, Git, Agile, Communication
"""

print("Running Groq extraction test...")
try:
    result = extract_structured_data(test_text)
    print("Success! Extracted data:")
    import json
    print(json.dumps(result, indent=2))
except Exception as e:
    print(f"Extraction failed with error: {e}")
    sys.exit(1)

