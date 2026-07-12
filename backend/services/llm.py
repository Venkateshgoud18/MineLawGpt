from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

CHAT_MODEL = os.getenv(
    "CHAT_MODEL",
    "gpt-5.5"
)


def generate_answer(context: str, question: str):

    prompt = f"""
You are MineLawGPT.

Answer ONLY using the provided mining regulatory context.

If the answer cannot be found, say:

"I could not find this information in the uploaded documents."

Context:

{context}

Question:

{question}
"""

    response = client.responses.create(
        model=CHAT_MODEL,
        input=prompt
    )

    return response.output_text