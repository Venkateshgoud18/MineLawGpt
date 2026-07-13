from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)


def chunk_document(pages):

    chunks = []

    for page in pages:

        texts = splitter.split_text(page["text"])

        for text in texts:

            chunks.append(
                {
                    "text": text,
                    "page": page["page"]
                }
            )

    return chunks