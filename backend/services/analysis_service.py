import json
import logging
from pathlib import Path
from typing import Dict, Any, List
from backend.config import settings
from backend.services.scoring_engine import calculate_ats_score, get_role_data
from backend.services.llm_factory import get_llm_service
from backend.schemas.responses import AnalysisReport
from backend.rag.vector_store import search_index

logger = logging.getLogger("careerlens_ai")

class AnalysisService:
    """
    Orchestrates the entire resume analysis flow.
    Responsible for loading parsed data, retrieving RAG context, executing scoring,
    building versioned prompts, and invoking the configured LLM provider via LLMFactory.
    """
    
    def __init__(self):
        self.llm_service = get_llm_service()


    def run_analysis(self, session_id: str, target_role: str) -> Dict[str, Any]:
        """
        Main runner orchestrating RAG search, scoring, role snapshot, and LLM calls.
        Caches the output directly under uploads/{session_id}/analysis.json
        """
        logger.info(f"Initiating analysis for session {session_id} and target role: {target_role}")
        
        session_dir = settings.UPLOADS_DIR / session_id
        parsed_resume_path = session_dir / "parsed_resume.json"
        analysis_path = session_dir / "analysis.json"
        role_snapshot_path = session_dir / "role_snapshot.json"
        
        # 1. Verification of uploaded parsed data
        if not parsed_resume_path.exists():
            raise FileNotFoundError(
                f"No parsed resume data found for session {session_id}. Please upload a resume first."
            )
            
        with open(parsed_resume_path, "r") as f:
            parsed_resume = json.load(f)
            
        # Get raw text
        resume_pdf_path = session_dir / "resume.pdf"
        # We can extract text or look up chunks
        # Let's search FAISS vector index for relevance to target_role
        logger.info("Retrieving RAG semantic context blocks matching target role...")
        rag_chunks = search_index(session_id, target_role)
        rag_context = "\n\n".join([f"Chunk {c['chunk_id']} (Page {c['page']}, Section {c['section']}): {c['text']}" for c in rag_chunks])
        
        # 2. Get role requirement data
        role_info = get_role_data(target_role)
        
        # Save Session Role Snapshot (Improvement #5)
        logger.info(f"Writing role snapshot to session path: {role_snapshot_path}")
        with open(role_snapshot_path, "w") as f:
            json.dump(role_info, f, indent=2)

        # 3. Calculate Python scoring
        # Load raw text from chunks to get complete keyword coverage
        raw_text_for_scoring = parsed_resume.get("raw_text", "")
        if not raw_text_for_scoring and resume_pdf_path.exists():
            # Extract on the fly if not stored
            from backend.services.pdf_parser import extract_pdf_text_and_pages
            try:
                raw_text_for_scoring, _ = extract_pdf_text_and_pages(resume_pdf_path)
            except Exception:
                pass
                
        logger.info("Computing mathematical ATS score...")
        score_results = calculate_ats_score(parsed_resume, raw_text_for_scoring, target_role)
        ats_score = score_results["ats_score"]
        breakdown = score_results["score_breakdown"]
        keyword_breakdown = score_results["keyword_breakdown"]
        
        # Identify missing skills
        req_skills = [s.lower() for s in role_info.get("required_skills", [])]
        pref_skills = [s.lower() for s in role_info.get("preferred_skills", [])]
        candidate_skills = [s.lower() for s in parsed_resume.get("skills", [])]
        
        missing_skills = []
        for s in role_info.get("required_skills", []):
            if s.lower() not in candidate_skills:
                missing_skills.append(s)
        for s in role_info.get("preferred_skills", []):
            if s.lower() not in candidate_skills:
                # Include preferred skills that are missing too
                missing_skills.append(s)

        # 4. Project & Certification Matching (Improvement #5)
        logger.info("Matching potential database projects and certifications to close skill gaps...")
        matched_projects = self._match_projects(missing_skills)
        matched_certs = self._match_certifications(missing_skills)

        # 5. Load Prompt templates (Prompt Versioning Improvement #3)
        v_dir = settings.PROMPTS_DIR / settings.PROMPT_VERSION
        system_prompt_path = v_dir / "system_prompt.txt"
        ats_prompt_path = v_dir / "ats_prompt.txt"
        
        if not system_prompt_path.exists() or not ats_prompt_path.exists():
            raise FileNotFoundError(
                f"Prompt version directory '{settings.PROMPT_VERSION}' is incomplete. "
                f"Missing prompt files in: {v_dir}"
            )
            
        with open(system_prompt_path, "r") as f:
            system_instruction = f.read()
        with open(ats_prompt_path, "r") as f:
            ats_prompt_template = f.read()
            
        # 6. Fill template variables
        prompt_user = ats_prompt_template.format(
            target_role=target_role,
            ats_score=ats_score,
            tech_score=breakdown["technical_skills"]["score"],
            exp_score=breakdown["experience"]["score"],
            proj_score=breakdown["projects"]["score"],
            keyword_score=breakdown["keyword_match"]["score"],
            edu_score=breakdown["education"]["score"],
            quality_score=breakdown["resume_quality"]["score"],
            parsed_profile=json.dumps(parsed_resume, indent=2),
            rag_context=rag_context,
            matched_projects=json.dumps(matched_projects, indent=2),
            matched_certifications=json.dumps(matched_certs, indent=2)
        )
        
        # 7. Query LLM Service
        logger.info(f"Sending prompt to LLM Service ({self.llm_service.provider_name}) for structured evaluation...")
        llm_response = self.llm_service.generate_structured_response(
            prompt=prompt_user,
            system_instruction=system_instruction,
            response_schema=AnalysisReport
        )
        
        response_text = llm_response.get("text", "")
        
        # Clean response and format
        try:
            clean_json = response_text.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json.split("```json")[1].split("```")[0].strip()
            elif clean_json.startswith("```"):
                clean_json = clean_json.split("```")[1].split("```")[0].strip()
                
            report_data = json.loads(clean_json)
            
            # Re-enforce/inject exact Python calculated scores to maintain mathematical precision
            report_data["ats_score"] = ats_score
            for cat, details in breakdown.items():
                if cat in report_data.get("score_breakdown", {}):
                    report_data["score_breakdown"][cat]["score"] = details["score"]
                    report_data["score_breakdown"][cat]["max"] = details["max"]
            
            # Ensure keyword breakdown is injected correctly
            report_data["keyword_breakdown"] = keyword_breakdown
            
            # Write cache
            with open(analysis_path, "w") as f:
                json.dump(report_data, f, indent=2)
                
            logger.info(f"Successfully processed analysis report and saved cache for session {session_id}")
            return report_data
            
        except Exception as e:
            logger.error(f"Error parsing LLM JSON output: {e}. Raw response: {response_text}", exc_info=True)
            raise RuntimeError(f"LLM output parsing failure: {str(e)}")


    def _match_projects(self, missing_skills: List[str]) -> List[Dict[str, Any]]:
        """
        Search projects.json and select those addressing missing skills.
        """
        projects_file = settings.KNOWLEDGE_BASE_DIR / "projects.json"
        if not projects_file.exists():
            return []
            
        try:
            with open(projects_file, "r") as f:
                projects = json.load(f)
                
            missing_skills_lower = [s.lower() for s in missing_skills]
            matched = []
            
            for project in projects:
                # Count skill overlap
                overlap = [s for s in project.get("skills", []) if s.lower() in missing_skills_lower]
                if overlap or not missing_skills:  # If no missing skills, return general projects
                    project_copy = project.copy()
                    project_copy["matched_skills"] = overlap
                    matched.append(project_copy)
                    
            # Sort by overlap coverage
            matched.sort(key=lambda x: len(x.get("matched_skills", [])), reverse=True)
            return matched[:3]  # Return top 3 projects
        except Exception as e:
            logger.error(f"Failed to match projects from knowledge base: {e}", exc_info=True)
            return []

    def _match_certifications(self, missing_skills: List[str]) -> List[Dict[str, Any]]:
        """
        Search certifications.json and select those addressing missing skills.
        """
        certs_file = settings.KNOWLEDGE_BASE_DIR / "certifications.json"
        if not certs_file.exists():
            return []
            
        try:
            with open(certs_file, "r") as f:
                certs = json.load(f)
                
            missing_skills_lower = [s.lower() for s in missing_skills]
            matched = []
            
            for cert in certs:
                overlap = [s for s in cert.get("skills_covered", []) if s.lower() in missing_skills_lower]
                if overlap or not missing_skills:
                    cert_copy = cert.copy()
                    cert_copy["matched_skills"] = overlap
                    matched.append(cert_copy)
                    
            matched.sort(key=lambda x: len(x.get("matched_skills", [])), reverse=True)
            return matched[:3]  # Return top 3 certifications
        except Exception as e:
            logger.error(f"Failed to match certifications from knowledge base: {e}", exc_info=True)
            return []
