from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

MODEL = "gpt-5.5"


def generate_answer(question, context):

    prompt = f"""
You are MineLawGPT.

Answer ONLY using the context below.

If the answer is not present, say:
"I could not find this information in the uploaded mining documents."

Context:
{context}

Question:
{question}
"""

    response = client.responses.create(
        model=MODEL,
        input=prompt
    )

    return response.output_text