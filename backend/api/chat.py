from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from starlette.concurrency import run_in_threadpool
from models.schemas import ChatRequest, TokenData
from services.rag import ask_question
from services.auth import get_current_user
from services.evaluator import evaluate_response
from database import get_database

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

@router.get("/history")
async def get_chat_history(current_user: TokenData = Depends(get_current_user)):
    """Return all previous chat messages for the logged-in user, oldest first."""
    try:
        db = get_database()
        chats_collection = db["chats"]
        cursor = chats_collection.find(
            {"username": current_user.username},
            {"_id": 0, "question": 1, "answer": 1, "sources": 1, "timestamp": 1}
        ).sort("timestamp", 1)

        history = []
        async for doc in cursor:
            history.append({
                "question": doc["question"],
                "answer": doc["answer"],
                "sources": doc.get("sources", []),
                "timestamp": doc["timestamp"].isoformat() if doc.get("timestamp") else None,
            })
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def chat(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    current_user: TokenData = Depends(get_current_user)
):
    try:
        # Run the synchronous ask_question in a threadpool to not block event loop
        result = await run_in_threadpool(ask_question, request.question)

        # agent returns {"answer": str, "sources": [...]}
        answer_text = result.get("answer", "") if isinstance(result, dict) else str(result)
        sources = result.get("sources", []) if isinstance(result, dict) else []

        # Save to database
        db = get_database()
        chats_collection = db["chats"]
        chat_document = {
            "username": current_user.username,
            "question": request.question,
            "answer": answer_text,
            "sources": sources,
            "timestamp": datetime.utcnow()
        }
        await chats_collection.insert_one(chat_document)

        # Run evaluation in background so API response is not delayed
        background_tasks.add_task(
            evaluate_response,
            request.question,
            answer_text,
            sources
        )

        return {"question": request.question, "answer": answer_text, "sources": sources}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))