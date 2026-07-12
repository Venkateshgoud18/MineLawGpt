from fastapi import APIRouter,HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.rag import ask_question

router=APIRouter(
    prefix="/chat",
    tags=["chat"]
)

@router.post("/", response_model=ChatResponse)
async def chat(request:ChatRequest):
    try:
        responce=ask_question(request.question)
        return responce
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
