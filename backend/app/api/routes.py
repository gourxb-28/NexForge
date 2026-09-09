from fastapi import APIRouter, HTTPException
from app.models.schemas import ContextRequest, ContextResponse
from app.services.gemini_service import generate_context

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "ok", "message": "NexForge Backend is running!"}

@router.post("/context/generate", response_model=ContextResponse)
def generate_context_route(request: ContextRequest):
    try:
        context = generate_context(request)
        return context
    except ValueError as ve:
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
