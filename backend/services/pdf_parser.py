import re
import pdfplumber
import logging
from pathlib import Path
from typing import Dict, Any, List

logger = logging.getLogger("careerlens_ai")

# Core Action Verbs list for resume quality checks
ACTION_VERBS = {
    "led", "managed", "designed", "architected", "developed", "implemented", 
    "optimized", "engineered", "built", "created", "spearheaded", "accelerated", 
    "achieved", "delivered", "mentored", "coached", "streamlined", "increased", 
    "reduced", "saved", "automated", "launched", "maximized", "transformed"
}

def extract_pdf_text_and_pages(pdf_path: Path) -> tuple[str, int]:
    """
    Extract raw text from PDF and return the text along with page count.
    """
    text = ""
    pages_count = 0
    try:
        with pdfplumber.open(pdf_path) as pdf:
            pages_count = len(pdf.pages)
            for page_num, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text += f"\n--- Page {page_num + 1} ---\n" + page_text
        
        # Clean double spaces but preserve line endings
        text = re.sub(r'[ \t]+', ' ', text)
        return text, pages_count
    except Exception as e:
        logger.error(f"Failed to parse PDF {pdf_path}: {e}", exc_info=True)
        raise ValueError("Could not extract readable text from PDF. Ensure it is a valid, unencrypted document.")

