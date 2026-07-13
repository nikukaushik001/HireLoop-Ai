from sentence_transformers import SentenceTransformer

# Load model globally so it's only loaded once on startup
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception as e:
    print(f"Warning: Could not load SentenceTransformer model: {e}")
    model = None

def generate_embedding(text: str) -> list[float]:
    """
    Generates a 384-dimensional vector embedding for a given text.
    """
    if not model or not text:
        return []
    
    # Generate embedding and convert numpy array to native Python float list
    embedding = model.encode(text)
    return embedding.tolist()
