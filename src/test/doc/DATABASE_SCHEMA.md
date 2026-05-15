# ProjectPal Database Schema

**Database:** MySQL (`ProjectPalDB`)  
**ORM:** JPA / Hibernate (`ddl-auto=update`)  

---

## 1. `users` — User Accounts

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Used as Spring Security username |
| `first_name` | VARCHAR(255) | | |
| `last_name` | VARCHAR(255) | | |
| `password` | VARCHAR(255) | NOT NULL | BCrypt-hashed |
| `bio` | TEXT | | |
| `profile_picture_url` | VARCHAR(255) | | |
| `is_active` | TINYINT(1) | NOT NULL, DEFAULT 1 | Maps to `isEnabled()` in UserDetails |
| `availability_status` | ENUM('AVAILABLE','BUSY','UNAVAILABLE') | DEFAULT 'AVAILABLE' | |
| `role` | ENUM('USER','ADMIN') | NOT NULL, DEFAULT 'USER' | Mapped to Spring Security `ROLE_` |

**Relationships:**
- One-to-Many → `user_skills` (via `user_id`)
- One-to-Many → `project_members` (via `user_id`)
- One-to-Many → `tasks` as assignee (via `assignee_id`)
- One-to-Many → `messages` as sender (via `sender_id`)
- One-to-Many → `invitations` as sender (via `sender_id`)
- One-to-Many → `invitations` as receiver (via `receiver_id`)
- One-to-Many → `notifications` as recipient (via `recipient_id`)
- One-to-Many → `ratings` as rater (via `rater_id`)
- One-to-Many → `ratings` as ratee (via `ratee_id`)
- One-to-Many → `password_reset_tokens` (via `user_id`)
- One-to-Many → `projects` as owner (via `owner_id`)

---

## 2. `skills` — Predefined Skills

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(255) | UNIQUE, NOT NULL | e.g. "Java", "React", "Python" |

---

## 3. `user_skills` — User–Skill Junction (with experience level)

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | |
| `user_id` | INT | FK → `users(id)`, NOT NULL | |
| `skill_id` | INT | FK → `skills(id)`, NOT NULL | |
| `experience_level` | ENUM('BEGINNER','INTERMEDIATE','ADVANCED','PROFESSIONAL') | NOT NULL | |

**Relationships:**
- Many-to-One → `users`
- Many-to-One → `skills`

---

## 4. `projects` — Project

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | | |
| `status` | ENUM('OPEN','IN_PROGRESS','COMPLETED') | NOT NULL, DEFAULT 'OPEN' | |
| `owner_id` | INT | FK → `users(id)`, NOT NULL | |
| `is_deleted` | TINYINT(1) | NOT NULL, DEFAULT 0 | Soft delete flag |

**Relationships:**
- Many-to-One → `users` (owner)
- One-to-Many → `project_members` (via `project_id`)
- One-to-Many → `tasks` (via `project_id`)
- One-to-Many → `messages` (via `project_id`)
- One-to-Many → `invitations` (via `project_id`)
- One-to-Many → `notifications` (via `project_id`)
- One-to-Many → `ratings` (via `project_id`)

---

## 5. `project_members` — Project Membership Junction

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | |
| `project_id` | INT | FK → `projects(id)`, NOT NULL | |
| `user_id` | INT | FK → `users(id)`, NOT NULL | |
| `member_role` | ENUM('OWNER','ADMIN','MEMBER') | NOT NULL | |

**Relationships:**
- Many-to-One → `projects`
- Many-to-One → `users`

---

## 6. `tasks` — Task within a Project

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | |
| `title` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | | |
| `status` | ENUM('TODO','IN_PROGRESS','DONE') | NOT NULL, DEFAULT 'TODO' | |
| `deadline` | DATETIME | | |
| `project_id` | INT | FK → `projects(id)`, NOT NULL | |
| `assignee_id` | INT | FK → `users(id)`, NULLABLE | |
| `is_deleted` | TINYINT(1) | NOT NULL, DEFAULT 0 | Soft delete |
| `created_at` | DATETIME | Auto-set via `@PrePersist` | |
| `updated_at` | DATETIME | Auto-set via `@PrePersist`/`@PreUpdate` | |

**Relationships:**
- Many-to-One → `projects`
- Many-to-One → `users` (assignee)

---

## 7. `messages` — Project Chat Messages

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | |
| `project_id` | INT | FK → `projects(id)`, NOT NULL | |
| `sender_id` | INT | FK → `users(id)`, NOT NULL | |
| `content` | TEXT | | |
| `file_url` | VARCHAR(255) | | |
| `file_name` | VARCHAR(255) | | |
| `sent_at` | DATETIME | Auto-set via `@PrePersist` | |

