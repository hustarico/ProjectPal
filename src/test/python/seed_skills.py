#!/usr/bin/env python3
"""
Skills are auto-seeded on backend startup (SkillSeeder.java).
This script is only needed if you want to re-seed or run
against an already-running backend that missed the startup seeder.

Usage:
  python seed_skills.py                       # uses default admin credentials
  python seed_skills.py --email a@b.com --password x
  ADMIN_EMAIL=a@b.com ADMIN_PASSWORD=x python seed_skills.py
"""

import requests
import sys
import os

BASE_URL = "http://localhost:8080"
TIMEOUT = 15

SKILLS = sorted([
    "C", "C#", "C++", "CSS", "Dart", "Go", "HTML", "Java", "JavaScript",
    "Kotlin", "Lua", "Objective-C", "Perl", "PHP", "Python", "R", "Ruby",
    "Rust", "Scala", "SQL", "Swift", "TypeScript", "Zig",
    "Angular", "Astro", "Bootstrap", "Bulma", "Chakra UI", "D3.js",
    "Electron", "Ember.js", "Flutter", "jQuery", "MUI (Material UI)",
    "Next.js", "Nuxt.js", "React Native", "React", "Redux", "Svelte",
    "Tailwind CSS", "Three.js", "Vue.js",
    "Actix", "ASP.NET Core", "Django", "Express.js", "FastAPI", "Flask",
    "Gin", "Laravel", "NestJS", "Node.js", "Rails", "Spring Boot",
    "Cassandra", "ClickHouse", "CockroachDB", "Couchbase", "DynamoDB",
    "Elasticsearch", "Firebase Firestore", "MariaDB", "MongoDB", "MySQL",
    "Neo4j", "Oracle DB", "PostgreSQL", "Redis", "SQLite", "Supabase",
    "Ansible", "AWS", "Azure", "Docker", "GCP (Google Cloud)",
    "GitHub Actions", "GitLab CI", "Helm", "Jenkins", "Kubernetes",
    "Nginx", "Prometheus", "Terraform",
    "CMake", "Conda", "Cypress", "ESLint", "Git", "Gradle", "GraphQL",
    "gRPC", "Jest", "Kafka", "Linux", "Make", "Maven", "Playwright",
    "Postman", "Prettier", "Puppeteer", "RabbitMQ", "Selenium",
    "Swagger / OpenAPI", "Unity", "Unreal Engine", "Vim", "Vitest",
    "Webpack", "Yarn",
    "Jupyter", "LangChain", "LlamaIndex", "Matplotlib", "MLflow",
    "NumPy", "pandas", "PyTorch", "scikit-learn", "TensorFlow",
])


def main():
    email = (
        sys.argv[sys.argv.index("--email") + 1] if "--email" in sys.argv
        else os.environ.get("ADMIN_EMAIL", "admin@projectpal.com")
    )
    password = (
        sys.argv[sys.argv.index("--password") + 1] if "--password" in sys.argv
        else os.environ.get("ADMIN_PASSWORD", "admin123")
    )

    print("ProjectPal — Skill Seeder")
    print("  (Skills auto-seed on backend startup. This is a fallback.)")
    print()

    r = requests.post(
        f"{BASE_URL}/api/auth/authenticate",
        json={"email": email, "password": password},
        timeout=TIMEOUT,
    )
    if not r.ok:
        print(f"  Login failed ({r.status_code}).")
        print("  Either start the backend fresh (skills auto-seed),")
        print("  or provide admin credentials via --email / --password")
        print("  or ADMIN_EMAIL / ADMIN_PASSWORD env vars.")
        sys.exit(1)

    token = r.json()["token"]
    existing = {
        s["name"]
        for s in requests.get(
            f"{BASE_URL}/api/skills",
            headers={"Authorization": f"Bearer {token}"},
            timeout=TIMEOUT,
        ).json()
    }

    created = 0
    skipped = 0
    for name in SKILLS:
        if name in existing:
            skipped += 1
            continue
        r = requests.post(
            f"{BASE_URL}/api/skills",
            json={"name": name},
            headers={"Content-Type": "application/json",
                     "Authorization": f"Bearer {token}"},
            timeout=TIMEOUT,
        )
        if r.status_code == 201:
            created += 1
            print(f"  + {name}")
        elif r.status_code == 400:
            skipped += 1
        else:
            print(f"  x {name} — {r.status_code}: {r.text[:80]}")

    print(f"\n  Created: {created}  Skipped: {skipped}")


if __name__ == "__main__":
    main()
