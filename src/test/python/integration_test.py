"""
ProjectPal API Integration Test Script
Run with: python integration_test.py

Expected response body field names (used throughout this script):
  - token / accessToken  (register & login responses)
  - id                   (user, project, invitation responses)
  - firstName            (register request/response)
  - lastName             (register request/response)
  - email                (register/login request/response)
  - password             (register/login request)
  - name                 (project create request/response)
  - description          (project create request)
  - projectId            (invitation request)
  - receiverId           (invitation request)
  - accept               (invitation respond request)

If your API uses different field names, update the KEY references marked with
"# KEY:" comments below.

Dependencies: requests (pip install requests), standard library only.
No pytest, no unittest.
"""

import sys
import io
import json
import random

import requests

# =============================================================================
# CONFIGURATION — change these to match your environment
# =============================================================================
BASE_URL = "http://localhost:8080"
OWNER_EMAIL = "testowner@example.com"
INVITEE_EMAIL = "testinvitee@example.com"
PASSWORD = "Test1234!"


# =============================================================================
# Helpers
# =============================================================================

def abort(msg):
    """Print a final summary and exit."""
    print(f"\n[ABORT] {msg}")
    sys.exit(1)


def try_extract_token(body, label="response"):
    """Probe both common JWT field names and return the value."""
    # KEY: update these keys if your API uses a different field name
    for key in ("token", "accessToken"):
        value = body.get(key)
        if value:
            print(f"  [TOKEN] Found token in field '{key}'")
            return value
    print(f"  [WARN] No token found in {label}. Keys present: {list(body.keys())}")
    return None


def try_extract_id(body, label="response"):
    """Extract the 'id' field from a JSON body."""
    # KEY: update if your API uses a different field name for IDs
    value = body.get("id")
    if value is not None:
        return value
    print(f"  [WARN] No 'id' field in {label}. Keys: {list(body.keys())}")
    return None


def print_result(name, status, body, passed, reason):
    verdict = "PASS" if passed else "FAIL"
    print(f"  >> {verdict}  |  {reason}")
    return {"name": name, "status": status, "body": body, "passed": passed, "reason": reason}


def fmt_body(body):
    try:
        return json.dumps(body, indent=2)
    except Exception:
        return str(body)


# =============================================================================
# Test accumulator
# =============================================================================
results = []


def do_request(method, url, label, **kwargs):
    """Perform a request, print details, return (response, body_dict)."""
    print(f"\n--- {label} ---")
    print(f"  {method.upper()} {url}")
    try:
        resp = requests.request(method, url, **kwargs)
    except requests.exceptions.ConnectionError:
        print("  [FATAL] Cannot connect to server — is it running?")
        abort("Server not reachable")
    body = {}
    try:
        body = resp.json()
    except Exception:
        body = {"_raw_text": resp.text}
    print(f"  Status: {resp.status_code}")
    print(f"  Body:\n{fmt_body(body)}")
    return resp, body


# =============================================================================
# TEST 1 — Register Owner
# =============================================================================

# --- Variables for Register ---
REGISTER_OWNER_URL = f"{BASE_URL}/api/auth/register"
REGISTER_OWNER_PAYLOAD = {
    "firstName": "Test",
    "lastName": "Owner",
    "email": OWNER_EMAIL,
    "password": PASSWORD,
}
# --- End Variables ---

owner_token = None
resp, body = do_request("POST", REGISTER_OWNER_URL, "1. Register Owner", json=REGISTER_OWNER_PAYLOAD)

if resp.status_code == 409:
    print("  [SKIP] User already exists (HTTP 409). Proceeding to login.")
    results.append(print_result("1. Register Owner", resp.status_code, body, True,
                                "User already existed, skipped (allowed)"))
elif resp.status_code in (200, 201):
    owner_token = try_extract_token(body, "register response")
    results.append(print_result("1. Register Owner", resp.status_code, body, True,
                                "Registered successfully"))
else:
    results.append(print_result("1. Register Owner", resp.status_code, body, False,
                                f"Unexpected status {resp.status_code}"))
    # Non-fatal — maybe login still works
    owner_token = try_extract_token(body, "register response")


# =============================================================================
# TEST 2 — Login Owner
# =============================================================================

# --- Variables for Login ---
LOGIN_URL = f"{BASE_URL}/api/auth/authenticate"
LOGIN_PAYLOAD = {
    "email": OWNER_EMAIL,
    "password": PASSWORD,
}
# --- End Variables ---

resp, body = do_request("POST", LOGIN_URL, "2. Login Owner", json=LOGIN_PAYLOAD)

