from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import google.generativeai as genai
from langchain_community.vectorstores import PGVector
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader, PyPDFLoader, Docx2txtLoader
import os

from ..utils.database import get_db
from ..utils.security import get_current_user
from ..models.user import User
from ..models.chat import Chat, ChatMessage
from ..models.file_system import File as DBFile
from ..config import settings

router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)

# Initialize Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-pro')
# Initialize embeddings
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    task_type="retrieval_document",
    title="Document Embeddings",
    google_api_key=settings.GEMINI_API_KEY
)

class NewChatResponse(BaseModel):
    id: str

class MessageRequest(BaseModel):
    message: str
    collection_name: Optional[str] = settings.VECTOR_STORE_COLLECTION

class MessageResponse(BaseModel):
    answer: str
    citations: List[dict]

class ChatHistory(BaseModel):
    id: str
    messages: List[dict]
    created_at: datetime
    updated_at: datetime

class UpdateChatTitleRequest(BaseModel):
    title: str

class ChatListResponse(BaseModel):
    id: str
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    message_count: int

def get_relevant_documents(query: str, user_id: int, db: Session, k: int = 3):
    """Retrieve relevant documents using PGVector store"""
    try:
        vectorstore = PGVector(
            connection_string=settings.DATABASE_URL,
            embedding_function=embeddings,
            collection_name=settings.VECTOR_STORE_COLLECTION,
            distance_strategy=settings.VECTOR_DISTANCE_STRATEGY
        )
        
        relevant_docs = vectorstore.similarity_search(
            query,
            k=k
        )
        return relevant_docs
    except Exception as e:
        print(f"Error retrieving documents from PG Vector: {str(e)}")
        return []

def generate_chat_title(message: str, max_length: int = 50) -> str:
    """Generate a chat title from the message, similar to GPT style."""
    raw_title = message.strip()
    return (raw_title[:47] + '...') if len(raw_title) > max_length else raw_title

@router.post("/new", response_model=NewChatResponse)
async def create_new_chat(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new chat session"""
    chat = Chat(user_id=current_user.id)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    
    return {"id": str(chat.id)}

@router.post("/{chat_id}/message", response_model=MessageResponse)
async def send_message(
    chat_id: str,
    message_data: MessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        chat_id_int = int(chat_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid chat id")

    chat = db.query(Chat).filter(
        Chat.id == chat_id_int,
        Chat.user_id == current_user.id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="No data found")

    # Set chat title from the first message if not already set
    if not chat.title:
        chat.title = generate_chat_title(message_data.message)
        db.commit()

    # Normal logic if chat is found
    relevant_docs = get_relevant_documents(
        message_data.message,
        current_user.id,
        db
    )
    context = "\n\n".join([doc.page_content for doc in relevant_docs])
    prompt = f"""Based on the following context from the documents, please answer the question. 
    If the answer cannot be found in the context, say so.

    Context:
    {context}

    Question: {message_data.message}

    Please provide your answer and cite the sources used."""
    response = model.generate_content(prompt)
    answer = response.text
    citations = []
    for doc in relevant_docs:
        filename = doc.metadata.get("filename", "")
        file_type = os.path.splitext(filename)[1].lower() if filename else ""
        citations.append({
            "filename": filename,
            "source": doc.metadata.get("source"),
            "content": doc.page_content,
            "file_type": file_type,
            "page": doc.metadata.get("page", None)
        })
    chat_message = ChatMessage(
        chat_id=chat.id,
        query=message_data.message,
        answer=answer,
        citations=citations
    )
    db.add(chat_message)
    db.commit()
    return {
        "answer": answer,
        "citations": citations
    }

@router.get("/history", response_model=List[ChatHistory])
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get chat history for the current user"""
    chats = db.query(Chat).filter(
        Chat.user_id == current_user.id
    ).order_by(Chat.updated_at.desc()).all()
    
    chat_history = []
    for chat in chats:
        messages = db.query(ChatMessage).filter(
            ChatMessage.chat_id == chat.id
        ).order_by(ChatMessage.created_at.asc()).all()
        
        chat_history.append({
            "id": str(chat.id),
            "messages": [
                {
                    "query": msg.query,
                    "answer": msg.answer,
                    "citations": msg.citations,
                    "created_at": msg.created_at
                }
                for msg in messages
            ],
            "created_at": chat.created_at,
            "updated_at": chat.updated_at
        })
    
    return chat_history

@router.get("/history/{chat_id}", response_model=ChatHistory)
async def get_specific_chat_history(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get history for a specific chat session"""
    # Get chat session
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Get messages for this chat
    messages = db.query(ChatMessage).filter(
        ChatMessage.chat_id == chat.id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    return {
        "id": str(chat.id),
        "messages": [
            {
                "query": msg.query,
                "answer": msg.answer,
                "citations": msg.citations,
                "created_at": msg.created_at
            }
            for msg in messages
        ],
        "created_at": chat.created_at,
        "updated_at": chat.updated_at
    }

@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific chat session"""
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Delete all messages in the chat
    db.query(ChatMessage).filter(ChatMessage.chat_id == chat_id).delete()
    
    # Delete the chat
    db.delete(chat)
    db.commit()
    
    return {"message": "Chat deleted successfully"}

@router.patch("/{chat_id}/title")
async def update_chat_title(
    chat_id: str,
    data: UpdateChatTitleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        chat_id_int = int(chat_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid chat id")
    chat = db.query(Chat).filter(
        Chat.id == chat_id_int,
        Chat.user_id == current_user.id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="No data found")
    chat.title = data.title.strip()
    db.commit()
    return {"message": "Title updated successfully", "title": chat.title}

@router.get("/all", response_model=List[ChatListResponse])
async def get_all_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all chats for the current user with basic information"""
    chats = db.query(Chat).filter(
        Chat.user_id == current_user.id
    ).order_by(Chat.updated_at.desc()).all()
    
    chat_list = []
    for chat in chats:
        # Get message count for each chat
        message_count = db.query(ChatMessage).filter(
            ChatMessage.chat_id == chat.id
        ).count()
        
        chat_list.append({
            "id": str(chat.id),
            "title": chat.title,
            "created_at": chat.created_at,
            "updated_at": chat.updated_at,
            "message_count": message_count
        })
    
    return chat_list 