from services.pdf_loader import extract_pdf
from services.chunker import chunk_document
from services.embeddings import get_embeddings
from services.vector_store import collection

import uuid


def index_pdf(pdf_path, filename):

    pages = extract_pdf(pdf_path)

    chunks = chunk_document(pages)

    texts = [chunk["text"] for chunk in chunks]

    embeddings = get_embeddings(texts)

    ids = []

    metadatas = []

    for chunk in chunks:

        ids.append(str(uuid.uuid4()))

        metadatas.append(
            {
                "document": filename,
                "page": chunk["page"]
            }
        )

    collection.add(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
        metadatas=metadatas
    )

    return {
        "pages": len(pages),
        "chunks": len(chunks)
    }