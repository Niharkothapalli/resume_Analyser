import json
import logging
from pathlib import Path
from typing import Dict, Any, List
from backend.config import settings
from backend.services.llm_factory import get_llm_service
from backend.rag.vector_store import search_index

logger = logging.getLogger("careerlens_ai")

class ChatService:
    """
    Coordinates Resume Assistant conversations.
    Retrieves history and vector context, loads templates, and queries configured LLM provider.
    """
    
    def __init__(self):
        self.llm_service = get_llm_service()

    def handle_message(self, session_id: str, message: str) -> str:
        """
        Processes a chat query, fetches local RAG matches, loads history,
        submits prompt to configured LLM provider, and updates history cache.
        """
        logger.info(f"Processing chat message for session {session_id}")
        
        session_dir = settings.UPLOADS_DIR / session_id
        analysis_path = session_dir / "analysis.json"
        role_snapshot_path = session_dir / "role_snapshot.json"
        parsed_resume_path = session_dir / "parsed_resume.json"
        chat_history_path = session_dir / "chat_history.json"
        
        # 1. Grounding checks (must have parsed resume and original analysis report)
        if not parsed_resume_path.exists():
            raise FileNotFoundError("Parsed resume not found. Please upload a resume first.")
        if not analysis_path.exists():
            raise FileNotFoundError("Analysis report not found. Please run the analysis first.")
            
        with open(parsed_resume_path, "r") as f:
            parsed_resume = json.load(f)
            
        with open(analysis_path, "r") as f:
            analysis_data = json.load(f)
            
        # Get target role from snapshot or analysis report
        target_role = "Software Engineer"
        if role_snapshot_path.exists():
            try:
                with open(role_snapshot_path, "r") as f:
                    role_snapshot = json.load(f)
                    target_role = role_snapshot.get("role", target_role)
            except Exception:
                pass
        else:
            target_role = analysis_data.get("role", target_role)
            
        # 2. Retrieve semantic context (RAG)
        logger.info(f"Searching FAISS index for chat query: '{message}'...")
        rag_chunks = search_index(session_id, message)
        # Select top-3 chunks for chat to conserve context space
        rag_context = "\n\n".join([f"Page {c['page']}, Section {c['section']}: {c['text']}" for c in rag_chunks[:3]])

        # 3. Load Chat History
        history = []
        if chat_history_path.exists():
            try:
                with open(chat_history_path, "r") as f:
                    history = json.load(f)
            except Exception as e:
                logger.error(f"Error loading chat history: {e}", exc_info=True)
                
        # Format history for prompt (limit to last 8 turns to avoid context overflow)
        recent_history = history[-8:]
        history_str = ""
        for turn in recent_history:
            role = "User" if turn["role"] == "user" else "Assistant"
            history_str += f"{role}: {turn['content']}\n"
            
        # 4. Load prompt templates
        v_dir = settings.PROMPTS_DIR / settings.PROMPT_VERSION
        system_prompt_path = v_dir / "system_prompt.txt"
        chat_prompt_path = v_dir / "chat_prompt.txt"
        
        if not system_prompt_path.exists() or not chat_prompt_path.exists():
            raise FileNotFoundError(
                f"Prompt version directory '{settings.PROMPT_VERSION}' is incomplete. "
                f"Missing prompt files in: {v_dir}"
            )
            
        with open(system_prompt_path, "r") as f:
            system_instruction = f.read()
        with open(chat_prompt_path, "r") as f:
            chat_prompt_template = f.read()
            
        # 5. Compile Prompt
        prompt_user = chat_prompt_template.format(
            target_role=target_role,
            parsed_profile=json.dumps(parsed_resume, indent=2),
            analysis_report=json.dumps({
                "summary": analysis_data.get("summary"),
                "ats_score": analysis_data.get("ats_score"),
                "strengths": analysis_data.get("strengths", [])[:3],
                "missing_skills": analysis_data.get("missing_skills", [])[:5]
            }, indent=2),
            rag_context=rag_context,
            chat_history=history_str,
            user_message=message
        )
        
        # 6. Call LLM Service
        logger.info(f"Submitting chat prompt to LLM Service ({self.llm_service.provider_name})...")
        llm_response = self.llm_service.generate_chat_response(
            prompt=prompt_user,
            system_instruction=system_instruction
        )
        reply = llm_response.get("text", "")
        
        # 7. Update and Save History
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": reply})
        
        try:
            with open(chat_history_path, "w") as f:
                json.dump(history, f, indent=2)
            logger.info("Successfully updated session chat history on disk.")
        except Exception as e:
            logger.error(f"Failed to save chat history: {e}", exc_info=True)
            
        return reply

