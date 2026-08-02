import re
import uuid
import shutil
import json
import logging
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from backend.config import settings, rag_config
from backend.services.pdf_parser import extract_pdf_text_and_pages, parse_resume_structure
from backend.rag.vector_store import build_and_save_index

logger = logging.getLogger("careerlens_ai")
router = APIRouter(prefix="/api", tags=["Session"])

# Regex for UUID validation to prevent path traversal via session_id parameter
UUID_REGEX = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")

def validate_session_id(session_id: str) -> str:
    """Ensure session_id is a valid UUID string to prevent path traversal."""
    if not session_id or not UUID_REGEX.match(session_id):
        logger.warning(f"Rejected invalid session_id format: {session_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid session ID format."
        )
    return session_id

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(file: UploadFile = File(...)):
    """
    Accepts PDF resume, validates file header/magic bytes, extracts text,
    indexes vector embeddings in FAISS, and returns a secure session_id.
    """
    logger.info(f"Received file upload request: {file.filename}")
    
    # 1. Extension & Content-Type Validation
    filename = Path(file.filename).name  # Strips directory components
    extension = "." + filename.split(".")[-1].lower() if "." in filename else ""
    
    if extension not in settings.ALLOWED_FILE_EXTENSIONS:
        logger.warning(f"Rejected file extension '{extension}' for file: {filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Only PDF files (.pdf) are accepted."
        )

    if file.content_type and file.content_type.lower() not in settings.ALLOWED_MIME_TYPES:
        logger.warning(f"Rejected MIME type '{file.content_type}' for file: {filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid content type. Only PDF documents (application/pdf) are allowed."
        )

    # 2. Magic Bytes / Header Validation (Verify real PDF signature %PDF-)
    content_header = await file.read(5)
    await file.seek(0)  # Reset stream position after header check
    
    if not content_header.startswith(b"%PDF-"):
        logger.warning(f"File magic bytes check failed for file: {filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content does not appear to be a valid PDF document."
        )

    # 3. Setup Session Isolation
    session_id = str(uuid.uuid4())
    session_dir = settings.UPLOADS_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    pdf_path = session_dir / "resume.pdf"
    parsed_json_path = session_dir / "parsed_resume.json"
    
    try:
        # Write binary file with size boundary check
        bytes_written = 0
        with open(pdf_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # Read in 1MB chunks
                bytes_written += len(chunk)
                if bytes_written > settings.MAX_UPLOAD_SIZE_BYTES:
                    logger.warning(f"File size limit exceeded ({bytes_written} bytes) for: {filename}")
                    buffer.close()
                    shutil.rmtree(session_dir)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File too large. Maximum supported size is {settings.MAX_UPLOAD_SIZE_BYTES / (1024*1024):.0f}MB."
                    )
                buffer.write(chunk)

        # 4. Text Extraction & Structural Parsing
        logger.info(f"Extracting text from PDF for session {session_id}...")
        raw_text, page_count = extract_pdf_text_and_pages(pdf_path)
        
        if not raw_text or not raw_text.strip():
            logger.warning(f"Extracted PDF text is empty for file: {filename}")
            shutil.rmtree(session_dir)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="The uploaded PDF contains no readable text. Please ensure it is not scanned or image-only."
            )

        logger.info(f"Parsing resume structure and metadata...")
        parsed_data = parse_resume_structure(raw_text, page_count)
        
        # Save raw_text in parsed JSON for internal services
        parsed_data["raw_text"] = raw_text
        with open(parsed_json_path, "w", encoding="utf-8") as f:
            json.dump(parsed_data, f, indent=2)
            
        # Clean response payload representation
        response_parsed = parsed_data.copy()
        response_parsed.pop("raw_text", None)
        
        # 5. Build FAISS Vector Index
        logger.info(f"Compiling FAISS vector index for session {session_id}...")
        build_and_save_index(session_id, raw_text)
        
        logger.info(f"Successfully initialized session {session_id} for file {filename}")
        return {
            "session_id": session_id,
            "filename": filename,
            "parsed_data": response_parsed
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to process file upload for {filename}: {e}", exc_info=True)
        if session_dir.exists():
            shutil.rmtree(session_dir)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing the resume PDF."
        )

@router.delete("/session/{session_id}")
def delete_session(session_id: str):
    """
    Safely removes uploads and FAISS index files for session_id.
    """
    validate_session_id(session_id)
    logger.info(f"Received request to purge session {session_id}")
    
    session_dir = settings.UPLOADS_DIR / session_id
    vector_dir = settings.VECTOR_STORE_DIR / session_id
    
    deleted_anything = False
    
    if session_dir.exists():
        try:
            shutil.rmtree(session_dir)
            deleted_anything = True
            logger.info(f"Removed upload files for session {session_id}")
        except Exception as e:
            logger.error(f"Failed to delete session upload directory {session_dir}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to clean up uploaded session files."
            )
            
    if vector_dir.exists():
        try:
            shutil.rmtree(vector_dir)
            deleted_anything = True
            logger.info(f"Removed FAISS index directory for session {session_id}")
        except Exception as e:
            logger.error(f"Failed to delete vector directory {vector_dir}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to clean up FAISS index files."
            )
            
    if not deleted_anything:
        logger.warning(f"Delete request received for non-existent session: {session_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session ID not found or already purged."
        )
        
    return {"status": "success", "message": f"Session files and vector indices for {session_id} have been deleted."}
