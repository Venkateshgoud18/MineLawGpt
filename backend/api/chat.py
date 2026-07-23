from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest
from services.rag import ask_question

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

@router.post("/")
def chat(request: ChatRequest):
    try:
        return ask_question(request.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))