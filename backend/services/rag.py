from services.retriever import retrieve
from services.llm import generate_answer


def ask_question(question: str):

    results = retrieve(question)

    context = "\n".join(results["documents"][0])

    answer = generate_answer(context, question)

    return {
        "answer": answer,
        "sources": results["metadatas"][0]
    }