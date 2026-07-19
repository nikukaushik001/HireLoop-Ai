from sentence_transformers import SentenceTransformer

# Lazy-loaded model
_model = None

def get_model():
    global _model
    if _model is None:
        print("Loading SentenceTransformer model...")
        try:
            _model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"Warning: Could not load SentenceTransformer model: {e}")
            return None
    return _model

def generate_embedding(text: str) -> list[float]:
    """
    Generates a 384-dimensional vector embedding for a given text.
    """
    if not text:
        return []
    
    model = get_model()
    if not model:
        return []
    
    # Generate embedding and convert numpy array to native Python float list
    embedding = model.encode(text)
    return embedding.tolist()
