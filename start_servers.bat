@echo off
start "Frontend" cmd /k "cd frontend && npm run dev"
start "Backend" cmd /k "cd backend && npm run dev"
start "AI" cmd /k "cd ai && venv\Scripts\uvicorn app.main:app --port 8000 --reload"
