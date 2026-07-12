from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

MODEL = "gpt-4o-mini"


def generate_answer(question: str):

    response = client.responses.create(
        model=MODEL,
        input=question
    )

    return response.output_text