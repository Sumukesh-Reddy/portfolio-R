from dotenv import load_dotenv

from langchain_community.vectorstores import Chroma

from langchain_google_genai import (
    GoogleGenerativeAIEmbeddings,
    ChatGoogleGenerativeAI
)

from langchain_classic.retrievers.multi_query import (
    MultiQueryRetriever
)

load_dotenv()

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001"
)

vectorstore = Chroma(
    persist_directory="chroma_db",
    embedding_function=embeddings
)

base_retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={
        "k": 10,
        "fetch_k": 40
    }
)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0
)

retriever = MultiQueryRetriever.from_llm(
    retriever=base_retriever,
    llm=llm
)