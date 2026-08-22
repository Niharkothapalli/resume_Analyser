import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the backend
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables. override=False ensures production platform variables take precedence
env_file = BASE_DIR / ".env"
if env_file.exists():
    load_dotenv(dotenv_path=env_file, override=False)
else:
    load_dotenv(override=False)

# App configurations
DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
APP_VERSION = "1.0.0"

# CORS Configuration
raw_cors = os.getenv("CORS_ORIGINS", "")
if raw_cors:
    CORS_ORIGINS = [origin.strip() for origin in raw_cors.split(",") if origin.strip()]
else:
    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://career-lens-ai-nk.vercel.app",
        "https://careerlens-ai.vercel.app",
    ]

# LLM Provider Configuration
LLM_PROVIDER = "cohere"

# Cohere API Configuration
raw_cohere_key = os.getenv("COHERE_API_KEY", "")
COHERE_API_KEY = raw_cohere_key.strip().strip("'\"")
COHERE_MODEL = os.getenv("COHERE_MODEL", "command-a-03-2025").strip().strip("'\"")

# Provider Key Validation
if not COHERE_API_KEY:
    raise ValueError(
        "CRITICAL ERROR: COHERE_API_KEY is missing! "
        "Please set COHERE_API_KEY in your environment or backend/.env"
    )
ACTIVE_API_KEY = COHERE_API_KEY
ACTIVE_MODEL = COHERE_MODEL

# Key Source Identification
KEY_SOURCE = "Environment" if not env_file.exists() else f"backend/.env ({env_file})"

# Prompt configuration
PROMPT_VERSION = os.getenv("PROMPT_VERSION", "v1").strip().strip("'\"")

# File Upload & Security Configurations
MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = ["application/pdf"]
ALLOWED_FILE_EXTENSIONS = [".pdf"]

# Directory Paths
UPLOADS_DIR = BASE_DIR / "uploads"
VECTOR_STORE_DIR = BASE_DIR / "vector_store"
KNOWLEDGE_BASE_DIR = BASE_DIR / "knowledge_base"
PROMPTS_DIR = BASE_DIR / "prompts"
LOGS_DIR = BASE_DIR / "logs"

# Ensure runtime directories exist
for directory in [UPLOADS_DIR, VECTOR_STORE_DIR, KNOWLEDGE_BASE_DIR, PROMPTS_DIR, LOGS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)
