import os

from dotenv import load_dotenv

from langchain_text_splitters import (
    RecursiveCharacterTextSplitter
)

from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader
)

from langchain_google_genai import (
    GoogleGenerativeAIEmbeddings
)

from langchain_community.vectorstores import (
    Chroma
)

load_dotenv()

documents = []

data_folder = "data"

for file in os.listdir(data_folder):

    file_path = os.path.join(
        data_folder,
        file
    )

    if file.endswith(".pdf"):

        loader = PyPDFLoader(
            file_path
        )

    elif file.endswith(".md"):

        loader = TextLoader(
            file_path,
            encoding="utf-8"
        )

    else:
        continue

    docs = loader.load()

    for doc in docs:
        doc.metadata["source"] = file

    documents.extend(docs)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)

chunks = splitter.split_documents(
    documents
)

print(
    f"Total Chunks: {len(chunks)}"
)

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001"
)

Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="chroma_db"
)

print("Vector Database Created")