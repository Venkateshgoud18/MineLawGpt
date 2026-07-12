from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest
from services.llm import generate_answer

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

@router.post("/")
def chat(request: ChatRequest):
    try:
        answer = generate_answer(request.question)

        return {
            "answer": answer
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))