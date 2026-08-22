from pydantic import BaseModel, Field

from typing import Optional

class AnalyzeRequest(BaseModel):
    session_id: str = Field(..., description="Unique UUID for the user session")
    target_role: str = Field(..., description="Target job title to analyze the resume against")
    application_level: Optional[str] = Field("fresher", description="Candidate target level: fresher, junior, mid_level, senior")


class ChatRequest(BaseModel):
    session_id: str = Field(..., description="Unique UUID for the user session")
    message: str = Field(..., description="User's query/message to the resume assistant")