if resp.status_code == 200:
    owner_token = try_extract_token(body, "login response")
    if owner_token:
        results.append(print_result("2. Login Owner", resp.status_code, body, True,
                                    "Login successful, token extracted"))
    else:
        results.append(print_result("2. Login Owner", resp.status_code, body, False,
                                    "No token in response"))
        abort("Could not obtain JWT token from login — remaining tests depend on it")
else:
    results.append(print_result("2. Login Owner", resp.status_code, body, False,
                                f"Login failed with status {resp.status_code}"))
    abort("Login failed — cannot continue without a JWT token")


# =============================================================================
# TEST 3 — Logout
# =============================================================================

# --- Variables for Logout ---
LOGOUT_URL = f"{BASE_URL}/api/auth/logout"
LOGOUT_HEADERS = {
    "Authorization": f"Bearer {owner_token}",
}
# --- End Variables ---

resp, body = do_request("POST", LOGOUT_URL, "3. Logout",
                        headers=LOGOUT_HEADERS)

if resp.status_code == 200:
    results.append(print_result("3. Logout", resp.status_code, body, True,
                                "Logged out successfully"))
    # Token was invalidated by logout — re-login to get a fresh one
    # for subsequent endpoints that need authorization.
    LOGIN_URL = f"{BASE_URL}/api/auth/authenticate"  # already defined above
    LOGIN_PAYLOAD = {"email": OWNER_EMAIL, "password": PASSWORD}
    resp2, body2 = do_request("POST", LOGIN_URL, "3b. Re-login Owner (post-logout)",
                              json=LOGIN_PAYLOAD)
    if resp2.status_code == 200:
        owner_token = try_extract_token(body2, "re-login response")
        if not owner_token:
            abort("Re-login returned 200 but no token — cannot continue")
    else:
        abort(f"Re-login failed with status {resp2.status_code} — cannot continue")
else:
    results.append(print_result("3. Logout", resp.status_code, body, False,
                                f"Expected 200, got {resp.status_code}"))


# =============================================================================
# TEST 4 — Upload Profile Picture
# =============================================================================

# --- Variables for Upload Profile Picture ---
UPLOAD_PFP_URL = f"{BASE_URL}/api/users/me/profile-picture"
UPLOAD_PFP_HEADERS = {
    "Authorization": f"Bearer {owner_token}",
}
# Generate a tiny fake JPEG file in-memory.
FAKE_JPEG_BYTES = bytes(random.randint(0, 255) for _ in range(256))
UPLOAD_PFP_FILE = io.BytesIO(FAKE_JPEG_BYTES)
UPLOAD_PFP_FILES = {
    "file": ("profile.jpg", UPLOAD_PFP_FILE, "image/jpeg"),
}
# --- End Variables ---

resp, body = do_request("POST", UPLOAD_PFP_URL, "4. Upload Profile Picture",
                        headers=UPLOAD_PFP_HEADERS, files=UPLOAD_PFP_FILES)

if resp.status_code in (200, 201):
    results.append(print_result("4. Upload PFP", resp.status_code, body, True,
                                "Profile picture uploaded"))
else:
    results.append(print_result("4. Upload PFP", resp.status_code, body, False,
                                f"Expected 200 or 201, got {resp.status_code}"))


# =============================================================================
# TEST 5 — Send Project Invitation (requires invitee user + project + IDs)
# =============================================================================

# ---- 5a. Register Invitee ----
# --- Variables for Register Invitee ---
REGISTER_INVITEE_URL = f"{BASE_URL}/api/auth/register"
REGISTER_INVITEE_PAYLOAD = {
    "firstName": "Test",
    "lastName": "Invitee",
    "email": INVITEE_EMAIL,
    "password": PASSWORD,
}
# --- End Variables ---

invitee_token = None
resp, body = do_request("POST", REGISTER_INVITEE_URL, "5a. Register Invitee",
                        json=REGISTER_INVITEE_PAYLOAD)

if resp.status_code == 409:
    print("  [SKIP] Invitee already exists (HTTP 409). Proceeding to login.")
elif resp.status_code in (200, 201):
    invitee_token = try_extract_token(body, "register invitee response")
else:
    print(f"  [WARN] Register invitee returned {resp.status_code}")
    invitee_token = try_extract_token(body, "register invitee response")

# ---- 5b. Login Invitee ----
# --- Variables for Login Invitee ---
LOGIN_INVITEE_PAYLOAD = {
    "email": INVITEE_EMAIL,
    "password": PASSWORD,
}
# --- End Variables ---

if not invitee_token:
    resp, body = do_request("POST", LOGIN_URL, "5b. Login Invitee",
                            json=LOGIN_INVITEE_PAYLOAD)
    if resp.status_code == 200:
        invitee_token = try_extract_token(body, "login invitee response")
        if not invitee_token:
            abort("Could not obtain JWT token for invitee")
    else:
        abort(f"Invitee login failed with status {resp.status_code}")

