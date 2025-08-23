from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from collections import defaultdict
import os
from dotenv import load_dotenv
import google.generativeai as genai
import uvicorn
# from google.generativeai import Tool


GEMINI_API = "AIzaSyCJI0KF7XSbAmkWxzrcO70xVYH5wL_8120"


# --- Configuration ---

load_dotenv()

api_key = GEMINI_API
if not api_key:
    raise ValueError("GEMINI_API_KEY not found. Please set it in your environment or a .env file.")

genai.configure(api_key=api_key)

# --- FastAPI App Initialization ---

app = FastAPI(
    title="PoultryGenius API",
    description="An intelligent assistant for poultry health and management.",
    version="1.0.0"
)

# --- System and Model Configuration ---

# The default system prompt to guide the AI's behavior
DEFAULT_SYSTEM_PROMPT = """You are a veterinary professional assistant specializing in poultry health.
Your goal is to provide helpful, accurate, short and concise, and safe information.
Based on the user's query or a detected disease, you will provide recommended drug prescriptions, dosages,
and administration guidelines in line with veterinary standards.
You are equipped with a search tool to find the most current and relevant information online.
Always include drug alternatives to at most 2, preventive measures, and a clear disclaimer that farmers must consult a licensed veterinarian before taking any action."""

# model = genai.GenerativeModel(
#     model_name='gemini-2.5-flash',
#     system_instruction=DEFAULT_SYSTEM_PROMPT,
#     # tools=tools
# )

model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    system_instruction=DEFAULT_SYSTEM_PROMPT,
    generation_config={
        "temperature": 0.2,  # creativity vs determinism
        "top_k": 90,        # limit to top-k most likely tokens
        "top_p": 0.2,       # nucleus sampling threshold
        
    }
)


conversation_history = defaultdict(lambda: model.start_chat())

# --- API Data Models ---

class ChatInput(BaseModel):
    user_id: str
    message: str

# --- API Endpoints ---

@app.get("/")
async def root():
    """
    Root endpoint with a welcome message and API information.
    """
    return {
        "message": "Welcome to the PoultryGenius Chat API.",
        "endpoints": {
            "/chat/": "POST with {'user_id': 'string', 'message': 'string'} to chat.",
            "/docs": "API documentation."
        },
    }

@app.post("/chat/")
async def chat(input_data: ChatInput):
    """
    Main chat endpoint to interact with the Gemini model.
    """
    user_id = input_data.user_id
    user_msg = input_data.message

    # Get this user's conversation chat session
    chat_session = conversation_history[user_id]

    try:
        response = chat_session.send_message(user_msg)
        
        # The conversation history is automatically managed by the chat_session object.

        return {"message": response.text}

    except Exception as e:
        # Handle potential errors from the API call
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

# --- Main Execution Block ---

if __name__ == "__main__":
    # This allows the script to be run directly for development.
    # Uvicorn will host the app on http://127.0.0.1:8000
    uvicorn.run(
        "poultrygemini:app",  # Assumes the file is named poultrygemini.py
        host="0.0.0.0",
        port=8000,
        reload=True
    )