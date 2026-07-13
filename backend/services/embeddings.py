from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

EMBEDDING_MODEL = "text-embedding-3-small"


def get_embedding(text: str):
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text.replace("\n", " ")
    )

    return response.data[0].embedding


def get_embeddings(texts: list[str]):
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=[t.replace("\n", " ") for t in texts]
    )

    return [item.embedding for item in response.data]