import sys
import time
import logging
from pathlib import Path
from collections import defaultdict
from logging.handlers import RotatingFileHandler

# Add backend parent directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.routes import session, analyze, chat, health

# 1. Setup Structured Logging
log_format = logging.Formatter(
    "[%(asctime)s] %(levelname)s [%(name)s:%(filename)s:%(lineno)d] - %(message)s"
)

# Root logger
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)

# Clear existing default handlers
if root_logger.handlers:
    root_logger.handlers.clear()

# Console Handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(log_format)
console_handler.setLevel(logging.INFO)
root_logger.addHandler(console_handler)

# General File Logger
general_log_path = settings.LOGS_DIR / "backend.log"
file_handler = RotatingFileHandler(
    general_log_path, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
)
file_handler.setFormatter(log_format)
file_handler.setLevel(logging.INFO)
root_logger.addHandler(file_handler)

# Error File Logger
error_log_path = settings.LOGS_DIR / "errors.log"
error_file_handler = RotatingFileHandler(
    error_log_path, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
)
error_file_handler.setFormatter(log_format)
error_file_handler.setLevel(logging.WARNING)
root_logger.addHandler(error_file_handler)

logger = logging.getLogger("careerlens_ai")
logger.info("Initializing CareerLens AI Production Service...")

# Startup Environment Verification
def validate_startup_environment():
    logger.info("Executing Production Startup Audit...")

    if not settings.LLM_PROVIDER:
        raise ValueError("CRITICAL STARTUP FAILURE: LLM_PROVIDER is missing.")

    active_key = getattr(settings, "ACTIVE_API_KEY", "")
    if not active_key:
        raise ValueError(f"CRITICAL STARTUP FAILURE: API key for provider '{settings.LLM_PROVIDER}' is missing.")

    from backend.services.llm_factory import get_llm_service
    try:
        llm_service = get_llm_service()
        health_res = llm_service.health_check()
        if health_res.get("status") not in ["connected", "ready"]:
            logger.warning(f"LLM Provider health notice: {health_res.get('details')}")
    except Exception as e:
        raise ValueError(f"CRITICAL STARTUP FAILURE: Could not initialize LLM service '{settings.LLM_PROVIDER}': {e}")

    for directory in [settings.VECTOR_STORE_DIR, settings.UPLOADS_DIR]:
        directory.mkdir(parents=True, exist_ok=True)

    masked_key = f"{active_key[:4]}....{active_key[-4:]}" if len(active_key) > 8 else "****"
    logger.info("=" * 60)
    logger.info("STARTUP VERIFICATION SUCCESSFUL:")
    logger.info(f"  LLM Provider : {settings.LLM_PROVIDER.capitalize()}")
    logger.info(f"  Model        : {settings.ACTIVE_MODEL}")
    logger.info(f"  Prompt Ver   : {settings.PROMPT_VERSION}")
    logger.info(f"  Masked Key   : {masked_key}")
    logger.info(f"  CORS Origins : {settings.CORS_ORIGINS}")
    logger.info("=" * 60)

validate_startup_environment()

# 2. Initialize FastAPI Application
app = FastAPI(
    title="CareerLens AI API",
    description="Production API for AI-Powered ATS Resume Analysis and RAG Career Intelligence",
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# 3. Security & CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# In-Memory Rate Limiting (Simple sliding window per IP: 60 requests / minute)
rate_limit_records = defaultdict(list)
RATE_LIMIT_WINDOW = 60.0  # seconds
MAX_REQUESTS_PER_WINDOW = 60

@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    # Security Headers
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Rate Limiting check for API calls
    if request.url.path.startswith("/api/"):
        timestamps = rate_limit_records[client_ip]
        # Keep timestamps within window
        rate_limit_records[client_ip] = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
        if len(rate_limit_records[client_ip]) >= MAX_REQUESTS_PER_WINDOW:
            logger.warning(f"Rate limit exceeded for IP: {client_ip} on {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests. Please wait a minute before trying again."}
            )
        rate_limit_records[client_ip].append(now)

    # Process Request & Calculate Latency
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    # Add Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    logger.info(f"{request.method} {request.url.path} - Status: {response.status_code} - Latency: {duration:.4f}s")
    return response

# 4. Global Exception Handlers (Sanitized for Production)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Please try again later."}
    )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    logger.warning(f"Validation Error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)}
    )

# 5. Register Routers
app.include_router(health.router)
app.include_router(session.router)
app.include_router(analyze.router)
app.include_router(chat.router)

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting uvicorn server at http://{settings.HOST}:{settings.PORT}")
    
    uvicorn.run(
        "backend.main:app" if Path("backend").exists() else "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
