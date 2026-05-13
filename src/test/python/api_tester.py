#!/usr/bin/env python3
"""
ProjectPal API Tester
Tests all endpoints and reports pass/fail status.
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "http://localhost:8080"
TIMEOUT = 10

class TestResult:
    def __init__(self, name, method, path, passed, status_code, error=None):
        self.name = name
        self.method = method
        self.path = path
        self.passed = passed
        self.status_code = status_code
        self.error = error

    def __str__(self):
        icon = "✅" if self.passed else "❌"
        status = f"[{self.status_code}]" if self.status_code else "[N/A]"
        error_str = f" — {self.error}" if self.error else ""
        return f"{icon} {self.name} {status}{error_str}"

def print_section(title):
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def test_endpoint(name, method, path, token=None, params=None, data=None, files=None, expected_fail=False):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        if method == "GET":
            resp = requests.get(url, headers=headers, params=params, timeout=TIMEOUT)
        elif method == "POST":
            resp = requests.post(url, headers=headers, params=params, json=data, files=files, timeout=TIMEOUT)
        elif method == "PUT":
            resp = requests.put(url, headers=headers, params=params, json=data, timeout=TIMEOUT)
        elif method == "PATCH":
            resp = requests.patch(url, headers=headers, params=params, json=data, timeout=TIMEOUT)
        elif method == "DELETE":
            resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
        else:
            return TestResult(name, method, path, False, None, "Unknown method")

        passed = (resp.status_code < 400) != expected_fail
        return TestResult(name, method, path, passed, resp.status_code)

    except requests.exceptions.ConnectionError:
        return TestResult(name, method, path, False, None, "Connection refused — is server running?")
    except requests.exceptions.Timeout:
        return TestResult(name, method, path, False, None, "Timeout")
    except Exception as e:
        return TestResult(name, method, path, False, None, str(e))

def main():
    print_section("PROJECTPAL API TESTER")
    print(f"Base URL: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    results = []

    # =========================================================
    # SETUP — Register and login to get token
    # =========================================================
    print_section("AUTH SETUP")

    timestamp = int(datetime.now().timestamp())
    register_data = {
        "firstName": "Test",
        "lastName": "User",
        "email": f"test{timestamp}@test.com",
        "password": "Password123!"
    }
    print(f"Registering: {register_data['email']}")
    result = test_endpoint("POST /api/auth/register", "POST", "/api/auth/register", data=register_data)
    results.append(result)
    print(result)

    login_data = {"email": register_data["email"], "password": register_data["password"]}
    result = test_endpoint("POST /api/auth/authenticate", "POST", "/api/auth/authenticate", data=login_data)
    results.append(result)
    print(result)

    token = None
    if result.passed:
        try:
            resp = requests.post(f"{BASE_URL}/api/auth/authenticate", json=login_data, timeout=TIMEOUT)
            token = resp.json().get("token")
            print(f"Token obtained: {token[:30]}...")
        except:
            pass

    if not token:
        print("\n⚠️  Could not get auth token. Skipping protected endpoints.")
        print_summary(results)
        return

    # =========================================================
    # AUTH
    # =========================================================
    print_section("AUTH")
    results.append(test_endpoint("GET /api/test/unprotected", "GET", "/api/test/unprotected"))
    results.append(test_endpoint("GET /api/test/protected", "GET", "/api/test/protected", token=token))

    # =========================================================
    # SKILLS (public — test first to use in later steps)
    # =========================================================
    print_section("SKILLS")
    result = test_endpoint("GET /api/skills", "GET", "/api/skills")
    results.append(result)
    print(result)

    skill_id = None
    if result.passed and result.status_code == 200:
        try:
            skills = result.status_code  # we don't have resp here, re-fetch
            resp = requests.get(f"{BASE_URL}/api/skills", timeout=TIMEOUT)
            skills_list = resp.json()
            if skills_list:
                skill_id = skills_list[0].get("id")
                print(f"Using skill_id: {skill_id}")
        except:
            pass

    results.append(test_endpoint("POST /api/skills", "POST", "/api/skills", token=token,
                                  data={"name": f"Python Skill {timestamp}"}))
    results.append(test_endpoint("GET /api/skills/user/{userId}", "GET", "/api/skills/user/1"))

    # =========================================================
    # USER PROFILE
    # =========================================================
    print_section("USER PROFILE")
    results.append(test_endpoint("GET /api/users/me", "GET", "/api/users/me", token=token))
    results.append(test_endpoint("GET /api/users/{id}", "GET", "/api/users/1"))
    results.append(test_endpoint("PUT /api/users/me", "PUT", "/api/users/me", token=token,
                                  data={"firstName": "Updated", "bio": "Test bio"}))
    results.append(test_endpoint("PUT /api/users/me/password", "PUT", "/api/users/me/password", token=token,
                                  data={"oldPassword": "Password123!", "newPassword": "NewPass123!"}))
    results.append(test_endpoint("POST /api/users/me/skills", "POST", "/api/users/me/skills", token=token,
                                  data={"skillId": 1, "experienceLevel": "INTERMEDIATE"}))
    results.append(test_endpoint("GET /api/users/me/skills", "GET", "/api/users/me/skills", token=token))
    results.append(test_endpoint("DELETE /api/users/me/skills/{skillId}", "DELETE", "/api/users/me/skills/1", token=token))

    # =========================================================
    # SEARCH (public)
    # =========================================================
    print_section("SEARCH")
    results.append(test_endpoint("GET /api/search/users", "GET", "/api/search/users",
                                  params={"name": "Test"}))
    results.append(test_endpoint("GET /api/search/users/skill", "GET", "/api/search/users/skill",
                                  params={"skillId": 1}))
    results.append(test_endpoint("GET /api/search/users/recommend", "GET", "/api/search/users/recommend",
                                  params={"skillIds": "1,2,3"}))
    results.append(test_endpoint("GET /api/search/projects", "GET", "/api/search/projects"))

    # =========================================================
    # PROJECT CRUD
    # =========================================================
    print_section("PROJECTS")
    project_id = None

    result = test_endpoint("POST /api/projects", "POST", "/api/projects", token=token,
                           data={"name": f"Test Project {timestamp}", "description": "A test project"})
    results.append(result)
    print(result)

    if result.passed and result.status_code == 201:
        try:
            resp = requests.post(f"{BASE_URL}/api/projects",
                                 headers={"Authorization": f"Bearer {token}",
                                          "Content-Type": "application/json"},
                                 json={"name": f"Test Project {timestamp}", "description": "A test project"},
                                 timeout=TIMEOUT)
            project_id = resp.json().get("id")
            print(f"Created project_id: {project_id}")
        except:
            pass

    results.append(test_endpoint("PATCH /api/projects/{id}", "PATCH", f"/api/projects/{project_id or 1}", token=token,
                                  data={"name": "Updated Project", "status": "IN_PROGRESS"}))
    results.append(test_endpoint("GET /api/projects/{id}", "GET", f"/api/projects/{project_id or 1}", token=token))
    results.append(test_endpoint("GET /api/projects/my", "GET", "/api/projects/my", token=token))
    results.append(test_endpoint("GET /api/projects/browse", "GET", "/api/projects/browse", token=token))
    results.append(test_endpoint("DELETE /api/projects/{id}", "DELETE", f"/api/projects/{project_id or 1}", token=token))

    # =========================================================
    # INVITATIONS
    # =========================================================
    print_section("INVITATIONS")
    results.append(test_endpoint("POST /api/invitations/invite", "POST", "/api/invitations/invite", token=token,
                                  params={"projectId": project_id or 1, "receiverId": 2}))
    results.append(test_endpoint("POST /api/invitations/join-request", "POST", "/api/invitations/join-request", token=token,
                                  params={"projectId": project_id or 1}))
    results.append(test_endpoint("PATCH /api/invitations/{id}/respond", "PATCH", "/api/invitations/1/respond", token=token,
                                  data={"accept": True}))
    results.append(test_endpoint("GET /api/invitations/my", "GET", "/api/invitations/my", token=token))
    results.append(test_endpoint("GET /api/invitations/join-requests/{projectId}", "GET",
                                  f"/api/invitations/join-requests/{project_id or 1}", token=token))

    # =========================================================
    # TASKS
    # =========================================================
    print_section("TASKS")
    results.append(test_endpoint("POST /api/tasks", "POST", "/api/tasks", token=token,
                                  params={"projectId": project_id or 1},
                                  data={"title": "Test Task", "description": "A test task",
                                        "deadline": "2025-12-31T23:59:59", "projectId": project_id or 1}))
    results.append(test_endpoint("PATCH /api/tasks/{id}/assign", "PATCH", "/api/tasks/1/assign", token=token,
                                  params={"assigneeId": 1}))
    results.append(test_endpoint("PATCH /api/tasks/{id}/status", "PATCH", "/api/tasks/1/status", token=token,
                                  params={"status": "IN_PROGRESS"}))
    results.append(test_endpoint("GET /api/tasks/project/{projectId}", "GET",
                                  f"/api/tasks/project/{project_id or 1}", token=token))

    # =========================================================
    # MESSAGES
    # =========================================================
    print_section("MESSAGES")
    results.append(test_endpoint("POST /api/messages/project/{projectId}", "POST",
                                  f"/api/messages/project/{project_id or 1}", token=token,
                                  data={"content": "Hello world!", "projectId": project_id or 1}))
    results.append(test_endpoint("GET /api/messages/project/{projectId}", "GET",
                                  f"/api/messages/project/{project_id or 1}", token=token))

    # =========================================================
    # NOTIFICATIONS
    # =========================================================
    print_section("NOTIFICATIONS")
    results.append(test_endpoint("GET /api/notifications", "GET", "/api/notifications", token=token))

    # =========================================================
    # RATINGS
    # =========================================================
    print_section("RATINGS")
    results.append(test_endpoint("POST /api/ratings", "POST", "/api/ratings", token=token,
                                  data={"rateeId": 2, "projectId": project_id or 1, "score": 5}))
    results.append(test_endpoint("GET /api/ratings/user/{userId}", "GET", "/api/ratings/user/1"))

    # =========================================================
    # SUMMARY
    # =========================================================
    print_section("RESULTS")
    for r in results:
        print(r)

    passed = sum(1 for r in results if r.passed)
    failed = sum(1 for r in results if not r.passed)
    total = len(results)

    print(f"\nPassed: {passed}/{total}  Failed: {failed}/{total}")

    if failed > 0:
        print("\nFailed endpoints:")
        for r in results:
            if not r.passed:
                print(f"  - {r.method} {r.path} — {r.error or f'HTTP {r.status_code}'}")
        sys.exit(1)
    else:
        print("\nAll endpoints passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()