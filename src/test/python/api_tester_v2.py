#!/usr/bin/env python3
"""
ProjectPal API Tester v2
Tests all endpoints with proper auth/membership flow.
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "http://localhost:8080"
TIMEOUT = 10

token = None
project_id = None
user_id = None
test_email = None
test_password = "Password123!"


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


def test(name, method, path, params=None, data=None, files=None, expect_fail=False):
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

        passed = (resp.status_code < 400) != expect_fail
        result = TestResult(name, method, path, passed, resp.status_code)
        print(result)
        return result, resp

    except requests.exceptions.ConnectionError:
        return TestResult(name, method, path, False, None, "Connection refused"), None
    except requests.exceptions.Timeout:
        return TestResult(name, method, path, False, None, "Timeout"), None
    except Exception as e:
        return TestResult(name, method, path, False, None, str(e)), None


def main():
    global token, project_id, user_id, test_email

    print_section("PROJECTPAL API TESTER v2")
    print(f"Base URL: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    results = []

    # =========================================================
    # SETUP — Register and login
    # =========================================================
    print_section("AUTH SETUP")

    timestamp = int(datetime.now().timestamp())
    test_email = f"test{timestamp}@test.com"
    register_data = {
        "firstName": "Test",
        "lastName": "User",
        "email": test_email,
        "password": test_password
    }
    print(f"Registering: {test_email}")

    r, resp = test("POST /api/auth/register", "POST", "/api/auth/register", data=register_data)
    results.append(r)
    if resp and resp.status_code < 400:
        user_id = resp.json().get("id") or 1

    r, resp = test("POST /api/auth/authenticate", "POST", "/api/auth/authenticate",
                   data={"email": test_email, "password": test_password})
    results.append(r)
    if resp and resp.status_code < 400:
        token = resp.json().get("token")
        print(f"Token obtained: {token[:30]}...")
        # Get user id from /me
        me_resp = requests.get(f"{BASE_URL}/api/users/me",
                               headers={"Authorization": f"Bearer {token}"}, timeout=TIMEOUT)
        if me_resp.ok:
            user_id = me_resp.json().get("id")

    if not token:
        print("\n⚠️  Could not get auth token. Aborting.")
        return

    # =========================================================
    # SKILLS
    # =========================================================
    print_section("SKILLS")

    r, resp = test("GET /api/skills", "GET", "/api/skills")
    results.append(r)

    skill_id = 1
    if resp and resp.ok:
        skills = resp.json()
        if skills:
            skill_id = skills[0].get("id")

    r, resp = test("POST /api/skills", "POST", "/api/skills",
                   data={"name": f"Python Skill {timestamp}"})
    results.append(r)

    r, resp = test("GET /api/skills/user/1", "GET", "/api/skills/user/1")
    results.append(r)

    # =========================================================
    # USER PROFILE
    # =========================================================
    print_section("USER PROFILE")

    r, resp = test("GET /api/users/me", "GET", "/api/users/me", token=token)
    results.append(r)

    r, resp = test("GET /api/users/1", "GET", "/api/users/1")
    results.append(r)

    r, resp = test("PUT /api/users/me", "PUT", "/api/users/me", token=token,
                   data={"firstName": "Updated", "bio": "Test bio"})
    results.append(r)

    r, resp = test("PUT /api/users/me/password", "PUT", "/api/users/me/password", token=token,
                   data={"oldPassword": test_password, "newPassword": "NewPass123!"})
    results.append(r)
    if resp and resp.status_code < 400:
        test_password = "NewPass123!"  # update for next use

    r, resp = test("POST /api/users/me/skills", "POST", "/api/users/me/skills", token=token,
                   data={"skillId": skill_id, "experienceLevel": "INTERMEDIATE"})
    results.append(r)

    r, resp = test("GET /api/users/me/skills", "GET", "/api/users/me/skills", token=token)
    results.append(r)

    r, resp = test("DELETE /api/users/me/skills/1", "DELETE", "/api/users/me/skills/1", token=token)
    results.append(r)

    # =========================================================
    # SEARCH
    # =========================================================
    print_section("SEARCH")

    r, resp = test("GET /api/search/users", "GET", "/api/search/users", params={"name": "Test"})
    results.append(r)

    r, resp = test("GET /api/search/users/skill", "GET", "/api/search/users/skill",
                   params={"skillId": 1})
    results.append(r)

    r, resp = test("GET /api/search/users/recommend", "GET", "/api/search/users/recommend",
                   params={"skillIds": "1,2,3"})
    results.append(r)

    r, resp = test("GET /api/search/projects", "GET", "/api/search/projects")
    results.append(r)

    # =========================================================
    # PROJECT CRUD
    # =========================================================
    print_section("PROJECTS")

    r, resp = test("POST /api/projects", "POST", "/api/projects", token=token,
                   data={"name": f"Test Project {timestamp}", "description": "A test project"})
    results.append(r)
    if resp and resp.status_code == 201:
        project_id = resp.json().get("id")
        print(f"Created project_id: {project_id}")

    r, resp = test("PATCH /api/projects/{}".format(project_id or 1), "PATCH",
                   f"/api/projects/{project_id or 1}", token=token,
                   data={"name": "Updated Project", "status": "IN_PROGRESS"})
    results.append(r)

    r, resp = test("GET /api/projects/{}".format(project_id or 1), "GET",
                   f"/api/projects/{project_id or 1}", token=token)
    results.append(r)

    r, resp = test("GET /api/projects/my", "GET", "/api/projects/my", token=token)
    results.append(r)

    r, resp = test("GET /api/projects/browse", "GET", "/api/projects/browse", token=token)
    results.append(r)

    # =========================================================
    # INVITATION FLOW — add test user as member
    # This is CRITICAL: project owner creates project but is NOT
    # in the ProjectMember table. Need to add self via join request.
    # =========================================================
    print_section("INVITATIONS (membership flow)")

    if project_id:
        # User sends join request to their own project
        r, resp = test("POST /api/invitations/join-request", "POST",
                       "/api/invitations/join-request", token=token,
                       params={"projectId": project_id})
        results.append(r)

        # For owner-only actions, they need to be added as a ProjectMember
        # Since the test user is the owner, we'll add themselves as member
        # First, get the join request invitation id
        invitation_id = None
        if resp and resp.status_code == 201:
            invitation_id = resp.json().get("id")
            print(f"Join request created, invitation_id: {invitation_id}")

        # Accept the join request (owner accepts their own request)
        if invitation_id:
            r, resp = test("PATCH /api/invitations/{}/respond".format(invitation_id), "PATCH",
                           f"/api/invitations/{invitation_id}/respond", token=token,
                           data={"accept": True})
            results.append(r)
            print("Join request accepted — user is now a ProjectMember")

    # Now test owner-only invitation actions
    if project_id:
        r, resp = test("POST /api/invitations/invite", "POST", "/api/invitations/invite",
                       token=token, params={"projectId": project_id, "receiverId": 2})
        results.append(r)

    r, resp = test("GET /api/invitations/my", "GET", "/api/invitations/my", token=token)
    results.append(r)

    if project_id:
        r, resp = test("GET /api/invitations/join-requests/{}".format(project_id), "GET",
                       f"/api/invitations/join-requests/{project_id}", token=token)
        results.append(r)

    # =========================================================
    # TASKS (user is now a ProjectMember)
    # =========================================================
    print_section("TASKS")

    if project_id:
        r, resp = test("POST /api/tasks", "POST", "/api/tasks", token=token,
                       params={"projectId": project_id},
                       data={"title": "Test Task", "description": "A test task",
                             "deadline": "2026-12-31T23:59:59", "projectId": project_id})
        results.append(r)

        task_id = None
        if resp and resp.status_code == 201:
            task_id = resp.json().get("id")
            print(f"Created task_id: {task_id}")

        r, resp = test("PATCH /api/tasks/{}/assign".format(task_id or 1), "PATCH",
                       f"/api/tasks/{task_id or 1}/assign", token=token,
                       params={"assigneeId": user_id or 1})
        results.append(r)

        r, resp = test("PATCH /api/tasks/{}/status".format(task_id or 1), "PATCH",
                       f"/api/tasks/{task_id or 1}/status", token=token,
                       params={"status": "IN_PROGRESS"})
        results.append(r)

        r, resp = test("GET /api/tasks/project/{}".format(project_id), "GET",
                       f"/api/tasks/project/{project_id}", token=token)
        results.append(r)

    # =========================================================
    # MESSAGES (user is now a ProjectMember)
    # =========================================================
    print_section("MESSAGES")

    if project_id:
        r, resp = test("POST /api/messages/project/{}".format(project_id), "POST",
                       f"/api/messages/project/{project_id}", token=token,
                       data={"content": "Hello world!", "projectId": project_id})
        results.append(r)

        r, resp = test("GET /api/messages/project/{}".format(project_id), "GET",
                       f"/api/messages/project/{project_id}", token=token)
        results.append(r)

    # =========================================================
    # NOTIFICATIONS
    # =========================================================
    print_section("NOTIFICATIONS")

    r, resp = test("GET /api/notifications", "GET", "/api/notifications", token=token)
    results.append(r)

    # =========================================================
    # RATINGS
    # =========================================================
    print_section("RATINGS")

    if project_id:
        r, resp = test("POST /api/ratings", "POST", "/api/ratings", token=token,
                       data={"rateeId": 2, "projectId": project_id, "score": 5})
        results.append(r)

    r, resp = test("GET /api/ratings/user/1", "GET", "/api/ratings/user/1")
    results.append(r)

    # =========================================================
    # CLEANUP — delete project
    # =========================================================
    print_section("CLEANUP")

    if project_id:
        r, resp = test("DELETE /api/projects/{}".format(project_id), "DELETE",
                       f"/api/projects/{project_id}", token=token)
        results.append(r)

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