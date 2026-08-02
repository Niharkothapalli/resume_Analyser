import json
import logging
from fastapi import APIRouter, HTTPException, status
from backend.config import settings
from backend.schemas.requests import AnalyzeRequest
from backend.schemas.responses import AnalyzeResponse, AnalysisReport
from backend.services.analysis_service import AnalysisService
from backend.routes.session import validate_session_id

logger = logging.getLogger("careerlens_ai")
router = APIRouter(prefix="/api", tags=["Analysis"])
analysis_service = AnalysisService()

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_resume(request: AnalyzeRequest):
    """
    Triggers complete RAG analysis workflow for target_role.
    Calculates detailed ATS score, flags skill gaps, recommends projects/certs,
    and queries LLM using structured versioned prompts.
    """
    session_id = validate_session_id(request.session_id)
    target_role = request.target_role.strip()
    
    if not target_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target role parameter cannot be empty."
        )

    logger.info(f"Received analysis request: session={session_id}, role='{target_role}'")
    
    session_dir = settings.UPLOADS_DIR / session_id
    if not session_dir.exists():
        logger.warning(f"Analysis requested for non-existent session ID: {session_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found. Please upload your resume PDF first."
        )
        
    analysis_cache_path = session_dir / "analysis.json"
    
    # Check cached analysis report matching exact role
    if analysis_cache_path.exists():
        try:
            with open(analysis_cache_path, "r", encoding="utf-8") as f:
                cached_report = json.load(f)
                
            role_snapshot_path = session_dir / "role_snapshot.json"
            role_matches = False
            if role_snapshot_path.exists():
                with open(role_snapshot_path, "r", encoding="utf-8") as f:
                    snapshot_data = json.load(f)
                    if snapshot_data.get("role", "").lower() == target_role.lower():
                        role_matches = True
            
            if role_matches:
                logger.info(f"Reusing cached analysis report for session {session_id}")
                return AnalyzeResponse(session_id=session_id, analysis=AnalysisReport(**cached_report))
        except Exception as e:
            logger.warning(f"Error loading cached analysis (will recompute): {e}")

    try:
        report_data = analysis_service.run_analysis(session_id, target_role)
        return AnalyzeResponse(
            session_id=session_id,
            analysis=AnalysisReport(**report_data)
        )
    except FileNotFoundError as fnf:
        logger.error(f"Resource missing in analysis service: {fnf}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(fnf))
    except ValueError as val_err:
        logger.error(f"Validation error in analysis service: {val_err}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as e:
        logger.error(f"Error executing resume analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating the resume evaluation."
        )

@router.get("/report/{session_id}", response_model=AnalyzeResponse)
def get_cached_report(session_id: str):
    """
    Retrieves the pre-existing cached analysis report for session_id.
    """
    session_id = validate_session_id(session_id)
    logger.info(f"Retrieving cached report for session {session_id}")
    
    session_dir = settings.UPLOADS_DIR / session_id
    analysis_cache_path = session_dir / "analysis.json"
    
    if not session_dir.exists() or not analysis_cache_path.exists():
        logger.warning(f"Cached report not found for session: {session_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No completed analysis report found for this session."
        )
        
    try:
        with open(analysis_cache_path, "r", encoding="utf-8") as f:
            report_data = json.load(f)
        return AnalyzeResponse(
            session_id=session_id,
            analysis=AnalysisReport(**report_data)
        )
    except Exception as e:
        logger.error(f"Error loading cached report file for session {session_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to read the cached report file."
        )
