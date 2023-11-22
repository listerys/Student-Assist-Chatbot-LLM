from typing import Any
from PyPDF2 import PdfReader

from langchain.text_splitter import CharacterTextSplitter, RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS, VectorStore


def read_document(document_path: str) -> list[Any]:
    # creating a pdf reader object
    # TODO: replace this with document_path
    pdf_file = "./resources/101Algo.pdf"  # replace this with document_path
    reader = PdfReader(pdf_file)

    no_of_pages = len(reader.pages)

    pdf_text = []
    # TODO: replace this with range(no_of_pages)
    for idx in range(10):  # range(no_of_pages):
        page = reader.pages[idx]
        # extracting text from page
        text = page.extract_text()

        if text != "":
            pdf_text.append(text)

    full_text = "\n\n".join(pdf_text)
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    pages = text_splitter.split_text(full_text)

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = text_splitter.create_documents(pages)

    return docs


def faiss_retriever(document_path: str) -> VectorStore:
    """Retriever for the RAG chain."""

    # documents to search
    docs = read_document(document_path)
    # creates embeddings of size 384
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    # initialize FAISS.
    docsearch = FAISS.from_documents(docs, embeddings)

    # create a retriever.
    retriever = docsearch.as_retriever()

    return retriever
