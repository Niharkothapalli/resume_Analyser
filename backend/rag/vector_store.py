import os
import pickle
import logging
import numpy as np
import faiss
from pathlib import Path
from typing import List, Dict, Any, Tuple
from backend.config import settings, rag_config

logger = logging.getLogger("careerlens_ai")

# Lazy-loaded embedding model to save memory when starting up
_embedding_model = None

def get_embedding_model() -> "SentenceTransformer":
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading local SentenceTransformer model: {rag_config.EMBEDDING_MODEL}")
        # downloads/loads model weights
        _embedding_model = SentenceTransformer(rag_config.EMBEDDING_MODEL)
    return _embedding_model

def chunk_text_by_pages(raw_text: str) -> List[Dict[str, Any]]:
    """
    Split the parsed PDF text into overlapping chunks, maintaining page and section metadata.
    """
    chunks = []
    chunk_id = 0
    
    # Split text by pages
    pages = raw_text.split("--- Page ")
    
    current_section = "Contact Information"
    section_keywords = {
        "Skills": ["skills", "technologies", "technical skills", "skills & expertise", "languages"],
        "Experience": ["experience", "work history", "employment history", "work experience", "employment"],
        "Projects": ["projects", "academic projects", "personal projects", "key projects"],
        "Education": ["education", "academic background", "qualifications", "academics"],
        "Certifications": ["certifications", "licenses", "courses", "awards"]
    }
    
    for page_block in pages:
        if not page_block.strip():
            continue
            
        # Parse page number
        lines = page_block.split("\n")
        header_line = lines[0].strip()
        
        # Check if first line contains page number (e.g. "1 ---" or similar)
        page_num = 1
        if " ---" in header_line:
            try:
                page_num = int(header_line.split(" ---")[0].strip())
                page_content = "\n".join(lines[1:])
            except Exception:
                page_content = page_block
        else:
            page_content = page_block
            
        # Sub-divide page content by character chunk size
        text_len = len(page_content)
        start = 0
        while start < text_len:
            end = min(start + rag_config.CHUNK_SIZE, text_len)
            chunk_txt = page_content[start:end].strip()
            
            if len(chunk_txt) > 30:  # Skip trivial chunks
                # Heuristically detect section changes in current chunk
                chunk_lower = chunk_txt.lower()
                for section, keywords in section_keywords.items():
                    for kw in keywords:
                        if re_match := re_find_heading(kw, chunk_lower):
                            current_section = section
                            break
                            
                chunks.append({
                    "chunk_id": chunk_id,
                    "page": page_num,
                    "section": current_section,
                    "text": chunk_txt
                })
                chunk_id += 1
                
            start += (rag_config.CHUNK_SIZE - rag_config.CHUNK_OVERLAP)
            
    return chunks

def re_find_heading(keyword: str, text: str) -> bool:
    """Helper to find headers in a chunk."""
    import re
    # Check if keyword is listed on its own line or as a bolded/capitalized block
    pattern = r'(?:^|\n)\s*' + re.escape(keyword) + r'\s*(?:\n|:|\b)'
    return bool(re.search(pattern, text))

def build_and_save_index(session_id: str, raw_text: str) -> List[Dict[str, Any]]:
    """
    Perform chunking, embedding, index compilation, and save results in vector_store/session_id/
    """
    session_dir = settings.VECTOR_STORE_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    index_path = session_dir / "index.faiss"
    metadata_path = session_dir / "metadata.pkl"
    
    # 1. Chunk Text
    chunks = chunk_text_by_pages(raw_text)
    if not chunks:
        # Fallback if text is short
        chunks = [{"chunk_id": 0, "page": 1, "section": "Summary", "text": raw_text}]
        
    # 2. Generate Embeddings
    model = get_embedding_model()
    texts = [c["text"] for c in chunks]
    embeddings = model.encode(texts, convert_to_numpy=True)
    
    # 3. Normalize vectors for Cosine Similarity (Inner Product)
    faiss.normalize_L2(embeddings)
    
    # 4. Create and Save FAISS index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)  # Inner Product index
    index.add(embeddings)
    
    # Write to disk
    faiss.write_index(index, str(index_path))
    with open(metadata_path, "wb") as f:
        pickle.dump(chunks, f)
        
    logger.info(f"Successfully compiled FAISS index for session {session_id} with {len(chunks)} chunks.")
    return chunks

def search_index(session_id: str, query: str) -> List[Dict[str, Any]]:
    """
    Retrieve top-k relevant chunks from the session's FAISS index.
    """
    session_dir = settings.VECTOR_STORE_DIR / session_id
    index_path = session_dir / "index.faiss"
    metadata_path = session_dir / "metadata.pkl"
    
    if not index_path.exists() or not metadata_path.exists():
        logger.warning(f"Vector index not found for session {session_id}. Returning empty search.")
        return []
        
    try:
        # Load FAISS index and metadata
        index = faiss.read_index(str(index_path))
        with open(metadata_path, "rb") as f:
            chunks = pickle.load(f)
            
        # Embed query
        model = get_embedding_model()
        query_vector = model.encode([query], convert_to_numpy=True)
        faiss.normalize_L2(query_vector)
        
        # Search index
        top_k = min(rag_config.TOP_K, index.ntotal)
        if top_k == 0:
            return []
            
        similarities, indices = index.search(query_vector, top_k)
        
        matched_chunks = []
        for sim, idx in zip(similarities[0], indices[0]):
            # FAISS returns -1 for no matches found
            if idx == -1 or idx >= len(chunks):
                continue
            
            # Apply similarity threshold
            if sim >= rag_config.SIMILARITY_THRESHOLD:
                chunk = chunks[idx].copy()
                chunk["similarity"] = float(sim)
                matched_chunks.append(chunk)
                
        logger.info(f"Retrieved {len(matched_chunks)} chunks for query: '{query}' in session {session_id}")
        return matched_chunks
    except Exception as e:
        logger.error(f"Error performing vector search for session {session_id}: {e}", exc_info=True)
        return []
