from services.retriever import retrieve
from services.llm import generate_answer


def ask_question(question: str):

    # Retrieve relevant chunks from ChromaDB
    results = retrieve(question)

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    # No matching documents
    if not documents:
        return {
            "answer": "I could not find this information in the uploaded mining documents.",
            "sources": []
        }

    # Combine retrieved chunks into one context
    context = "\n\n".join(documents)

    # Generate answer using retrieved context
    answer = generate_answer(
        question=question,
        context=context
    )

    # Prepare sources
    sources = []

    for meta in metadatas:
        sources.append(
            {
                "document": meta.get("document", "Unknown"),
                "page": meta.get("page", 0)
            }
        )

    return {
        "answer": answer,
        "sources": sources
    }