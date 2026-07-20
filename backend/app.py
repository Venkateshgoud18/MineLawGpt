from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.chat import router as chat_router
from api.upload import router as upload_router
from api.documents import router as documents_router

app = FastAPI(
    title="MineLawGPT",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(upload_router)
app.include_router(documents_router)


@app.get("/")
def root():
    return {
        "message": "MineLawGPT Backend Running"
    }
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }