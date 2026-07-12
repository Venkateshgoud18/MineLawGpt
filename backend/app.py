from fastapi import FastAPI
from api.chat import router as chat_router

app = FastAPI(title="MineLawGPT")

app.include_router(chat_router)

@app.get("/")
def root():
    return {
        "message": "MineLawGPT Backend Running"
    }