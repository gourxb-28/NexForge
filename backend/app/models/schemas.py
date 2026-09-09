from pydantic import BaseModel
from typing import List, Optional

class Message(BaseModel):
    id: int
    role: str
    content: str

class ContextRequest(BaseModel):
    conversationTitle: str
    messages: List[Message]
    compressionMode: str

class ContextResponse(BaseModel):
    overview: List[str]
    requirements: List[str]
    techStack: List[str]
    architecture: List[str]
    decisions: List[str]
    constraints: List[str]
    completedWork: List[str]
    errors: List[str]
    pendingTasks: List[str]
    nextStep: str
