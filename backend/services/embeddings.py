from openai import Openai
from dotenv import load_dotenv
import os
load_dotenv()
client=Openai(api_key=os.getenv("OPENAI_API_KEY"))
EMBEDDING_MODEL=os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

def get_embedding(text: str) -> list[float]:
    text=text.replace("\n","")

    response=client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text
    )
    return response.data[0].embeddings
