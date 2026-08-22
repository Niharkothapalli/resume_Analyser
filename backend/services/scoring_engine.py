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

def calculate_ats_score(
    parsed_resume: Dict[str, Any],
    raw_text: str,
    target_role: str,
    application_level: str = "fresher"
) -> Dict[str, Any]:
    """
    Compute evidence-based mathematical ATS score out of 100 for the selected application_level:
      - Fresher:   Tech (25), Exp (5),  Proj (30), Keywords (15), Edu (20), Quality (5) = 100
      - Junior:    Tech (25), Exp (15), Proj (25), Keywords (15), Edu (15), Quality (5) = 100
      - Mid-Level: Tech (30), Exp (25), Proj (15), Keywords (15), Edu (10), Quality (5) = 100
      - Senior:    Tech (25), Exp (35), Proj (10), Keywords (15), Edu (10), Quality (5) = 100
    """
    level = (application_level or "fresher").strip().lower().replace("-", "_")
    valid_levels = {"fresher", "junior", "mid_level", "senior"}
    if level not in valid_levels:
        level = "fresher"

    # Category Maximum Weights per Level
    level_weights = {
        "fresher":   {"tech": 25, "exp": 5,  "proj": 30, "kw": 15, "edu": 20, "qual": 5},
        "junior":    {"tech": 25, "exp": 15, "proj": 25, "kw": 15, "edu": 15, "qual": 5},
        "mid_level": {"tech": 30, "exp": 25, "proj": 15, "kw": 15, "edu": 10, "qual": 5},
        "senior":    {"tech": 25, "exp": 35, "proj": 10, "kw": 15, "edu": 10, "qual": 5},
    }
    weights = level_weights[level]

    role_data = get_role_data(target_role)
    required = [s.lower() for s in role_data.get("required_skills", [])]
    preferred = [s.lower() for s in role_data.get("preferred_skills", [])]
    keywords = [k.lower() for k in role_data.get("keywords", [])]

    resume_skills_lower = [s.lower() for s in parsed_resume.get("skills", [])]
    raw_text_lower = raw_text.lower()
    metrics = parsed_resume.get("quality_metrics", {})
    action_verbs_count = metrics.get("unique_action_verbs_count", 0)

    # 1. Technical Skills
    tech_max = weights["tech"]
    req_matched = [s for s in required if s in resume_skills_lower]
    req_ratio = len(req_matched) / len(required) if required else 1.0

    pref_matched = [s for s in preferred if s in resume_skills_lower]
    pref_ratio = len(pref_matched) / len(preferred) if preferred else 1.0

    tech_score = round(req_ratio * (tech_max * 0.70) + pref_ratio * (tech_max * 0.30))
    tech_score = min(tech_max, max(0, tech_score))

    # 2. Experience / Exposure (Evidence-Based)
    exp_max = weights["exp"]
    exp_found = parsed_resume.get("experience_found", False)
    exp_score = 0

    if level == "fresher":
        # Fresher: evaluate internships, freelance, apprenticeships, or research exposure
        exposure_terms = ["intern", "internship", "trainee", "freelance", "apprentice", "research assistant", "volunteer"]
        has_exposure = any(term in raw_text_lower for term in exposure_terms)
        if exp_found:
            exp_score = 5
        elif has_exposure:
            exp_score = 4
        else:
            exp_score = 0
    elif level == "junior":
        if exp_found:
            exp_score = 10
            # Check for 1-2 years experience or quantifiable contribution evidence
            if any(ind in raw_text_lower for ind in ["year", "years", "yrs", "months"]) or metrics.get("achievements_quantified", False):
                exp_score += 5
        else:
            # Junior with no experience but internship exposure
            exposure_terms = ["intern", "internship", "trainee", "freelance"]
            if any(term in raw_text_lower for term in exposure_terms):
                exp_score = 5
    elif level == "mid_level":
        if exp_found:
            exp_score = 14
            # Evidence of 3+ years or mid-level progression
            if any(ind in raw_text_lower for ind in ["3+ years", "3 years", "4 years", "5 years", "3-5 years", "mid", "engineer", "developer"]):
                exp_score += 6
            if metrics.get("achievements_quantified", False):
                exp_score += 5
    elif level == "senior":
        if exp_found:
            senior_role_terms = ["senior", "lead", "architect", "manager", "principal", "sr.", "director", "head", "staff"]
            has_senior_role = any(term in raw_text_lower for term in senior_role_terms)
            has_long_exp = any(ind in raw_text_lower for ind in ["5+ years", "5 years", "6+ years", "7+ years", "8+ years", "10+ years", "lead", "architect"])
            
            exp_score = 15
            if has_senior_role and has_long_exp:
                exp_score += 12
            elif has_senior_role or has_long_exp:
                exp_score += 6
                
            if metrics.get("achievements_quantified", False) and action_verbs_count >= 5:
                exp_score += 8
    exp_score = min(exp_max, max(0, exp_score))

    # 3. Projects (Evidence-Based)
    proj_max = weights["proj"]
    proj_found = parsed_resume.get("projects_found", False)
    proj_score = 0

    if level == "fresher":
        if proj_found:
            proj_score = 18
            # Multiple project blocks or descriptions
            words = raw_text_lower.split()
            if words.count("project") >= 2 or len(parsed_resume.get("skills", [])) >= 5:
                proj_score += 6
            if action_verbs_count >= 5:
                proj_score += 6
        else:
            # Check if project words are present in raw text
            if "project" in raw_text_lower or "github" in raw_text_lower:
                proj_score = 8
    elif level == "junior":
        if proj_found:
            proj_score = 15
            if action_verbs_count >= 5:
                proj_score += 5
            if len(parsed_resume.get("skills", [])) >= 5:
                proj_score += 5
    elif level == "mid_level":
        if proj_found:
            proj_score = 9
            if action_verbs_count >= 5:
                proj_score += 3
            if metrics.get("achievements_quantified", False):
                proj_score += 3
    elif level == "senior":
        if proj_found:
            proj_score = 6
            if action_verbs_count >= 5 and metrics.get("achievements_quantified", False):
                proj_score += 4
    proj_score = min(proj_max, max(0, proj_score))

    # 4. Keyword Match
    kw_max = weights["kw"]
    keyword_breakdown = []
    kw_matched_count = 0
    for kw in keywords:
        found = kw in raw_text_lower
        if found:
            kw_matched_count += 1
        keyword_breakdown.append({
            "keyword": kw.title() if len(kw) > 3 else kw.upper(),
            "found": found
        })
    kw_ratio = (kw_matched_count / len(keywords)) if keywords else 1.0
    keyword_score = min(kw_max, max(0, round(kw_ratio * kw_max)))

    # 5. Education Credentials (Role Relevance Aware)
    edu_max = weights["edu"]
    edu_found = parsed_resume.get("education_found", False)
    edu_score = 0

    if edu_found:
        # Check relevance to tech/engineering roles
        tech_degree_terms = ["computer science", "cs", "engineering", "b.tech", "b.e", "b.s", "m.s", "m.tech", "information technology", "it", "data science", "software", "artificial intelligence"]
        is_relevant_degree = any(term in raw_text_lower for term in tech_degree_terms)
        
        if level == "fresher":
            edu_score = 14
            if is_relevant_degree:
                edu_score += 6
            else:
                edu_score += 2
        elif level == "junior":
            edu_score = 10
            if is_relevant_degree:
                edu_score += 5
            else:
                edu_score += 2
        elif level in ["mid_level", "senior"]:
            edu_score = 7
            if is_relevant_degree or any(d in raw_text_lower for d in ["master", "m.s", "phd"]):
                edu_score += 3
            else:
                edu_score += 1
    edu_score = min(edu_max, max(0, edu_score))

    # 6. Resume Quality
    quality_max = weights["qual"]
    quality_score = 0
    if metrics.get("linkedin_present", False):
        quality_score += 1
    if metrics.get("github_present", False):
        quality_score += 1
    if metrics.get("portfolio_present", False):
        quality_score += 1
    if metrics.get("achievements_quantified", False):
        quality_score += 1
    if action_verbs_count >= 5:
        quality_score += 1
    quality_score = min(quality_max, max(0, quality_score))

    # Final Overall ATS Score out of 100
    final_score = tech_score + exp_score + proj_score + keyword_score + edu_score + quality_score

    return {
        "ats_score": final_score,
        "score_breakdown": {
            "technical_skills": {"score": tech_score, "max": tech_max},
            "experience": {"score": exp_score, "max": exp_max},
            "projects": {"score": proj_score, "max": proj_max},
            "keyword_match": {"score": keyword_score, "max": kw_max},
            "education": {"score": edu_score, "max": edu_max},
            "resume_quality": {"score": quality_score, "max": quality_max}
        },
        "keyword_breakdown": keyword_breakdown,
        "role_data": role_data
    }

