from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.chat import router as chat_router
from api.upload import router as upload_router
from api.documents import router as documents_router
from api.speech import router as speech_router
from api.auth import router as auth_router
from database import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_to_mongo()
    yield
    close_mongo_connection()

app = FastAPI(
    title="MineLawGPT",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(upload_router)
app.include_router(documents_router)
app.include_router(speech_router)

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