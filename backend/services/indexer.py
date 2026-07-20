from services.pdf_loader import extract_pdf
from services.txt_loader import extract_txt
from services.chunker import chunk_document
from services.embeddings import get_embeddings
from services.vector_store import collection

import uuid


def index_document(file_path, filename):

    if filename.lower().endswith('.pdf'):
        pages = extract_pdf(file_path)
    elif filename.lower().endswith('.txt'):
        pages = extract_txt(file_path)
    else:
        raise ValueError("Unsupported file format. Please upload a PDF or TXT file.")

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