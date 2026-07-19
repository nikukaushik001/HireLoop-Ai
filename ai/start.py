import os
import uvicorn

if __name__ == "__main__":
    # Render automatically sets the PORT environment variable.
    # We default to 10000 if it's not set.
    port = int(os.environ.get("PORT", 10000))
    
    print(f"Starting server on port {port}...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
