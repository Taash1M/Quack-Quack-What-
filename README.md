# Quack Quack What?

AI Skill Evaluator - "Just because it looks and sounds like a duck doesn't always mean it's a duck"

## Overview
A full-stack tool for evaluating AI agent skills regardless of their source (GitHub, web URLs, local files, or pasted code). Analyzes skills for safety, quality, and security, producing scored reports and enabling LLM-powered refinement. Supports user authentication via Replit Auth (Google, GitHub, Apple, email/password) with per-user evaluation history.

## Architecture

### Frontend (React + Tailwind v4)
- **Framework**: React 19 with Vite, wouter for routing
- **Styling**: Tailwind CSS v4 with custom dark theme, Space Grotesk + JetBrains Mono fonts
- **State**: TanStack Query for server state, local useState for UI state
- **Auth**: `useAuth` hook from `@/hooks/use-auth` — returns `{ user, isLoading, isAuthenticated, logout }`

### Backend (Express)
- **API**: Express 5 with JSON body parsing
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Replit Auth via OpenID Connect (Passport.js + connect-pg-simple sessions)
- **LLM Proxy**: Server-side proxy supporting OpenAI, Anthropic, AI Foundry, GCP Vertex AI, AWS Bedrock
- **Default LLM**: Replit AI Integrations (OpenAI-compatible, no API key required) — used as fallback for all users

## Key Files

### Shared
- `shared/schema.ts` - Drizzle schema: `providerConfigs`, `evaluations` + re-exports auth models
- `shared/models/auth.ts` - Auth tables: `users`, `sessions` (mandatory for Replit Auth)

### Server
- `server/index.ts` - Express server entry point
- `server/db.ts` - Shared database connection pool (imported by storage modules)
- `server/routes.ts` - API routes (auth setup + all /api/* endpoints)
- `server/storage.ts` - Database CRUD via Drizzle (evaluations, provider configs, user history)
- `server/analyzer.ts` - Static code analysis engine (safety, security, quality pattern matching)
- `server/llm.ts` - Multi-provider LLM adapter (OpenAI, Anthropic, Foundry, Vertex, Bedrock)
- `server/replit_integrations/auth/` - Auth module (replitAuth.ts, storage.ts, routes.ts, index.ts)

### Frontend Pages
- `client/src/pages/landing.tsx` - Unauthenticated landing page with feature overview
- `client/src/pages/home.tsx` - Main evaluator dashboard (auth-gated)
- `client/src/pages/history.tsx` - User evaluation history (auth-gated)
- `client/src/pages/readme.tsx` - Full documentation suite

### Frontend Components
- `client/src/components/evaluator/SkillImporter.tsx` - Multi-source skill import (GitHub, URL, local, paste)
- `client/src/components/evaluator/AnalysisSim.tsx` - Animated analysis progress
- `client/src/components/evaluator/EvaluationReport.tsx` - Score display with detailed findings
- `client/src/components/evaluator/SkillChat.tsx` - LLM-powered chat for use-case analysis & code refinement
- `client/src/components/evaluator/SettingsModal.tsx` - AI provider configuration

### Auth Hooks & Utils
- `client/src/hooks/use-auth.ts` - Authentication state hook
- `client/src/lib/auth-utils.ts` - Auth error helpers (isUnauthorizedError, redirectToLogin)

## Database Schema
- `users` - Authenticated user profiles (id, email, first_name, last_name, profile_image_url, timestamps)
- `sessions` - Server-side session storage (sid, sess, expire)
- `evaluations` - Evaluation results with scores, findings, and optional user_id
- `provider_configs` - Per-user AI provider credentials and configuration (scoped by user_id)

## Auth Flow
- Guest mode: Unauthenticated users can access the evaluator and run analyses (stored with userId=null)
- Login: `/api/login` → Replit OIDC → `/api/callback` → redirect to `/`
- Logout: `/api/logout` → Replit end-session → redirect to `/`
- User fetch: `GET /api/auth/user` (returns 401 if not authenticated)
- Protected routes (history, evaluations list, provider-config) use `isAuthenticated` middleware
- Guest-friendly routes (evaluate, fetch-skill, chat) work without auth
- Chat uses Replit AI Integrations (gpt-5-mini) by default; authenticated users with custom provider configs get their own provider

## Scoring
- Safety (40% weight): Detects eval, exec, prototype pollution, sandbox escapes
- Security (30% weight): Scans for exposed API keys, tokens, hardcoded secrets
- Quality (30% weight): Checks error handling, type coverage, documentation

## Security Hardening
- SSRF protection: Private IP/hostname blocking on URL fetch, redirect following disabled
- Rate limiting: 30 requests/minute per user/IP on all /api routes
- Auth-gated: provider-config, history, evaluations endpoints require authentication
- Chat open to all users (rate-limited, input-validated), uses built-in LLM as default
- Body size limits: 1MB JSON/URL-encoded payloads
- Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy
- x-powered-by disabled
- Error sanitization: API keys stripped from error messages, 500 errors return generic message
- Log sanitization: skillCode, apiKey, secretAccessKey stripped from server logs

## Trademark
© Taashi Manyanga 2026