**Relationships:**
- Many-to-One → `projects`
- Many-to-One → `users` (sender)

---

## 8. `invitations` — Project Invitations & Join Requests

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | |
| `project_id` | INT | FK → `projects(id)`, NOT NULL | |
| `sender_id` | INT | FK → `users(id)`, NOT NULL | The user who sent the invite |
| `receiver_id` | INT | FK → `users(id)`, NOT NULL | The user receiving the invite |
| `status` | ENUM('PENDING','ACCEPTED','REJECTED') | NOT NULL, DEFAULT 'PENDING' | |
| `type` | ENUM('INVITE','JOIN_REQUEST') | NOT NULL | INVITE = member invites someone; JOIN_REQUEST = user requests to join |

**Relationships:**
- Many-to-One → `projects`
- Many-to-One → `users` (sender)
- Many-to-One → `users` (receiver)

---

## 9. `notifications` — User Notifications

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | |
| `recipient_id` | INT | FK → `users(id)`, NOT NULL | |
| `type` | ENUM('PROJECT_INVITATION','TASK_ASSIGNED','DEADLINE_REMINDER','JOIN_REQUEST','JOIN_APPROVED','JOIN_REJECTED','NEW_MESSAGE') | NOT NULL | |
| `message` | VARCHAR(500) | | |
| `project_id` | INT | FK → `projects(id)`, NULLABLE | |
| `created_at` | DATETIME | Auto-set via `@PrePersist` | |

**Relationships:**
- Many-to-One → `users` (recipient)
- Many-to-One → `projects`

---

## 10. `ratings` — Peer Ratings (1–5)

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | |
| `rater_id` | INT | FK → `users(id)`, NOT NULL | The user giving the rating |
| `ratee_id` | INT | FK → `users(id)`, NOT NULL | The user being rated |
| `project_id` | INT | FK → `projects(id)`, NOT NULL | |
| `score` | INT | NOT NULL, CHECK(1–5) | |

**Relationships:**
- Many-to-One → `users` (rater)
- Many-to-One → `users` (ratee)
- Many-to-One → `projects`

---

## 11. `blacklisted_tokens` — JWT Token Blacklist

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | |
| `token_id` | VARCHAR(64) | UNIQUE, NOT NULL | JWT `jti` claim |
| `expires_at` | DATETIME | NOT NULL | |

---

## 12. `password_reset_tokens` — Password Reset Tokens

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | |
| `token` | VARCHAR(64) | UNIQUE, NOT NULL | Random UUID |
| `user_id` | INT | FK → `users(id)`, NOT NULL | |
| `expires_at` | DATETIME | NOT NULL | |
| `used` | TINYINT(1) | NOT NULL, DEFAULT 0 | |

**Relationships:**
- Many-to-One → `users`

---

## Entity Relationship Summary

```
users ──< user_skills >── skills
users ──< project_members >── projects
users ──< tasks (assignee)
users ──< messages (sender)
users ──< invitations (sender)
users ──< invitations (receiver)
users ──< notifications (recipient)
users ──< ratings (rater)
users ──< ratings (ratee)
users ──< projects (owner)
users ──< password_reset_tokens
projects ──< tasks
projects ──< messages
projects ──< invitations
projects ──< notifications
projects ──< ratings
```

**Legend:** `──<` = One-to-Many, `>──<` = Many-to-Many (via junction table)

---

## Enum Values Summary

| Enum | Values |
|---|---|
| `Role` | `USER`, `ADMIN` |
| `AvailabilityStatus` | `AVAILABLE`, `BUSY`, `UNAVAILABLE` |
| `ExperienceLevel` | `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `PROFESSIONAL` |
| `ProjectStatus` | `OPEN`, `IN_PROGRESS`, `COMPLETED` |
| `MemberRole` | `OWNER`, `ADMIN`, `MEMBER` |
| `TaskStatus` | `TODO`, `IN_PROGRESS`, `DONE` |
| `InvitationStatus` | `PENDING`, `ACCEPTED`, `REJECTED` |
| `InvitationType` | `INVITE`, `JOIN_REQUEST` |
| `NotificationType` | `PROJECT_INVITATION`, `TASK_ASSIGNED`, `DEADLINE_REMINDER`, `JOIN_REQUEST`, `JOIN_APPROVED`, `JOIN_REJECTED`, `NEW_MESSAGE` |