def parse_resume_structure(text: str, page_count: int) -> Dict[str, Any]:
    """
    Heuristically parse sections, links, and text patterns to extract structure and quality parameters.
    """
    # Regex definitions
    email_regex = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')
    phone_regex = re.compile(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')
    linkedin_regex = re.compile(r'linkedin\.com/in/[\w\-]+', re.IGNORECASE)
    github_regex = re.compile(r'github\.com/[\w\-]+', re.IGNORECASE)
    portfolio_regex = re.compile(r'(?:https?://)?(?:www\.)?([a-zA-Z0-9\-]+\.[a-zA-Z]{2,})(?:/[\w\-]*)*/?', re.IGNORECASE)

    # Cleaned lines for search
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # 1. Contact Information Extraction
    email_match = email_regex.search(text)
    phone_match = phone_regex.search(text)
    linkedin_match = linkedin_regex.search(text)
    github_match = github_regex.search(text)
    
    email = email_match.group(0) if email_match else ""
    phone = phone_match.group(0) if phone_match else ""
    linkedin = linkedin_match.group(0) if linkedin_match else ""
    github = github_match.group(0) if github_match else ""
    
    # Extract portfolio link (any url that is not linkedin or github or email)
    portfolio = ""
    urls = portfolio_regex.findall(text)
    for url in urls:
        url_lower = url.lower()
        if "linkedin" not in url_lower and "github" not in url_lower and "gmail" not in url_lower:
            portfolio = url
            break

    # Common resume section titles and generic terms to ignore when detecting candidate name
    IGNORED_SECTION_HEADERS = {
        "technical skills", "skills", "education", "projects", "academic projects",
        "personal projects", "key projects", "experience", "work experience",
        "work history", "employment history", "professional summary", "summary",
        "executive summary", "objective", "career objective", "certifications",
        "licenses", "achievements", "accomplishments", "internships", "languages",
        "tools", "contact", "profile", "overview", "curriculum vitae", "resume",
        "skills & expertise", "qualifications", "candidate", "candidate profile"
    }

    COMMON_JOB_TITLES = {
        "software engineer", "full stack developer", "frontend developer",
        "backend developer", "data scientist", "data engineer", "devops engineer",
        "product manager", "project manager", "system administrator",
        "cloud architect", "machine learning engineer", "ai engineer",
        "web developer", "ui/ux designer", "solutions architect"
    }

    # Estimate candidate name (first few non-empty lines before section titles)
    candidate_name = ""
    for line in lines[:10]:
        line_clean = line.strip()
        line_lower = line_clean.lower()

        if "--- page" in line_lower:
            continue
        if email_regex.search(line_clean) or phone_regex.search(line_clean) or "linkedin" in line_lower or "github" in line_lower or "http" in line_lower or "@" in line_lower:
            continue

        # Ignore lines matching any known section headers or common job titles
        if any(sec == line_lower or line_lower.startswith(sec + ":") or line_lower.startswith(sec + " -") for sec in IGNORED_SECTION_HEADERS | COMMON_JOB_TITLES):
            continue

        # Words check: 2 to 4 words
        words = line_clean.split()
        alpha_words = [w for w in words if w.isalpha()]
        
        if 2 <= len(alpha_words) <= 4 and len(alpha_words) == len(words):
            # Check Title Case (e.g. "Nihar Kothapalli") OR ALL CAPS (e.g. "NIHAR KOTHAPALLI")
            is_title_case = all(w[0].isupper() and (len(w) == 1 or w[1:].islower()) for w in words)
            is_all_caps = all(w.isupper() for w in words)

            if is_title_case or is_all_caps:
                # Format properly to Title Case (e.g. "NIHAR KOTHAPALLI" -> "Nihar Kothapalli")
                candidate_name = " ".join([w.capitalize() for w in words])
                break

    if candidate_name.lower() in IGNORED_SECTION_HEADERS or candidate_name.lower() in COMMON_JOB_TITLES:
        candidate_name = ""

    # 2. Section Headings Detection
    sections_found = []
    section_patterns = {
        "Skills": r'\b(?:skills|technologies|technical skills|skills & expertise)\b',
        "Experience": r'\b(?:experience|work history|employment history|work experience)\b',
        "Projects": r'\b(?:projects|academic projects|personal projects|key projects)\b',
        "Education": r'\b(?:education|academic background|qualifications)\b',
        "Certifications": r'\b(?:certifications|licenses|courses)\b'
    }
    
    for section, pattern in section_patterns.items():
        if re.search(pattern, text, re.IGNORECASE):
            sections_found.append(section)

    # 3. Heuristic Skills Extraction
    # Look for a block under the skills heading, or parse common programming tech from entire text
    common_skills_db = [
        "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang", "rust", "ruby", "php", "swift", "kotlin",
        "spring boot", "react", "angular", "vue", "next.js", "node.js", "express", "django", "flask", "fastapi",
        "sql", "postgresql", "mysql", "mongodb", "redis", "cassandra", "elasticsearch", "oracle", "sqlite",
        "docker", "kubernetes", "aws", "gcp", "azure", "terraform", "ansible", "jenkins", "git", "github", "gitlab",
        "ci/cd", "linux", "bash", "spark", "hadoop", "airflow", "kafka", "snowflake", "dbt", "pytorch", "tensorflow",
        "scikit-learn", "keras", "machine learning", "deep learning", "nlp", "llm", "rag", "langchain", "framer motion",
        "tailwind css", "html", "css", "graphql", "rest api", "microservices", "unit testing", "junit", "pytest"
    ]
    
    extracted_skills = []
    text_lower = text.lower()
    for skill in common_skills_db:
        # Match word boundaries to avoid false positives (e.g. matching "go" inside "good")
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Format back to nice casing
            title_cased = skill.title()
            if skill in ["sql", "aws", "gcp", "etl", "rest api", "html", "css", "nlp", "llm", "rag", "ci/cd"]:
                title_cased = skill.upper()
            elif skill in ["javascript", "typescript"]:
                title_cased = "JavaScript" if skill == "javascript" else "TypeScript"
            elif skill == "next.js":
                title_cased = "Next.js"
            elif skill == "node.js":
                title_cased = "Node.js"
            elif skill == "fastapi":
                title_cased = "FastAPI"
            elif skill == "spring boot":
                title_cased = "Spring Boot"
            elif skill == "scikit-learn":
                title_cased = "Scikit-Learn"
            elif skill == "framer motion":
                title_cased = "Framer Motion"
            extracted_skills.append(title_cased)

    # 4. Resume Quality Metrics
    # Action verbs check
    found_action_verbs = []
    words_in_text = re.findall(r'\b\w+\b', text_lower)
    for word in words_in_text:
        if word in ACTION_VERBS:
            found_action_verbs.append(word)
    unique_action_verbs_count = len(set(found_action_verbs))

    # Metric-driven / Quantified achievements check
    # Check for numbers followed by '%' or keywords like 'million', 'saved', 'reduced', or '$' values
    quantified_matches = re.findall(r'(\b\d+%\b|\$\d+[\d,]*|\b\d+\s*(?:percent|users|developers|servers|seconds|ms|hours|pages)\b)', text, re.IGNORECASE)
    achievements_quantified = len(quantified_matches) >= 3

    # Education Check
    education_indicators = ["bachelor", "master", "degree", "b.s", "m.s", "b.tech", "m.tech", "phd", "university", "college", "institute"]
    education_found = any(ind in text_lower for ind in education_indicators)

    # Experience Check (Check years or terms like 'years of experience' or section match)
    experience_found = "Experience" in sections_found or "Work History" in text

    # Projects Check
    projects_found = "Projects" in sections_found or len(re.findall(r'\bproject\b', text_lower)) >= 2

    # Certifications Check
    certifications_found = "Certifications" in sections_found or len(re.findall(r'\bcertificat\b', text_lower)) >= 1

    return {
        "name": candidate_name,
        "email": email,
        "phone": phone,
        "linkedin": linkedin,
        "github": github,
        "portfolio": portfolio,
        "skills": list(set(extracted_skills)),
        "sections_found": sections_found,
        "education_found": education_found,
        "experience_found": experience_found,
        "projects_found": projects_found,
        "certifications_found": certifications_found,
        "quality_metrics": {
            "linkedin_present": bool(linkedin),
            "github_present": bool(github),
            "portfolio_present": bool(portfolio),
            "unique_action_verbs_count": unique_action_verbs_count,
            "achievements_quantified": achievements_quantified,
            "resume_length_pages": page_count
        }
    }
