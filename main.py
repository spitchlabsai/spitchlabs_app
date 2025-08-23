# main.py
import os
import tempfile
import uuid
import subprocess
import signal
from typing import List, Optional, Dict, Any
from pathlib import Path
import asyncio

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from docprocessor import DocumentProcessor
from vector_search import VectorSearchService
from spitchagent import EnhancedAgentService
from spitchagent import create_entrypoint

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="Agentic Document AI System", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

active_agent_processes: Dict[str, subprocess.Popen] = {}

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc'}

if not all([SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("Please set SUPABASE_URL and SUPABASE_KEY environment variables")

# Create uploads directory
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize services
document_processor = DocumentProcessor(SUPABASE_URL, SUPABASE_KEY)
vector_service = VectorSearchService(SUPABASE_URL, SUPABASE_KEY)
agent_service = EnhancedAgentService(SUPABASE_URL, SUPABASE_KEY)

# Pydantic models
class DocumentResponse(BaseModel):
    document_id: str
    filename: str
    status: str
    chunks_processed: Optional[int] = None
    message: Optional[str] = None

class SearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 5
    threshold: Optional[float] = 0.7

class SearchResult(BaseModel):
    chunk_text: str
    filename: str
    similarity_score: float
    document_id: str

class KnowledgeBaseSummary(BaseModel):
    total_documents: int
    total_chunks: int
    documents: List[Dict[str, Any]]

class AgentSessionRequest(BaseModel):
    user_id: str
    room_name: str

class AgentResponse(BaseModel):
    status: str
    message: str
    session_id: Optional[str] = None

# Helper functions
def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()

def is_allowed_file(filename: str) -> bool:
    return get_file_extension(filename) in ALLOWED_EXTENSIONS

async def save_upload_file(upload_file: UploadFile) -> str:
    """Save uploaded file and return the file path"""
    file_extension = get_file_extension(upload_file.filename)
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        content = await upload_file.read()
        buffer.write(content)
    
    return file_path

# API Routes

@app.get("/")
async def root():
    return {"message": "Agentic Sales AI System API", "version": "1.0.0"}

@app.post("/upload-document/{user_id}", response_model=DocumentResponse)
async def upload_document(
    user_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Upload and process a document for a user"""
    
    # Validate file type
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Supported types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    try:
        # Save uploaded file
        file_path = await save_upload_file(file)
        
        # Process document in background
        async def process_document_task():
            try:
                file_type = get_file_extension(file.filename).replace('.', '')
                result = await document_processor.process_document(
                    file_path, user_id, file.filename, file_type
                )
                # Clean up uploaded file after processing
                os.remove(file_path)
                return result
            except Exception as e:
                # Clean up file on error
                if os.path.exists(file_path):
                    os.remove(file_path)
                print(f"Background processing error: {str(e)}")
        
        # Start background processing
        background_tasks.add_task(process_document_task)
        
        return DocumentResponse(
            document_id="processing",
            filename=file.filename,
            status="processing",
            message="Document upload successful. Processing in background."
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search/{user_id}")
async def search_documents(user_id: str, search_query: SearchQuery) -> List[SearchResult]:
    """Search through user's documents using vector similarity"""
    try:
        results = await vector_service.search_similar_chunks(
            search_query.query,
            user_id,
            search_query.limit,
            search_query.threshold
        )
        
        search_results = []
        for result in results:
            search_results.append(SearchResult(
                chunk_text=result.get('chunk_text', ''),
                filename=result.get('filename', ''),
                similarity_score=result.get('similarity_score', 0.0),
                document_id=result.get('document_id', '')
            ))
        
        return search_results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/knowledge-base/{user_id}", response_model=KnowledgeBaseSummary)
async def get_knowledge_base_summary(user_id: str):
    """Get summary of user's knowledge base"""
    try:
        summary = await vector_service.get_user_knowledge_summary(user_id)
        return KnowledgeBaseSummary(**summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{user_id}")
async def get_user_documents(user_id: str):
    """Get all documents for a user"""
    try:
        documents = await vector_service.get_user_documents(user_id)
        return {"documents": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{user_id}/{document_id}")
async def delete_document(user_id: str, document_id: str):
    """Delete a document and all its chunks"""
    try:
        success = await vector_service.delete_document(document_id, user_id)
        if success:
            return {"message": "Document deleted successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to delete document")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agent/start", response_model=AgentResponse)
async def start_agent_session(session_request: AgentSessionRequest):
    """Start a new LiveKit agent process for a user"""
    try:
        user_id = session_request.user_id
        session_id = f"agent_{user_id}_{uuid.uuid4().hex[:8]}"
        
        # Check if user already has an active agent
        if user_id in active_agent_processes:
            return AgentResponse(
                status="already_running",
                message=f"Agent already running for user {user_id}",
                session_id=f"agent_{user_id}_existing"
            )
        
        # Create environment for the agent subprocess
        agent_env = os.environ.copy()
        agent_env.update({
            'USER_ID': user_id,
            'SUPABASE_URL': SUPABASE_URL,
            'SUPABASE_KEY': SUPABASE_KEY,
        })
        
        # Start the agent as a subprocess
        cmd = ['python', 'enhanced_livekit_agent.py']
        process = subprocess.Popen(
            cmd,
            env=agent_env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            preexec_fn=os.setsid if os.name != 'nt' else None
        )
        
        # Store the process
        active_agent_processes[user_id] = process
        
        # Get knowledge base info
        kb_summary = await vector_service.get_user_knowledge_summary(user_id)
        
        return AgentResponse(
            status="started",
            message=f"LiveKit agent started for user {user_id}. KB: {kb_summary['total_documents']} docs, {kb_summary['total_chunks']} chunks.",
            session_id=session_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start agent: {str(e)}")

@app.post("/agent/stop/{user_id}")
async def stop_agent_session(user_id: str):
    """Stop the LiveKit agent process for a user"""
    try:
        if user_id not in active_agent_processes:
            return {"status": "not_found", "message": f"No active agent for user {user_id}"}
        
        process = active_agent_processes[user_id]
        
        # Terminate the process group (to kill any child processes too)
        if os.name != 'nt':  # Unix/Linux/Mac
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
        else:  # Windows
            process.terminate()
        
        # Wait for process to end
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            if os.name != 'nt':
                os.killpg(os.getpgid(process.pid), signal.SIGKILL)
            else:
                process.kill()
        
        # Remove from active processes
        del active_agent_processes[user_id]
        
        return {"status": "stopped", "message": f"Agent stopped for user {user_id}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop agent: {str(e)}")

@app.get("/agent/sessions")
async def get_active_sessions():
    """Get information about active agent sessions"""
    active_sessions = []
    for user_id, process in list(active_agent_processes.items()):
        if process.poll() is None:  # Process is still running
            active_sessions.append({
                "user_id": user_id,
                "pid": process.pid,
                "status": "running"
            })
        else:  # Process has ended
            del active_agent_processes[user_id]
            
    return {
        "active_sessions": active_sessions,
        "total_active": len(active_sessions)
    }

# Cleanup on app shutdown
@app.on_event("shutdown")
async def cleanup_agents():
    """Clean up all agent processes on app shutdown"""
    for user_id, process in active_agent_processes.items():
        try:
            if process.poll() is None:  # Still running
                if os.name != 'nt':
                    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                else:
                    process.terminate()
        except:
            pass  # Process might already be dead
    active_agent_processes.clear()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "agentic-document-ai"}

# Context endpoint for testing agent responses
@app.post("/context/{user_id}")
async def get_context_for_query(user_id: str, search_query: SearchQuery):
    """Get relevant context for a query (useful for testing)"""
    try:
        context = await vector_service.get_relevant_context(
            search_query.query,
            user_id,
            search_query.limit
        )
        return {"query": search_query.query, "context": context}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )