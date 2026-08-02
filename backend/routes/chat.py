import logging
from fastapi import APIRouter, HTTPException, status
from backend.config import settings
from backend.schemas.requests import ChatRequest
from backend.schemas.responses import ChatResponse
from backend.services.chat_service import ChatService
from backend.routes.session import validate_session_id

logger = logging.getLogger("careerlens_ai")
router = APIRouter(prefix="/api", tags=["Chat"])
chat_service = ChatService()

@router.post("/chat", response_model=ChatResponse)
def chat_with_resume_assistant(request: ChatRequest):
    """
    Coordinates chat conversations with the Resume Assistant.
    Retrieves local semantic chunks, constructs context prompt, and queries LLM.
    """
    session_id = validate_session_id(request.session_id)
    message = request.message.strip()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat message content cannot be empty."
        )

    logger.info(f"Received chat query for session {session_id}")
    
    session_dir = settings.UPLOADS_DIR / session_id
    if not session_dir.exists():
        logger.warning(f"Chat requested for non-existent session ID: {session_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found. Please upload your resume PDF first."
        )
        
    try:
        reply = chat_service.handle_message(session_id, message)
        return ChatResponse(reply=reply)
    except FileNotFoundError as fnf:
        logger.error(f"Resource missing in chat service: {fnf}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(fnf))
    except Exception as e:
        logger.error(f"Error during chat communication for session {session_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating the assistant response."
        )
