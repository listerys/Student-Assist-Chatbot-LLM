from typing import Any
from PyPDF2 import PdfReader
import os
from os import listdir
from os.path import isfile, join

from langchain.text_splitter import CharacterTextSplitter, RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS, VectorStore


def get_filenames_and_types(
        mypath: str,
        allowed_file_types: tuple = ("pdf", "txt")
) -> list[tuple]:
    """Lists all usable files in mypath"""
    allfiles = [f for f in listdir(mypath) if isfile(join(mypath, f))]

    usable_files = []
    usable_files_type = []
    for file in allfiles:
        ftype = file.split(".")[-1]
        if ftype in allowed_file_types:
            usable_files.append(os.path.join(mypath, file))
            usable_files_type.append(ftype)

    if len(usable_files) == 0:
        raise ValueError(f"There are no pdf or txt files in the following folder: {mypath}")

    return list(zip(usable_files_type, usable_files))


def read_pdf(filepath: str) -> str:
    """Reads a pdf file and converts its text to string."""
    reader = PdfReader(filepath)
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
    return full_text


def read_txt(filepath: str) -> str:
    """Reads a text file and converts its text to string."""
    print("🐶⚽️🏉🎱🐶⚽️🏉🎱")
    with open(filepath, "r") as f:
        file_text = f.read()
    return file_text


def read_documents(document_path: str) -> list[Any]:
    """Reads files in document_path and converts it to langchain's document type."""
    usable_files_details = get_filenames_and_types(document_path)

    full_text_list = []
    for info in usable_files_details:
        ftype, filepath = info
        if ftype == "pdf":
            file_text = read_pdf(filepath)
        elif ftype == "txt":
            file_text = read_txt(filepath)
        else:
            raise ValueError(f"Got unexpected file type: {ftype}")
        full_text_list.append(file_text)

    if len(full_text_list) == 0:
        raise ValueError(f"No usable text was extracted from the following files: {usable_files_details}")

    full_text = "\n\n".join(full_text_list)
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    pages = text_splitter.split_text(full_text)

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = text_splitter.create_documents(pages)

    return docs


def faiss_retriever(document_path: str) -> VectorStore:
    """Retriever for the RAG chain."""

    # documents to search
    docs = read_documents(document_path)
    # creates embeddings of size 384
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    # initialize FAISS.
    docsearch = FAISS.from_documents(docs, embeddings)

    # create a retriever.
    retriever = docsearch.as_retriever()

    return retriever
