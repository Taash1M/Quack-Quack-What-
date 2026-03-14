# Quack Quack What? — Design Document

**Version:** 1.0  
**Date:** March 2026  
**Author:** Taashi Manyanga  
**Trademark:** © Taashi Manyanga 2026

---

## 1. Product Vision

**Quack Quack What?** is an AI skill evaluation platform that performs deep analysis on AI agent skills — whether sourced from GitHub repositories, web URLs, local file systems, or directly pasted code — to determine their safety, quality, and security posture.

**Tagline:** *"Just because it looks and sounds like a duck doesn't always mean it's a duck."*

The platform empowers developers, security teams, and AI practitioners to verify that third-party agent skills are safe to deploy before integrating them into production systems.

---

## 2. Target Users

| Persona | Description | Primary Need |
|---------|-------------|--------------|
| **AI Developer** | Builds or integrates agent skills | Verify third-party skills before deployment |
| **Security Engineer** | Audits code for vulnerabilities | Automated security scanning of agent skills |
| **Platform Operator** | Manages AI agent marketplaces | Quality gate for submitted skills |
| **Researcher** | Studies AI agent safety | Comparative analysis of skill quality |

---

## 3. User Experience Flow

### 3.1 Guest Flow (No Login Required)
1. User arrives at the Home dashboard
2. Sees "Guest mode" banner with sign-in prompt
3. Imports a skill via GitHub URL, web URL, local file, or paste
4. Animated analysis simulation runs
5. Full evaluation report displays with Safety, Security, and Quality scores
6. User can chat with LLM to refine the skill (requires AI provider config)
7. User can download the evaluation report

### 3.2 Authenticated Flow
1. User signs in via Google, GitHub, Apple, or email/password
2. Profile avatar and name appear in the header
3. All evaluations are linked to the user's account
4. "History" page shows past evaluations with scores and timestamps
5. User can revisit any past evaluation

### 3.3 Documentation Flow
1. User clicks "Docs" in the header
2. Full documentation suite renders in-app with 12 sections
3. Covers product overview, capabilities, limitations, architecture, API reference, and more

---

## 4. UI Design System

### 4.1 Theme
- **Mode:** Dark-only cyber-analytical theme
- **Background:** Deep black/dark gray with subtle gradient orbs
- **Accent:** Primary color with neon glow effects
- **Panels:** Glass-morphism panels with subtle borders and backdrop blur

### 4.2 Typography
| Usage | Font | Weight |
|-------|------|--------|
| Headings | Space Grotesk | Bold (700) |
| Body | Space Grotesk | Regular (400) |
| Code/Data | JetBrains Mono | Regular (400) |
| Labels | JetBrains Mono | Medium (500) |

### 4.3 Color Palette
| Token | Usage | Value |
|-------|-------|-------|
| `--primary` | Accent, CTAs, active states | Brand primary |
| `--emerald-400` | Safety scores, pass indicators | #34d399 |
| `--blue-400` | Quality scores, info elements | #60a5fa |
| `--purple-400` | Security scores, audit elements | #c084fc |
| `--amber-400` | Warning states, review needed | #fbbf24 |
| `--red-400` | Critical findings, errors | #f87171 |

### 4.4 Components
- **Glass Panel:** Semi-transparent card with border, used for all content sections
- **Neon Text:** Glow effect on primary-colored heading text
- **Score Ring:** Circular progress indicator for scores (0-100)
- **Accordion:** Expandable finding lists grouped by category
- **Tabbed Interface:** Source type selector in SkillImporter

### 4.5 Layout
- **Max Width:** 5xl (1280px) for main content
- **Spacing:** 12-unit header margin, 6-unit component gaps
- **Fixed Elements:** Trademark badge (bottom-right), nav bar (top-right)

---

## 5. Page Inventory

| Route | Page | Auth Required | Description |
|-------|------|--------------|-------------|
| `/` | Home | No (Guest OK) | Main evaluator dashboard |
| `/history` | History | Yes | User's past evaluations |
| `/readme` | Documentation | No | Full documentation suite |

---

## 6. Interaction Design

### 6.1 Skill Import
- Four tabs: GitHub, URL, Local File, Paste
- Input validation per source type
- Clear error messages for invalid sources
- Loading state during fetch

### 6.2 Analysis Animation
- Sequential phase display (Parsing → Pattern Matching → Security Scan → Quality Check)
- Progress bar with phase labels
- Auto-transition to results on completion

### 6.3 Evaluation Report
- Three-pillar score cards (Safety, Quality, Security)
- Overall weighted score with PASS/REVIEW classification
- Expandable accordion sections for detailed findings
- Download report as text file
- "Chat about this skill" transition to LLM chat

### 6.4 LLM Chat
- Message input with send button
- Structured response cards (Fitness, Feedback, Report, Refined Code)
- Code block with syntax highlighting for refined code
- Conversation history maintained across messages

---

## 7. Responsive Design

| Breakpoint | Behavior |
|-----------|----------|
| Mobile (<768px) | Single column, stacked cards, hidden desktop labels |
| Tablet (768-1024px) | Two-column score grid, condensed header |
| Desktop (>1024px) | Full three-column layouts, expanded navigation |

---

## 8. Accessibility

- Semantic HTML elements throughout
- `data-testid` attributes on all interactive and data-display elements
- Keyboard-navigable tabs and accordions
- High contrast text on dark backgrounds
- Motion reduced via `prefers-reduced-motion` (Framer Motion)

---

© Taashi Manyanga 2026 — All Rights Reserved