# ---- 5c. Create Project (as owner) ----
# --- Variables for Create Project ---
CREATE_PROJECT_URL = f"{BASE_URL}/api/projects"
CREATE_PROJECT_HEADERS = {
    "Authorization": f"Bearer {owner_token}",
}
CREATE_PROJECT_PAYLOAD = {
    "name": "Test Project",
    "description": "Created by integration test",
}
# --- End Variables ---

project_id = None
resp, body = do_request("POST", CREATE_PROJECT_URL, "5c. Create Project",
                        headers=CREATE_PROJECT_HEADERS,
                        json=CREATE_PROJECT_PAYLOAD)

if resp.status_code in (200, 201):
    project_id = try_extract_id(body, "create project response")
    if project_id is None:
        abort("Project created but no 'id' in response")
    print(f"  [OK] Project ID: {project_id}")
else:
    abort(f"Create project failed with status {resp.status_code} — cannot send invitation")

# ---- 5d. Get Invitee User ID ----
# --- Variables for Get Invitee Info ---
GET_INVITEE_URL = f"{BASE_URL}/api/users/me"
GET_INVITEE_HEADERS = {
    "Authorization": f"Bearer {invitee_token}",
}
# --- End Variables ---

invitee_id = None
resp, body = do_request("GET", GET_INVITEE_URL, "5d. Get Invitee Info",
                        headers=GET_INVITEE_HEADERS)

if resp.status_code == 200:
    invitee_id = try_extract_id(body, "invitee info response")
    if invitee_id is None:
        abort("Invitee info returned but no 'id' field")
    print(f"  [OK] Invitee ID: {invitee_id}")
else:
    abort(f"Get invitee info failed with status {resp.status_code}")

# ---- 5e. Send Invitation ----
# --- Variables for Send Invitation ---
SEND_INVITE_URL = f"{BASE_URL}/api/invitations/invite"
SEND_INVITE_HEADERS = {
    "Authorization": f"Bearer {owner_token}",
}
SEND_INVITE_PAYLOAD = {
    "projectId": project_id,
    "receiverId": invitee_id,
}
# --- End Variables ---

invitation_id = None
resp, body = do_request("POST", SEND_INVITE_URL, "5e. Send Invitation",
                        headers=SEND_INVITE_HEADERS,
                        json=SEND_INVITE_PAYLOAD)

if resp.status_code in (200, 201):
    invitation_id = try_extract_id(body, "send invitation response")
    if invitation_id:
        results.append(print_result("5. Send Invitation", resp.status_code, body, True,
                                    f"Invitation sent, id={invitation_id}"))
    else:
        results.append(print_result("5. Send Invitation", resp.status_code, body, True,
                                    "Invitation sent (but no 'id' field)"))
else:
    results.append(print_result("5. Send Invitation", resp.status_code, body, False,
                                f"Expected 200 or 201, got {resp.status_code}"))
    abort("Send invitation failed — cannot test accept")


# =============================================================================
# TEST 6 — Accept Project Invitation
# =============================================================================

if invitation_id is None:
    abort("No invitation_id available — cannot test accept")
    # (results entry already added above)

# --- Variables for Accept Invitation ---
ACCEPT_INVITE_URL = f"{BASE_URL}/api/invitations/{invitation_id}/respond"
ACCEPT_INVITE_HEADERS = {
    "Authorization": f"Bearer {invitee_token}",
}
ACCEPT_INVITE_PAYLOAD = {
    "accept": True,
}
# --- End Variables ---

resp, body = do_request("PATCH", ACCEPT_INVITE_URL, "6. Accept Invitation",
                        headers=ACCEPT_INVITE_HEADERS,
                        json=ACCEPT_INVITE_PAYLOAD)

if resp.status_code == 200:
    results.append(print_result("6. Accept Invitation", resp.status_code, body, True,
                                "Invitation accepted"))
else:
    results.append(print_result("6. Accept Invitation", resp.status_code, body, False,
                                f"Expected 200, got {resp.status_code}"))


# =============================================================================
# SUMMARY
# =============================================================================

passed = sum(1 for r in results if r["passed"])
total = len(results)

print("\n")
print("=" * 42)
print("         TEST SUMMARY")
print("=" * 42)
for r in results:
    icon = "PASS" if r["passed"] else "FAIL"
    print(f"  {r['name']:<25s} {icon}")
print("=" * 42)
print(f"  PASSED: {passed}/{total}")
if passed < total:
    print(f"  FAILED: {total - passed}/{total}")
print("=" * 42)
