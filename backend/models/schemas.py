from pydantic import BaseModel

class ChatRequest(BaseModel):
    question: str

class UserCreate(BaseModel):
    username: str
    password: str

class UserInDB(BaseModel):
    username: str
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class ChatResponse(BaseModel):
    question: str
    answer: str