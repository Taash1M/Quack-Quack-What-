# Quack Quack What? — API Reference

**Version:** 1.0  
**Date:** March 2026  
**Author:** Taashi Manyanga  
**Trademark:** © Taashi Manyanga 2026

---

## Base URL

```
https://<your-replit-app>.replit.app
```

All endpoints are prefixed with `/api/`.

---

## Authentication

Authentication uses OpenID Connect via Replit Auth. Sessions are stored server-side in PostgreSQL.

### Login
```
GET /api/login
```
Redirects the user to the Replit OIDC login page. Supports Google, GitHub, Apple, and email/password.

**Response:** 302 Redirect to OIDC provider

---

### Callback
```
GET /api/callback
```
Handles the OIDC callback after authentication. Creates or updates the user record and establishes a session.

**Response:** 302 Redirect to `/` on success, `/api/login` on failure

---

### Logout
```
GET /api/logout
```
Destroys the session and redirects to the OIDC end-session endpoint.

**Response:** 302 Redirect to home page

---

### Get Current User
```
GET /api/auth/user
```
Returns the authenticated user's profile.

**Auth Required:** Yes

**Success Response (200):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profileImageUrl": "https://...",
  "createdAt": "2026-03-08T00:00:00.000Z",
  "updatedAt": "2026-03-08T00:00:00.000Z"
}
```

**Error Response (401):**
```json
{ "message": "Unauthorized" }
```

---

## Skill Fetching

### Fetch Skill Source
```
POST /api/fetch-skill
```
Fetches skill source code from a GitHub repository or URL.

**Auth Required:** No

**Request Body:**
```json
{
  "source": "owner/repo",
  "sourceType": "github" | "url" | "local"
}
```

**Success Response (200):**
```json
{
  "code": "// Full source code content..."
}
```

**Error Response (400/500):**
```json
{ "message": "Error description" }
```

---

## Evaluation

### Run Evaluation
```
POST /api/evaluate
```
Runs static analysis on the provided code and stores the evaluation result.

**Auth Required:** No (Guest mode supported; userId set if authenticated)

**Request Body:**
```json
{
  "source": "owner/repo",
  "sourceType": "github",
  "code": "// The skill code to analyze..."
}
```

**Success Response (200):**
```json
{
  "id": "eval-uuid",
  "userId": "user-uuid" | null,
  "source": "owner/repo",
  "sourceType": "github",
  "skillCode": "// ...",
  "safetyScore": 85,
  "qualityScore": 72,
  "securityScore": 90,
  "overallScore": 82,
  "summary": "Analysis summary text...",
  "safetyFindings": ["Finding 1", "Finding 2"],
  "qualityFindings": ["Finding 1"],
  "securityFindings": [],
  "createdAt": "2026-03-08T00:00:00.000Z"
}
```

---

### List User Evaluations
```
GET /api/evaluations
```
Returns the authenticated user's evaluations, most recent first (max 100).

**Auth Required:** Yes

**Success Response (200):**
```json
[
  { "id": "...", "source": "...", "overallScore": 82, ... }
]
```

---

### Get Single Evaluation
```
GET /api/evaluations/:id
```
Returns a single evaluation. Ownership check: returns 404 if the evaluation belongs to another user.

**Auth Required:** Partial (guests can view guest evaluations)

**Success Response (200):** Same schema as POST `/api/evaluate` response

**Error Response (404):**
```json
{ "message": "Evaluation not found" }
```

---

### User History
```
GET /api/history
```
Returns the authenticated user's evaluation history, most recent first (max 100).

**Auth Required:** Yes

**Success Response (200):** Same as GET `/api/evaluations`

---

## AI Provider Configuration

### Get Provider Config
```
GET /api/provider-config
```
Returns the current AI provider configuration with API keys masked.

**Auth Required:** No

**Success Response (200):**
```json
{
  "id": "config-uuid",
  "provider": "openai",
  "model": "gpt-4o",
  "targetUri": null,
  "region": null,
  "projectId": null,
  "location": null,
  "hasApiKey": true,
  "hasAccessKey": false,
  "hasSecretKey": false
}
```

---

### Save Provider Config
```
POST /api/provider-config
```
Creates or updates the AI provider configuration.

**Auth Required:** No

**Request Body:**
```json
{
  "provider": "openai",
  "apiKey": "sk-...",
  "model": "gpt-4o"
}
```

Supported providers: `openai`, `anthropic`, `foundry`, `vertexai`, `bedrock`

**Success Response (200):**
```json
{ "success": true, "provider": "openai" }
```

---

## Chat

### Send Chat Message
```
POST /api/chat
```
Sends a message to the configured LLM with skill code context.

**Auth Required:** No

**Request Body:**
```json
{
  "message": "Is this skill safe for production use in a customer service bot?",
  "skillCode": "// optional: the skill code being discussed",
  "evaluationSummary": "optional: summary of evaluation results",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Success Response (200):**
```json
{
  "fit": "Good" | "Moderate" | "Poor",
  "feedback": "Short 2-3 sentence assessment...",
  "report": "Detailed multi-paragraph analysis...",
  "refinedCode": "// Complete refined code..."
}
```

**Error Response (400):**
```json
{
  "message": "No AI provider configured...",
  "needsConfig": true
}
```

---

## Scoring System

### Score Ranges
| Score | Classification | Color |
|-------|---------------|-------|
| 80-100 | PASSED | Green |
| 0-79 | REVIEW | Amber |

### Weight Distribution
| Pillar | Weight | Focus |
|--------|--------|-------|
| Safety | 40% | Dangerous patterns, sandbox escapes |
| Security | 30% | Exposed secrets, hardcoded credentials |
| Quality | 30% | Error handling, types, documentation |

### Formula
```
overallScore = (safetyScore × 0.4) + (securityScore × 0.3) + (qualityScore × 0.3)
```

---

© Taashi Manyanga 2026 — All Rights Reserved
