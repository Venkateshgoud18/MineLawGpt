from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    question: str

class Source(BaseModel):
    document:str
    page:int

class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[Source]] = None
