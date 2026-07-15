import time
print("Importing sentence_transformers...")
t = time.time()
from sentence_transformers import SentenceTransformer
print(f"Imported in {time.time() - t:.2f}s")

print("Loading model 'all-MiniLM-L6-v2'...")
t = time.time()
model = SentenceTransformer('all-MiniLM-L6-v2')
print(f"Loaded in {time.time() - t:.2f}s")
