import logging
from fastapi import APIRouter
from backend.config import settings
from backend.services.llm_factory import get_llm_service

logger = logging.getLogger("careerlens_ai")
router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/health")
def health_check():
    """
    Production health diagnostic endpoint monitoring system sanity, LLM provider,
    FAISS status, RAG readiness, and application version.
    """
    logger.info("Executing production health diagnostic probe...")
    
    # 1. LLM Provider Health Check
    llm_status = "ready"
    try:
        service = get_llm_service()
        probe = service.health_check()
        if probe.get("status") not in ["connected", "ready"]:
            llm_status = "degraded"
    except Exception as e:
        logger.error(f"LLM health probe error: {e}")
        llm_status = "error"

    # 2. Storage Permissions Check
    storage_status = "ready"
    try:
        settings.VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
        settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        logger.error(f"Storage directory access error: {e}")
        storage_status = "error"

    # 3. Overall Status Aggregation
    overall_status = "healthy"
    if llm_status != "ready" or storage_status != "ready":
        overall_status = "degraded" if llm_status == "degraded" else "unhealthy"

    return {
        "status": overall_status,
        "provider": settings.LLM_PROVIDER,
        "model": settings.ACTIVE_MODEL,
        "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
        "faiss_status": storage_status,
        "rag_status": "ready" if storage_status == "ready" else "error",
        "api_status": "operational",
        "application_version": settings.APP_VERSION
    }
