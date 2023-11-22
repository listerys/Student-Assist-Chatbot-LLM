import logging
import inspect
from typing import Any

from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQAWithSourcesChain
from langchain.chains.question_answering import load_qa_chain

from .memory import CustomMemory
from .retrievers import faiss_retriever


# ToDo: Open API key delete
openai_api_key = ""
log = logging.getLogger(__name__)


def create_prompt() -> PromptTemplate:
    """Creates a prompt for the retrieval chain."""
    prompt_instructions = """
    Respond to the question as accurately as possible using only the context provided.
    
    Context:
    {context}
    
    Question: {input}
    
    Conversation:
    {chat_history}
    """

    template = inspect.cleandoc(prompt_instructions)
    input_variables = ["input", "context", "chat_history"]

    prompt = PromptTemplate(
        template=template,
        input_variables=input_variables
    )
    return prompt


def search(question: str, document_path: str) -> dict[str, Any]:
    # Memory which saves/provides context of the conversation to the prompt
    log.info("Creating memory object.")
    memory = CustomMemory(memory_key="chat_history")

    # LLM to call.
    log.info("Creating an LLM to call.")
    llm = ChatOpenAI(
        openai_api_key=openai_api_key,
        temperature=0,
        model="gpt-4"
    )

    # Prompt that will be used to call the LLM
    log.info("Creating prompt to pass to chain.")
    prompt = create_prompt()

    # Combines retrieved documents
    log.info("Creating chain that combines retrieved documents.")
    combine_docs_chain = load_qa_chain(
        llm=llm,
        chain_type="stuff",
        document_variable_name="context",
        verbose=True,
        prompt=prompt,
    )

    # retriever that retrieves relevant text from the content.
    log.info("Invoking FAISS, to create a vector store based on the document path.")
    retriever = faiss_retriever(document_path)

    # Creating RAG chain
    log.info("Creating Search chain.")
    rag = RetrievalQAWithSourcesChain(
        memory=memory,
        combine_documents_chain=combine_docs_chain,
        retriever=retriever,
        question_key="input",
        answer_key="output",
        sources_answer_key="sources",
        max_tokens_limit=3375,
        reduce_k_below_max_tokens=True,
        return_source_documents=True,
    )

    # returns a dictionary with following keys.
    # ['input', 'chat_history', 'output', 'sources', 'source_documents']
    log.info("Executing the search.")
    response_dict = rag.invoke({"input": question})
    log.info("Search executing successful.")

    return response_dict
