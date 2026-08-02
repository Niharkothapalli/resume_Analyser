import json
import logging
from pathlib import Path
from typing import Dict, Any, List
from backend.config import settings

logger = logging.getLogger("careerlens_ai")

def get_role_data(target_role: str) -> Dict[str, Any]:
    """
    Search and load the JSON definition file for target_role.
    If not found or custom, generate a dynamically derived role requirements set.
    """
    roles_dir = settings.KNOWLEDGE_BASE_DIR / "roles"
    
    # Standardize target_role into a filename search (e.g. "Backend Developer" -> "backend_developer")
    slug = target_role.lower().replace(" ", "_").replace("-", "_")
    role_file = roles_dir / f"{slug}.json"
    
    if role_file.exists():
        try:
            with open(role_file, "r") as f:
                logger.info(f"Successfully loaded role profile for {target_role} from {role_file}")
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading role file {role_file}: {e}", exc_info=True)
            
    # Fallback/dynamic setup for custom roles
    logger.info(f"Role file for '{target_role}' not found. Generating dynamic fallback schema.")
    
    # Try fuzzy matching in existing roles
    for file in roles_dir.glob("*.json"):
        try:
            with open(file, "r") as f:
                data = json.load(f)
                # If target role name is inside or similar to filename, reuse it
                if slug in data.get("role", "").lower() or data.get("role", "").lower() in slug:
                    logger.info(f"Fuzzy matched custom role '{target_role}' to existing role '{data['role']}'")
                    return data
        except Exception:
            pass

    # Generic developer fallback
    return {
        "role": target_role,
        "required_skills": [s.strip() for s in target_role.split() if len(s) > 3] + ["Git", "SQL"],
        "preferred_skills": ["Docker", "AWS", "CI/CD"],
        "optional_skills": ["Linux", "NoSQL"],
        "keywords": [target_role, "API", "Agile", "Architecture"],
        "recommended_certifications": ["AWS Certified Practitioner"]
    }

def calculate_ats_score(parsed_resume: Dict[str, Any], raw_text: str, target_role: str) -> Dict[str, Any]:
    """
    Compute mathematical ATS score out of 100 based on weights:
      - Technical Skills (30%)
      - Experience (20%)
      - Projects (20%)
      - Keyword Match (15%)
      - Education (10%)
      - Resume Quality (5%)
    """
    role_data = get_role_data(target_role)
    
    required = [s.lower() for s in role_data.get("required_skills", [])]
    preferred = [s.lower() for s in role_data.get("preferred_skills", [])]
    keywords = [k.lower() for k in role_data.get("keywords", [])]
    
    resume_skills_lower = [s.lower() for s in parsed_resume.get("skills", [])]
    raw_text_lower = raw_text.lower()
    
    # 1. Technical Skills (Max 30)
    # Required skills match (up to 20 pts)
    req_matched = [s for s in required if s in resume_skills_lower]
    req_score = (len(req_matched) / len(required)) * 20 if required else 20.0
    
    # Preferred skills match (up to 10 pts)
    pref_matched = [s for s in preferred if s in resume_skills_lower]
    pref_score = (len(pref_matched) / len(preferred)) * 10 if preferred else 10.0
    
    tech_score = min(30, round(req_score + pref_score))
    
    # 2. Experience (Max 20)
    exp_score = 0
    if parsed_resume.get("experience_found", False):
        exp_score += 12
        # Check for seniority indicators
        senior_terms = ["senior", "lead", "architect", "manager", "principal", "sr.", "director"]
        if any(term in raw_text_lower for term in senior_terms):
            exp_score += 5
        # Check for long-term indicators (e.g. 3+ years, 5+ years)
        if any(indicator in raw_text_lower for indicator in ["years experience", "years of experience", "yrs experience"]):
            exp_score += 3
    exp_score = min(20, exp_score)
            
    # 3. Projects (Max 20)
    proj_score = 0
    if parsed_resume.get("projects_found", False):
        proj_score += 12
        # Check if they list multiple projects or rich tech terms
        words = raw_text_lower.split()
        project_word_count = len([w for w in words if w == "project"])
        if project_word_count >= 2:
            proj_score += 4
        # Check if project descriptions contain action verbs
        if parsed_resume.get("quality_metrics", {}).get("unique_action_verbs_count", 0) >= 6:
            proj_score += 4
    proj_score = min(20, proj_score)

    # 4. Keyword Match (Max 15)
    # Calculate keyword checks
    keyword_breakdown = []
    kw_matched_count = 0
    for kw in keywords:
        found = kw in raw_text_lower
        if found:
            kw_matched_count += 1
        # Title case keyword for output
        keyword_breakdown.append({
            "keyword": kw.title() if len(kw) > 3 else kw.upper(),
            "found": found
        })
        
    kw_score = (kw_matched_count / len(keywords)) * 15 if keywords else 15.0
    keyword_score = min(15, round(kw_score))
    
    # 5. Education (Max 10)
    edu_score = 0
    if parsed_resume.get("education_found", False):
        edu_score += 8
        # Add points for higher degrees
        higher_degrees = ["master", "m.s", "m.tech", "phd", "ph.d", "mba"]
        if any(degree in raw_text_lower for degree in higher_degrees):
            edu_score += 2
    edu_score = min(10, edu_score)

    # 6. Resume Quality (Max 5)
    quality_score = 0
    metrics = parsed_resume.get("quality_metrics", {})
    if metrics.get("linkedin_present", False):
        quality_score += 1
    if metrics.get("github_present", False):
        quality_score += 1
    if metrics.get("portfolio_present", False):
        quality_score += 1
    if metrics.get("achievements_quantified", False):
        quality_score += 1
    if metrics.get("unique_action_verbs_count", 0) >= 5:
        quality_score += 1
    quality_score = min(5, quality_score)
    
    # Final overall score
    final_score = tech_score + exp_score + proj_score + keyword_score + edu_score + quality_score
    
    return {
        "ats_score": final_score,
        "score_breakdown": {
            "technical_skills": {"score": tech_score, "max": 30},
            "experience": {"score": exp_score, "max": 20},
            "projects": {"score": proj_score, "max": 20},
            "keyword_match": {"score": keyword_score, "max": 15},
            "education": {"score": edu_score, "max": 10},
            "resume_quality": {"score": quality_score, "max": 5}
        },
        "keyword_breakdown": keyword_breakdown,
        "role_data": role_data
    }
