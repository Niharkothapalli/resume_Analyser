import sys
from pathlib import Path

# Add backend parent to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.services.scoring_engine import calculate_ats_score

def run_sanity_tests():
    print("=" * 80)
    print("CAREERLENS AI - APPLICATION LEVEL SCORING SANITY CHECKS")
    print("=" * 80)

    target_role = "Backend Developer"

    # Profile A: Strong Fresher (No work experience, but strong degree, projects, skills & keywords)
    strong_fresher_parsed = {
        "name": "Alice Smith",
        "skills": ["Java", "Spring Boot", "REST API", "SQL", "Docker", "Git", "PostgreSQL", "Python"],
        "experience_found": False,
        "projects_found": True,
        "education_found": True,
        "quality_metrics": {
            "linkedin_present": True,
            "github_present": True,
            "portfolio_present": True,
            "achievements_quantified": True,
            "unique_action_verbs_count": 8
        }
    }
    strong_fresher_text = (
        "Alice Smith | Email: alice@example.com\n"
        "Education: Bachelor of Technology (B.Tech) in Computer Science & Engineering (2020-2024).\n"
        "Skills: Java, Spring Boot, REST API, SQL, Docker, Git, PostgreSQL, Python.\n"
        "Projects: Built scalable microservices API backend project using Java, Spring Boot, REST API, SQL, Docker, and Git. Implemented relational database ORM, CI/CD pipelines, and automated testing.\n"
        "Internship: Software Developer Intern at Tech Start (Summer 2023).\n"
    )

    # Profile B: Weak Fresher
    weak_fresher_parsed = {
        "name": "Bob Jones",
        "skills": ["HTML", "CSS"],
        "experience_found": False,
        "projects_found": False,
        "education_found": True,
        "quality_metrics": {
            "linkedin_present": False,
            "github_present": False,
            "portfolio_present": False,
            "achievements_quantified": False,
            "unique_action_verbs_count": 1
        }
    }
    weak_fresher_text = (
        "Bob Jones | Email: bob@example.com\n"
        "Education: Bachelor of Arts in History.\n"
        "Skills: HTML, CSS.\n"
    )

    # Profile C: Strong Mid-Level
    strong_mid_parsed = {
        "name": "Charlie Engineer",
        "skills": ["Java", "Spring Boot", "REST API", "SQL", "Docker", "Git", "Redis", "Kafka", "AWS"],
        "experience_found": True,
        "projects_found": True,
        "education_found": True,
        "quality_metrics": {
            "linkedin_present": True,
            "github_present": True,
            "portfolio_present": True,
            "achievements_quantified": True,
            "unique_action_verbs_count": 10
        }
    }
    strong_mid_text = (
        "Charlie Engineer | Email: charlie@example.com\n"
        "Experience: 4 years of experience as Backend Engineer at Enterprise Systems (2020-Present).\n"
        "Developed high-performance microservices, reducing API latency by 35% using Java, Spring Boot, SQL, Docker, Redis, Kafka, and AWS. Managed CI/CD, ORM, relational database, and concurrency.\n"
        "Education: B.S. in Computer Science.\n"
        "Skills: Java, Spring Boot, REST API, SQL, Docker, Git, Redis, Kafka, AWS, CI/CD, Microservices, ORM.\n"
    )

    # Profile D: Strong Senior
    strong_senior_parsed = {
        "name": "Diana Architect",
        "skills": ["Java", "Spring Boot", "REST API", "SQL", "Docker", "Git", "Redis", "Kafka", "AWS", "Kubernetes"],
        "experience_found": True,
        "projects_found": True,
        "education_found": True,
        "quality_metrics": {
            "linkedin_present": True,
            "github_present": True,
            "portfolio_present": True,
            "achievements_quantified": True,
            "unique_action_verbs_count": 12
        }
    }
    strong_senior_text = (
        "Diana Architect | Email: diana@example.com\n"
        "Experience: Senior Lead Architect at Global Cloud Systems (8+ years experience, 2016-Present).\n"
        "Architected distributed cloud microservices processing over 10M requests daily using Java, Spring Boot, Kafka, Kubernetes, AWS, SQL, and Docker. Managed CI/CD, ORM, relational database, concurrency, and JUnit testing. Led engineering team of 12 developers.\n"
        "Education: M.S. in Computer Science.\n"
        "Skills: Java, Spring Boot, REST API, SQL, Docker, Git, Redis, Kafka, AWS, Kubernetes, Architecture, Microservices, CI/CD, ORM, JUnit.\n"
    )

    # --- EXECUTE TESTS ---
    score_A = calculate_ats_score(strong_fresher_parsed, strong_fresher_text, target_role, application_level="fresher")
    score_B = calculate_ats_score(weak_fresher_parsed, weak_fresher_text, target_role, application_level="fresher")
    score_C = calculate_ats_score(strong_mid_parsed, strong_mid_text, target_role, application_level="mid_level")
    score_D = calculate_ats_score(strong_senior_parsed, strong_senior_text, target_role, application_level="senior")
    score_E = calculate_ats_score(strong_fresher_parsed, strong_fresher_text, target_role, application_level="senior")

    print("\n[TEST A] Strong Fresher evaluated as Fresher:")
    print(f"  - Overall Score : {score_A['ats_score']}/100")
    print(f"  - Breakdown     : {score_A['score_breakdown']}")

    print("\n[TEST B] Weak Fresher evaluated as Fresher:")
    print(f"  - Overall Score : {score_B['ats_score']}/100")
    print(f"  - Breakdown     : {score_B['score_breakdown']}")

    print("\n[TEST C] Strong Mid-Level evaluated as Mid-Level:")
    print(f"  - Overall Score : {score_C['ats_score']}/100")
    print(f"  - Breakdown     : {score_C['score_breakdown']}")

    print("\n[TEST D] Strong Senior evaluated as Senior:")
    print(f"  - Overall Score : {score_D['ats_score']}/100")
    print(f"  - Breakdown     : {score_D['score_breakdown']}")

    print("\n[TEST E] Strong Fresher evaluated as Senior:")
    print(f"  - Overall Score : {score_E['ats_score']}/100")
    print(f"  - Breakdown     : {score_E['score_breakdown']}")

    # Validations
    assert score_A['ats_score'] >= 75, f"Expected Strong Fresher score >= 75, got {score_A['ats_score']}"
    assert score_B['ats_score'] < 50, f"Expected Weak Fresher score < 50, got {score_B['ats_score']}"
    assert score_C['ats_score'] >= 75, f"Expected Strong Mid-Level score >= 75, got {score_C['ats_score']}"
    assert score_D['ats_score'] >= 80, f"Expected Strong Senior score >= 80, got {score_D['ats_score']}"
    assert score_E['ats_score'] < score_A['ats_score'], f"Fresher as Senior should score lower than as Fresher!"
    print(f"  - Delta (Strong Fresher as Fresher vs as Senior): {score_A['ats_score']} vs {score_E['ats_score']}")

    print("\n" + "=" * 80)
    print("ALL APPLICATION LEVEL ATS SCORING SANITY TESTS PASSED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    run_sanity_tests()
