from models.schemas import ChatResponse,Source

def ask_question(question:str)->ChatResponse:
    return ChatResponse(
        answer=f"You asked: {question}",
        sources=[
            Source(
                document="Demo.pdf",
                page=1
            )
        ]
    )