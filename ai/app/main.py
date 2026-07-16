from fastapi import FastAPI
from app.routers import process
from dotenv import load_dotenv
import os

# Load environment variables from .env file at startup
load_dotenv()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="HireLoop AI Service",
    description="FastAPI service for LangGraph resume parsing and HuggingFace embeddings",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(process.router, prefix="/api/v1/ai", tags=["Process"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
