import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.api.routes import router
from app.services.gemini_service import configure_gemini

app = FastAPI(title="NexForge Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    configure_gemini()
    print("Gemini API configured successfully.")
except ValueError as e:
    print(f"WARNING: {e}")
    print("AI Mode will fail until GEMINI_API_KEY is set in backend/.env")

app.include_router(router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
