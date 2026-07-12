from fastapi import FastAPI
from api.chat import router as chat_router

app=FastAPI(
    title="Mine law gpt",
    version="1.0.0",
)
app.include_router(chat_router)

@app.get("/")
def root():
    return {"message":"Welcome to Mine law gpt"}
