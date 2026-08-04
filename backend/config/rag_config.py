# Centralized RAG configuration parameters for CareerLens AI

# Embedding Model
# The Sentence Transformers model used for semantic vector extraction
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# Chunking Configuration
CHUNK_SIZE = 600
CHUNK_OVERLAP = 150

# Vector Store Search Parameters
TOP_K = 5
SIMILARITY_THRESHOLD = 0.35  # Cosine distance/similarity threshold
MAX_CONTEXT_SIZE = 8000     # Maximum characters to feed LLM context

# Upload Rules
SUPPORTED_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_EXTENSIONS = {".pdf"}
