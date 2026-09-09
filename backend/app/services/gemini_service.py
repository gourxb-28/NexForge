import os
import json
import google.generativeai as genai
from app.models.schemas import ContextRequest, ContextResponse

def configure_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=api_key)

def generate_context(request: ContextRequest) -> ContextResponse:
    history = ""
    for msg in request.messages:
        role = "User" if msg.role == "user" else "Assistant"
        history += f"{role}: {msg.content}\n\n"

    prompt = f"""
    You are an expert software engineer analyzing an AI chat conversation.
    Your goal is to extract structured context to help another AI continue this work.
    
    Conversation Title: {request.conversationTitle}
    Compression Mode: {request.compressionMode}

    Analyze the following conversation and return a strict JSON object matching this schema exactly.
    Do NOT include markdown block ticks like ```json.
    {{
      "overview": ["string"],
      "requirements": ["string"],
      "techStack": ["string"],
      "architecture": ["string"],
      "decisions": ["string"],
      "constraints": ["string"],
      "completedWork": ["string"],
      "errors": ["string"],
      "pendingTasks": ["string"],
      "nextStep": "string"
    }}

    If a section has no relevant information, return an empty array or empty string.
    
    Conversation History:
    {history[-20000:]} 
    """

    model = genai.GenerativeModel('gemini-3.5-flash-lite')
    
    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.2,
            response_mime_type="application/json"
        )
    )

    try:
        data = json.loads(response.text)
        validated_data = ContextResponse(**data)
        return validated_data
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        print(f"Raw response: {response.text}")
        raise ValueError("Failed to generate valid structured context from Gemini.")
