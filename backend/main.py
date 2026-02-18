from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from llm_handler import generate_response, handle_feedback

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ChatInput(BaseModel):
    message: str

class FeedbackInput(BaseModel):
    feedback: str

@app.post("/chat")
def chat(input: ChatInput):
    return {"response": generate_response(input.message)}

@app.post("/feedback")
def feedback(input: FeedbackInput):
    return {"response": handle_feedback(input.feedback)}
