# 🦆 Quack Quack What?

  > "Just because it looks and sounds like a duck doesn't always mean it's a duck"

  **AI Skill Evaluator** — Analyze AI agent skills for safety, quality, and security.

  © Taashi Manyanga 2026

  ## Features

  - **Multi-source skill import**: GitHub URLs, direct URLs, local files, or pasted code
  - **Comprehensive evaluation**: Safety (40%), Security (30%), Quality (30%) scoring
  - **Universal AI chat**: Discuss skills with AI — no API key required
  - **User authentication**: Replit Auth with Google, GitHub, Apple, email
  - **Guest mode**: Full evaluation access without login
  - **Evaluation history**: Track and review past evaluations (authenticated users)
  - **Mobile responsive**: Fully optimized for all screen sizes
  - **Security hardened**: SSRF protection, rate limiting, input validation

  ## Tech Stack

  - **Frontend**: React 18, TypeScript, Tailwind CSS v4, Wouter routing
  - **Backend**: Express.js, PostgreSQL, Drizzle ORM
  - **AI**: OpenAI-compatible LLM integration via Replit AI Integrations
  - **Auth**: Replit Auth (OIDC)
  - **Design**: Dark cyber-analytical theme, Space Grotesk + JetBrains Mono

  ## Getting Started

  ```bash
  npm install
  npm run dev
  ```

  ## Documentation

  See the `docs/` directory for:
  - Design Document
  - Architecture Document  
  - Build Document
  - API Reference
  