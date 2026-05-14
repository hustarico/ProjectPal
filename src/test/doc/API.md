# ProjectPal API Reference

Base URL: `http://localhost:8080`

---

## Contents

1. [Authentication](#1-authentication)
2. [Users & Profiles](#2-users--profiles)
3. [Skills](#3-skills)
4. [Projects](#4-projects)
5. [Invitations & Join Requests](#5-invitations--join-requests)
6. [Tasks](#6-tasks)
7. [Messages (REST)](#7-messages-rest)
8. [WebSocket Real-Time Chat](#8-websocket-real-time-chat)
9. [Ratings](#9-ratings)
10. [Notifications](#10-notifications)
11. [Search](#11-search)
12. [Error Handling](#12-error-handling)
13. [Data Models](#13-data-models)

---

## 1. Authentication

All auth endpoints are **public** (no token required). Only `/api/auth/logout` requires a valid token.

### Register

Creates a new user. Returns a JWT that must be sent with all subsequent requests.

```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Errors:** `409 Conflict` if email already exists.

### Login

```
POST /api/auth/authenticate
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Errors:** `401 Unauthorized` if credentials are invalid.

### Forgot Password

Generates a one-time reset token (valid 15 minutes). **In dev mode, the token is returned in the response.** In production, this would be emailed.

```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response 200:**
```json
{
  "message": "Password reset token generated. Use it within 15 minutes.",
  "resetToken": "a1b2c3d4-e5f6-..."
}
```

### Reset Password

Consumes the reset token and sets a new password.

```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "a1b2c3d4-e5f6-...",
  "newPassword": "newSecurePassword456"
}
```

**Response:** `200 OK`

**Errors:** `400 Bad Request` if token is invalid or expired.

### Logout

Invalidates the current JWT by adding it to a blacklist. Requires a valid token.

```
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:** `200 OK`

### JWT Usage

Every authenticated request must include:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

- Tokens expire after **24 hours**.
- Logged-out tokens are blacklisted by their JWT ID.
- The token's `sub` (subject) claim is the user's **email**.

---

## 2. Users & Profiles

### Get Current User Profile

```
GET /api/users/me
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "id": 1,
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Full-stack developer",
  "profilePictureUrl": "/uploads/profile-pictures/1_123456789.jpg",
  "isActive": true,
  "role": "USER",
  "availabilityStatus": "AVAILABLE",
  "skills": [
    {
      "id": 1,
      "userId": 1,
      "skillId": 2,
      "skillName": "JavaScript",
      "experienceLevel": "ADVANCED"
    }
  ],
  "pastProjects": [
    {
      "id": 1,
      "name": "My Project",
      "status": "IN_PROGRESS",
      "role": "OWNER"
    }
  ],
  "averageRating": 4.5
}
```

`availabilityStatus` values: `AVAILABLE`, `BUSY`, `UNAVAILABLE`
`experienceLevel` values: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `PROFESSIONAL`
`role` values: `USER`, `ADMIN`

### Get Any User Profile (public)

```
GET /api/users/{userId}
```

No auth required. Returns same shape as `/api/users/me`.

### Update Profile

Partial update — only send fields you want to change.

```
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Johnny",
  "bio": "Updated bio",
  "availabilityStatus": "AVAILABLE"
}
```

**Response:** full `UserProfileResponse`

### Change Password

```
PUT /api/users/me/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "currentPassword",
  "newPassword": "newPassword456",
  "confirmNewPassword": "newPassword456"
}
```

**Response:** `200 OK`

**Errors:** `400 Bad Request` if old password is wrong or new passwords don't match.

### Upload Profile Picture

```
POST /api/users/me/profile-picture
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary image>
```

**Constraints:**
- Max file size: **5 MB**
- Allowed types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

**Response:** full `UserProfileResponse` with updated `profilePictureUrl`

### Add Skill to User

Attaches a skill with an experience level to the current user.

```
POST /api/users/me/skills
Authorization: Bearer <token>
Content-Type: application/json

{
  "skillId": 2,
  "experienceLevel": "ADVANCED"
}
```

**Response 201:**
```json
{
  "id": 1,
  "userId": 1,
  "skillId": 2,
  "skillName": "JavaScript",
  "experienceLevel": "ADVANCED"
}
```

**Errors:** `409 Conflict` if user already has this skill.

### Remove Skill from User

```
DELETE /api/users/me/skills/{skillId}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Get Current User's Skills

```
GET /api/users/me/skills
Authorization: Bearer <token>
```

**Response:** `List<UserSkillResponse>`

---

## 3. Skills

### List All Skills (public)

```
GET /api/skills
```

**Response:**
```json
[
  {"id": 1, "name": "Java"},
  {"id": 2, "name": "JavaScript"}
]
```

### Create Skill (ADMIN only)

```
POST /api/skills
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rust"
}
```

**Response 201:** `{"id": 3, "name": "Rust"}`

**Errors:** `403 Forbidden` if not ADMIN; `400` if skill name already exists.

### Add Skill to Yourself (alternative endpoint)

Same as `POST /api/users/me/skills`.

```
POST /api/skills/user
Authorization: Bearer <token>
Content-Type: application/json

{
  "skillId": 2,
  "experienceLevel": "BEGINNER"
}
```

### Remove Skill from Yourself

```
DELETE /api/skills/user/{skillId}
Authorization: Bearer <token>
```

### Get User's Skills (public)

```
GET /api/skills/user/{userId}
```

---

## 4. Projects

### Create Project

The creator automatically becomes the project OWNER.

```
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Awesome Project",
  "description": "We're building something great"
}
```

**Response 201:**
```json
{
  "id": 1,
  "name": "My Awesome Project",
  "description": "We're building something great",
  "status": "OPEN",
  "ownerId": 1,
  "ownerName": "john@example.com",
  "isDeleted": false
}
```

### Update Project (owner only)

```
PATCH /api/projects/{projectId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "New description",
  "status": "IN_PROGRESS"
}
```

`status` values: `OPEN`, `IN_PROGRESS`, `COMPLETED`

**Response:** Full `ProjectResponse`

### Soft Delete Project (owner only)

```
DELETE /api/projects/{projectId}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Get Project by ID (owner/member only)

```
GET /api/projects/{projectId}
Authorization: Bearer <token>
```

### List My Projects

Returns all projects where the user is owner OR member.

```
GET /api/projects/my
Authorization: Bearer <token>
```

### Browse Available Projects

Returns OPEN projects the user is NOT already a member of.

```
GET /api/projects/browse
Authorization: Bearer <token>
```

---

## 5. Invitations & Join Requests

There are two types: **INVITE** (owner → user) and **JOIN_REQUEST** (user → owner).

### Send Invite (owner only)

```
POST /api/invitations/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": 1,
  "receiverId": 2
}
```

**Response 201:**
```json
{
  "id": 5,
  "projectId": 1,
  "projectName": "My Project",
  "senderId": 1,
  "senderName": "john@example.com",
  "receiverId": 2,
  "receiverName": "jane@example.com",
  "status": "PENDING",
  "type": "INVITE"
}
```

### Request to Join Project

```
POST /api/invitations/join-request?projectId=1
Authorization: Bearer <token>
```

Creates a `JOIN_REQUEST` where the project owner is the receiver.

### Respond to Invitation/Request

```
PATCH /api/invitations/{invitationId}/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "accept": true
}
```

- For `INVITE` type: the **receiver** responds.
- For `JOIN_REQUEST` type: the **project owner** responds.
- On accept, the user becomes a project MEMBER.
- A notification is sent to the relevant party.

### Get Pending Invites (for current user)

```
GET /api/invitations/my
Authorization: Bearer <token>
```

Returns all pending INVITEs sent to the current user.

### Get Pending Join Requests (owner only)

```
GET /api/invitations/join-requests/{projectId}
Authorization: Bearer <token>
```

---

## 6. Tasks

### Create Task (owner only)

```
POST /api/tasks?projectId=1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Setup database",
  "description": "Create the MySQL schema",
  "deadline": "2026-06-01T12:00:00"
}
```

`deadline` is optional.

**Response 201:**
```json
{
  "id": 10,
  "title": "Setup database",
  "description": "Create the MySQL schema",
  "status": "TODO",
  "deadline": "2026-06-01T12:00:00",
  "projectId": 1,
  "assigneeId": null,
  "assigneeName": null,
  "isDeleted": false,
  "createdAt": "2026-05-14T10:00:00",
  "updatedAt": "2026-05-14T10:00:00"
}
```

### Assign Task (owner only)

```
PATCH /api/tasks/{taskId}/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "assigneeId": 2
}
```

Assignee must be a project member. A `TASK_ASSIGNED` notification is sent.

### Update Task Status (owner or assignee)

```
PATCH /api/tasks/{taskId}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

`status` values: `TODO`, `IN_PROGRESS`, `DONE`

### Edit Task (owner or assignee)

Owner can edit everything. Assignee can edit title, description, status, deadline (but not reassign).

```
PATCH /api/tasks/{taskId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "deadline": "2026-07-01T12:00:00",
  "assigneeId": 3
}
```

All fields optional — only send what you want to change.

### Delete Task (owner only)

Soft delete — sets `isDeleted = true`.

```
DELETE /api/tasks/{taskId}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Get Tasks by Project

```
GET /api/tasks/project/{projectId}
Authorization: Bearer <token>
```

Returns all non-deleted tasks.

---

## 7. Messages (REST)

These endpoints are for fetching message history. Real-time chat uses WebSockets (see section 8).

### Send Message

```
POST /api/messages/project/{projectId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello team!",
  "fileUrl": null,
  "fileName": null
}
```

`fileUrl` and `fileName` are optional — provide them if sharing a file URL.

### Get Message History

```
GET /api/messages/project/{projectId}
Authorization: Bearer <token>
```

Returns all messages sorted oldest-first.

---

## 8. WebSocket Real-Time Chat

### Connection

```
ws://localhost:8080/ws?token=<jwt_token>
```

Connect using STOMP over native WebSocket. The JWT is passed as a query parameter on the WebSocket URL — **not** as a STOMP header.

**STOMP Configuration:**
- Application destination prefix: `/app`
- Broker (subscription) prefix: `/topic`

### Subscribe to a Project's Chat

```
SUBSCRIBE /topic/project/{projectId}
```

### Send a Message

```
SEND /app/chat/{projectId}
content-type: application/json

{"content": "hello", "fileUrl": null, "fileName": null}
```

### Receive Messages

Messages are broadcast to all subscribers of `/topic/project/{projectId}` as JSON:

```json
{
  "id": 55,
  "projectId": 1,
  "senderId": 1,
  "senderName": "john@example.com",
  "content": "hello",
  "fileUrl": null,
  "fileName": null,
  "sentAt": "2026-05-14T10:00:00"
}
```

### Important Notes

- **Both sending and receiving** happen over the same WebSocket connection.
- The REST message endpoints (`/api/messages/project/{projectId}`) are only for fetching **history** — they don't broadcast in real time.
- When a message is sent via WebSocket, a `NEW_MESSAGE` notification is created for all other project members.
- The sender does NOT receive their own message via the subscription (the client should optimistically display it).
- The REST POST endpoint and the WebSocket handler are separate — messages sent via REST are stored but NOT broadcast. Use WebSocket for real-time.

---

## 9. Ratings

### Submit Rating

Can only rate on **COMPLETED** projects. Cannot rate yourself. One rating per (rater, ratee, project) combination.

```
POST /api/ratings
Authorization: Bearer <token>
Content-Type: application/json

{
  "rateeId": 2,
  "projectId": 1,
  "score": 4
}
```

`score` must be 1–5.

**Response 201:**
```json
{
  "id": 1,
  "raterId": 1,
  "raterName": "john@example.com",
  "rateeId": 2,
  "rateeName": "jane@example.com",
  "projectId": 1,
  "score": 4
}
```

### Get User Ratings (public)

```
GET /api/ratings/user/{userId}
```

---

## 10. Notifications

### Get My Notifications

```
GET /api/notifications
Authorization: Bearer <token>
```

Returns newest-first.

```json
[
  {
    "id": 1,
    "recipientId": 1,
    "type": "TASK_ASSIGNED",
    "message": "You have been assigned to task: Setup DB in project: My Project",
    "projectId": 1,
    "projectName": "My Project",
    "createdAt": "2026-05-14T10:00:00"
  }
]
```

### Notification Types and Triggers

| Type | When it fires |
|---|---|
| `PROJECT_INVITATION` | Owner invites a user to a project |
| `TASK_ASSIGNED` | Owner assigns a task to a user |
| `DEADLINE_REMINDER` | **Not yet triggered** (no scheduler implemented) |
| `JOIN_REQUEST` | A user requests to join a project |
| `JOIN_APPROVED` | An invitation or join request is accepted |
| `JOIN_REJECTED` | An invitation or join request is rejected |
| `NEW_MESSAGE` | A WebSocket chat message is sent in a project |

---

## 11. Search

All search endpoints are **public** (no auth required).

### Search Users by Name

```
GET /api/search/users?name=john
```

### Search Users by Skill

```
GET /api/search/users/skill?skillId=2
GET /api/search/users/skill?skillId=2&experienceLevel=ADVANCED
```

### Recommend Users by Skills

Returns users matching ANY of the given skills, sorted by match count descending.

```
GET /api/search/users/recommend?skillIds=2,3,5
```

### Advanced Search

```
GET /api/search/users/advanced?name=john&skillIds=2,3
```

If `skillIds` is provided, ALL skills must match (AND logic). If omitted, falls back to name-only search.

### Browse Projects

```
GET /api/search/projects?name=myproject
```

Filters by project name (case-insensitive LIKE). Omitting `name` returns all OPEN projects.

---

## 12. Error Handling

All errors return a consistent JSON structure:

```json
{
  "timestamp": "2026-05-14T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Human-readable description of the problem",
  "path": "/api/projects"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created (resource created) |
| `204` | No Content (deletion success) |
| `400` | Bad Request (validation error, invalid input) |
| `403` | Forbidden (not authorized for this action) |
| `404` | Not Found (resource doesn't exist) |
| `409` | Conflict (duplicate, e.g. email or skill already exists) |
| `500` | Internal Server Error |

---

## 13. Data Models

### User

| Field | Type | Notes |
|---|---|---|
| id | Integer | Auto-generated |
| email | String | Unique, used as login |
| firstName | String | |
| lastName | String | |
| password | String | BCrypt-hashed, never returned |
| bio | String (TEXT) | Optional |
| profilePictureUrl | String | Path like `/uploads/profile-pictures/1_123.jpg` |
| isActive | Boolean | `true` by default |
| availabilityStatus | Enum | `AVAILABLE`, `BUSY`, `UNAVAILABLE` |
| role | Enum | `USER`, `ADMIN` |

### Project

| Field | Type | Notes |
|---|---|---|
| id | Integer | |
| name | String | |
| description | String (TEXT) | |
| status | Enum | `OPEN`, `IN_PROGRESS`, `COMPLETED` |
| owner | User | Many-to-One |
| isDeleted | Boolean | Soft delete flag |

### ProjectMember

| Field | Type | Notes |
|---|---|---|
| id | Integer | |
| project | Project | |
| user | User | |
| memberRole | Enum | `OWNER`, `ADMIN`, `MEMBER` |

### Task

| Field | Type | Notes |
|---|---|---|
| id | Integer | |
| title | String | |
| description | String (TEXT) | |
| status | Enum | `TODO`, `IN_PROGRESS`, `DONE` |
| deadline | LocalDateTime | Optional |
| project | Project | |
| assignee | User | Optional, Many-to-One |
| isDeleted | Boolean | Soft delete |
| createdAt | LocalDateTime | Auto-set |
| updatedAt | LocalDateTime | Auto-set |

### Message

| Field | Type | Notes |
|---|---|---|
| id | Integer | |
| project | Project | |
| sender | User | |
| content | String (TEXT) | |
| fileUrl | String | Optional, for file shares |
| fileName | String | Optional |
| sentAt | LocalDateTime | Auto-set |

### Invitation

| Field | Type | Notes |
|---|---|---|
| id | Integer | |
| project | Project | |
| sender | User | |
| receiver | User | |
| status | Enum | `PENDING`, `ACCEPTED`, `REJECTED` |
| type | Enum | `INVITE`, `JOIN_REQUEST` |

### Rating

| Field | Type | Notes |
|---|---|---|
| id | Integer | |
| rater | User | |
| ratee | User | |
| project | Project | |
| score | Integer | 1–5 |

### Notification

| Field | Type | Notes |
|---|---|---|
| id | Integer | |
| recipient | User | |
| type | Enum | See notification types above |
| message | String | Max 500 chars |
| project | Project | Nullable |
| createdAt | LocalDateTime | Auto-set |

### Skill

| Field | Type | Notes |
|---|---|---|
| id | Integer | |
| name | String | Unique |

### UserSkill (join table)

| Field | Type | Notes |
|---|---|---|
| id | Integer | |
| user | User | |
| skill | Skill | |
| experienceLevel | Enum | `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `PROFESSIONAL` |
