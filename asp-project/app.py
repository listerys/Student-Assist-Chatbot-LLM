import streamlit as st
from flask import Flask, request, jsonify

from PyPDF2 import PdfReader 
from langchain.text_splitter import CharacterTextSplitter  
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chat_models import ChatOpenAI  
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain

app = Flask(__name__)

@app.route('/api/question', methods=['POST'])
def handle_question():

    user_question = request.json['question']
    
    response = conversation_chain({"question": user_question})
    messages = response['chat_history']
    
    return jsonify({
        'messages': [{
            'text': msg.content, 
            'sender': 'bot' if i % 2 == 1 else 'user' 
        } for i, msg in enumerate(messages)] 
    })

if __name__ == '__main__':

    # Extract PDF text
    pdf_docs = [] # List of uploaded PDF files
    pdf_text = ""
    for pdf in pdf_docs:
        pdf_reader = PdfReader(pdf)
        for page in pdf_reader.pages:
            pdf_text += page.extract_text()

    # Text chunks
    text_splitter = CharacterTextSplitter()
    texts = text_splitter.split_text(pdf_text) 
    
    # Create FAISS vectorstore
    embeddings = OpenAIEmbeddings()  
    vectorstore = FAISS.from_texts(texts=texts, embedding=embeddings)
    
    # Create conversation chain 
    llm = ChatOpenAI()
    memory = ConversationBufferMemory()

    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(),
        memory=memory
    )
    
    app.run()