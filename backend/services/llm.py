from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

MODEL = "gpt-4o-mini"


def generate_answer(question, context):

    prompt = f"""
You are MineLawGPT, an intelligent assistant designed to help with mining laws and regulations.

Answer ONLY using the context below.

If the answer is not present, say:
"I could not find this information in the uploaded mining documents."

Context:
{context}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": question}
        ]
    )

    return response.choices[0].message.content