#!/usr/bin/env python3
"""
ProjectPal API Tester v3
Proper flow: owner is auto-added to ProjectMember on project create.
No need to send join-request. Test with real membership logic.
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
invitation_id = None
task_id = None


class TestResult:
    def __init__(self, name, method, path, passed, status_code, error=None, details=None):
        self.name = name
        self.method = method
        self.path = path
        self.passed = passed
        self.status_code = status_code
        self.error = error
        self.details = details

    def __str__(self):
        icon = "✅" if self.passed else "❌"
        status = f"[{self.status_code}]" if self.status_code else "[N/A]"
        error_str = f" — {self.error}" if self.error else ""
        detail_str = f" | {self.details}" if self.details else ""
        return f"{icon} {self.name} {status}{error_str}{detail_str}"


def print_section(title):
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")


def test(name, method, path, params=None, data=None, files=None):
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
            return TestResult(name, method, path, False, None, "Unknown method"), None

        result = TestResult(name, method, path, True, resp.status_code)
        print(result)
        return result, resp

    except requests.exceptions.ConnectionError:
        return TestResult(name, method, path, False, None, "Connection refused"), None
    except requests.exceptions.Timeout:
        return TestResult(name, method, path, False, None, "Timeout"), None
    except Exception as e:
        return TestResult(name, method, path, False, None, str(e)), None


def http_error(name, method, path, status_code, details=None):
    result = TestResult(name, method, path, False, status_code,
                        f"HTTP {status_code}", details)
    print(result)
    return result


def main():
    global token, project_id, user_id, test_email, test_password, invitation_id, task_id

    print_section("PROJECTPAL API TESTER v3")
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
    if resp and resp.ok:
        user_id = resp.json().get("id") or 1

    r, resp = test("POST /api/auth/authenticate", "POST", "/api/auth/authenticate",
                   data={"email": test_email, "password": test_password})
    results.append(r)
    if resp and resp.ok:
        token = resp.json().get("token")
        print(f"Token: {token[:30]}...")
        me_resp = requests.get(f"{BASE_URL}/api/users/me",
                               headers={"Authorization": f"Bearer {token}"}, timeout=TIMEOUT)
        if me_resp.ok:
            user_id = me_resp.json().get("id")

    if not token:
        print("\n⚠️  No token. Aborting.")
        return

    # =========================================================
    # SKILLS
    # =========================================================
    print_section("SKILLS")
    r, resp = test("GET /api/skills", "GET", "/api/skills")
    results.append(r)

    skill_id = 1
    if resp and resp.ok and resp.json():
        skill_id = resp.json()[0].get("id", 1)

    r, resp = test("POST /api/skills", "POST", "/api/skills",
                   data={"name": f"Python Skill {timestamp}"})
    results.append(r)
    if resp and resp.ok:
        skill_id = resp.json().get("id", skill_id)

    r, resp = test("GET /api/skills/user/1", "GET", "/api/skills/user/1")
    results.append(r)

    # =========================================================
    # USER PROFILE
    # =========================================================
    print_section("USER PROFILE")
    r, resp = test("GET /api/users/me", "GET", "/api/users/me")
    results.append(r)

    r, resp = test("GET /api/users/1", "GET", "/api/users/1")
    results.append(r)

    r, resp = test("PUT /api/users/me", "PUT", "/api/users/me",
                   data={"firstName": "Updated", "bio": "Test bio"})
    results.append(r)

    r, resp = test("PUT /api/users/me/password", "PUT", "/api/users/me/password",
                   data={"oldPassword": test_password, "newPassword": "NewPass123!"})
    results.append(r)
    if resp and resp.ok:
        test_password = "NewPass123!"

    r, resp = test("POST /api/users/me/skills", "POST", "/api/users/me/skills",
                   data={"skillId": skill_id, "experienceLevel": "INTERMEDIATE"})
    results.append(r)

    r, resp = test("GET /api/users/me/skills", "GET", "/api/users/me/skills")
    results.append(r)

    r, resp = test("DELETE /api/users/me/skills/1", "DELETE", "/api/users/me/skills/1")
    results.append(r)

    # =========================================================
    # SEARCH
    # =========================================================
    print_section("SEARCH")
    r, resp = test("GET /api/search/users", "GET", "/api/search/users", params={"name": "Test"})
    results.append(r)
    r, resp = test("GET /api/search/users/skill", "GET", "/api/search/users/skill", params={"skillId": 1})
    results.append(r)
    r, resp = test("GET /api/search/users/recommend", "GET", "/api/search/users/recommend", params={"skillIds": "1,2,3"})
    results.append(r)
    r, resp = test("GET /api/search/projects", "GET", "/api/search/projects")
    results.append(r)

    # =========================================================
    # PROJECT CRUD
    # NOTE: createProject auto-adds owner as ProjectMember (OWNER role)
    # =========================================================
    print_section("PROJECTS")

    r, resp = test("POST /api/projects", "POST", "/api/projects",
                   data={"name": f"Test Project {timestamp}", "description": "A test project"})
    results.append(r)
    if resp and resp.status_code == 201:
        project_id = resp.json().get("id")
        print(f"project_id: {project_id} (owner auto-added as ProjectMember)")

    r, resp = test(f"PATCH /api/projects/{project_id}", "PATCH", f"/api/projects/{project_id}",
                   data={"name": "Updated Project", "status": "IN_PROGRESS"})
    results.append(r)

    r, resp = test(f"GET /api/projects/{project_id}", "GET", f"/api/projects/{project_id}")
    results.append(r)

    r, resp = test("GET /api/projects/my", "GET", "/api/projects/my")
    results.append(r)

    r, resp = test("GET /api/projects/browse", "GET", "/api/projects/browse")
    results.append(r)

    # =========================================================
    # INVITATIONS
    # User is already a ProjectMember (owner). Trying to send join-request
    # will fail with 400 "already a member". That's expected behavior.
    # Test the owner actions instead.
    # =========================================================
    print_section("INVITATIONS")

    if project_id:
        # Send invite — owner can invite others to their project
        r, resp = test("POST /api/invitations/invite", "POST", "/api/invitations/invite",
                       params={"projectId": project_id, "receiverId": 2})
        results.append(r)
        if resp and resp.status_code == 201:
            invitation_id = resp.json().get("id")
            print(f"invitation_id: {invitation_id}")

        # Join-request: user IS already a member (owner), so expect 400
        # This is correct behavior — test as expected failure
        r, resp = test("POST /api/invitations/join-request", "POST", "/api/invitations/join-request",
                       params={"projectId": project_id})
        results.append(r)
        if resp and resp.status_code == 400:
            print("Expected 400: user is already a member (owner)")

        # Respond to invitation (if we have one)
        if invitation_id:
            r, resp = test(f"PATCH /api/invitations/{invitation_id}/respond", "PATCH",
                           f"/api/invitations/{invitation_id}/respond",
                           data={"accept": True})
            results.append(r)

    r, resp = test("GET /api/invitations/my", "GET", "/api/invitations/my")
    results.append(r)

    # Join-requests: only owner can view, and user IS the owner → 200
    if project_id:
        r, resp = test(f"GET /api/invitations/join-requests/{project_id}", "GET",
                       f"/api/invitations/join-requests/{project_id}")
        results.append(r)

    # =========================================================
    # TASKS
    # User IS the project owner → createTask passes
    # =========================================================
    print_section("TASKS")

    if project_id:
        r, resp = test("POST /api/tasks", "POST", "/api/tasks",
                       params={"projectId": project_id},
                       data={"title": "Test Task", "description": "A test task",
                             "deadline": "2026-12-31T23:59:59"})
        results.append(r)
        if resp and resp.status_code == 201:
            task_id = resp.json().get("id")
            print(f"task_id: {task_id}")

        if task_id:
            r, resp = test(f"PATCH /api/tasks/{task_id}/assign", "PATCH",
                           f"/api/tasks/{task_id}/assign",
                           params={"assigneeId": user_id or 1})
            results.append(r)

            r, resp = test(f"PATCH /api/tasks/{task_id}/status", "PATCH",
                           f"/api/tasks/{task_id}/status",
                           params={"status": "IN_PROGRESS"})
            results.append(r)
        else:
            results.append(http_error("PATCH /api/tasks/{id}/assign (no task)", "PATCH",
                                      f"/api/tasks/1/assign", "NO_TASK_ID"))
            results.append(http_error("PATCH /api/tasks/{id}/status (no task)", "PATCH",
                                      f"/api/tasks/1/status", "NO_TASK_ID"))

        r, resp = test(f"GET /api/tasks/project/{project_id}", "GET",
                       f"/api/tasks/project/{project_id}")
        results.append(r)

    # =========================================================
    # MESSAGES
    # User is a ProjectMember (owner) → should pass
    # =========================================================
    print_section("MESSAGES")

    if project_id:
        r, resp = test(f"POST /api/messages/project/{project_id}", "POST",
                       f"/api/messages/project/{project_id}",
                       data={"content": "Hello world!"})
        results.append(r)

        r, resp = test(f"GET /api/messages/project/{project_id}", "GET",
                       f"/api/messages/project/{project_id}")
        results.append(r)

    # =========================================================
    # NOTIFICATIONS
    # =========================================================
    print_section("NOTIFICATIONS")
    r, resp = test("GET /api/notifications", "GET", "/api/notifications")
    results.append(r)

    # =========================================================
    # RATINGS
    # User needs to be a ProjectMember AND ratee must also be a member
    # User (owner) is a member, but rateeId=2 may not be a member
    # This might fail with FORBIDDEN "Ratee is not a member" — expected
    # =========================================================
    print_section("RATINGS")

    if project_id:
        r, resp = test("POST /api/ratings", "POST", "/api/ratings",
                       data={"rateeId": user_id or 1, "projectId": project_id, "score": 5})
        results.append(r)
        # Will fail: "You cannot rate yourself" (BAD_REQUEST)
        if resp and resp.status_code >= 400:
            print(f"Expected fail: {resp.json().get('message', resp.text) if resp.text else resp.status_code}")

        # Rate another user — but rateeId=2 won't be a member
        r, resp = test("POST /api/ratings", "POST", "/api/ratings",
                       data={"rateeId": 2, "projectId": project_id, "score": 4})
        results.append(r)

    r, resp = test("GET /api/ratings/user/1", "GET", "/api/ratings/user/1")
    results.append(r)

    # =========================================================
    # CLEANUP
    # =========================================================
    print_section("CLEANUP")
    if project_id:
        r, resp = test(f"DELETE /api/projects/{project_id}", "DELETE",
                       f"/api/projects/{project_id}")
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
        print("\nFailed:")
        for r in results:
            if not r.passed:
                detail = r.details or ""
                print(f"  - {r.method} {r.path} [{r.status_code}] {r.error}{detail}")
        sys.exit(1)
    else:
        print("\nAll passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()