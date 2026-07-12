from services.embeddings import get_embedding
from services.vector_store import collection


def retrieve(question: str, k: int = 5):

    embedding = get_embedding(question)

    results = collection.query(
        query_embeddings=[embedding],
        n_results=k
    )

    return results