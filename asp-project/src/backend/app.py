from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PyPDF2 import PdfReader
import httpx
from io import BytesIO
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
import os

app = FastAPI()

# Global variable to store the conversation chain
conversation_chain = None

openai_api_key = "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"

async def get_pdf_text(file_content):
    text = ""
    try:
        pdf_reader = PdfReader(BytesIO(file_content))
        for page in pdf_reader.pages:
            text += page.extract_text() or ''
    except Exception as e:
        # Handle exceptions related to PDF processing
        print(f"Error processing PDF: {e}")
        text = "Error processing PDF"
    return text

def get_text_chunks(text):
    text_splitter = CharacterTextSplitter(separator="\n", chunk_size=1000, chunk_overlap=200, length_function=len)
    chunks = text_splitter.split_text(text)
    return chunks

def get_vectorstore(text_chunks):
    embeddings = OpenAIEmbeddings(api_key=openai_api_key)
    vectorstore = FAISS.from_texts(texts=text_chunks, embedding=embeddings)
    return vectorstore

def get_conversation_chain(vectorstore):
    llm = ChatOpenAI()
    memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)
    conversation_chain = ConversationalRetrievalChain.from_llm(llm=llm, retriever=vectorstore.as_retriever(), memory=memory)
    return conversation_chain

@app.get('/upload')
async def upload_and_process(fileUrl: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(fileUrl)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Unable to download file from URL")

            file_content = response.content
            # Process the file content here
            # For example, if it's a PDF, extract text from it
            text = await get_pdf_text(file_content)
            # Further processing can be done here as needed

        return {"message": "File processed successfully", "text": text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get('/chat')
async def chat(input: str):
    global conversation_chain
    if not conversation_chain:
        raise HTTPException(status_code=400, detail="No conversation chain found. Please upload and process PDFs first.")

    if not input:
        raise HTTPException(status_code=400, detail="No input provided")

    try:
        response = conversation_chain({'question': input})
        return response
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="debug")
