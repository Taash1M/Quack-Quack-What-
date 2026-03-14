import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, ShieldAlert, Cpu, Settings, Zap, Info, Database, Layers, Users, Code2, GitBranch, FileText, Server, Download } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Readme() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Evaluator
            </Button>
          </Link>
        </div>

        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold font-mono tracking-tight mb-4 flex items-center">
            <BookOpen className="w-8 h-8 md:w-10 md:h-10 mr-3 md:mr-4 text-primary shrink-0" />
            <span>Documentation <span className="text-primary neon-text">Suite</span></span>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mt-2">
            <p className="text-base md:text-xl text-muted-foreground">Design, Architecture, Build, and Usage Guides.</p>
            <a href="/api/download-docs" download className="shrink-0">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl w-full sm:w-auto" data-testid="button-download-docs">
                <Download className="w-4 h-4 mr-2" />
                Download All (.zip)
              </Button>
            </a>
          </div>
        </header>

        <div className="space-y-8">
          
          <Section icon={<Info className="w-6 h-6 text-blue-400" />} title="1. Product Overview">
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong className="text-foreground">Quack Quack What?</strong> is a full-stack AI skill evaluation platform. It ingests code from any source — GitHub repositories, web URLs, local file systems, or direct paste — and produces a comprehensive safety, security, and quality report scored out of 100. Users can then chat with an integrated LLM to refine the code and tune it for specific use cases.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The platform supports user authentication via Google, GitHub, Apple, and email/password, persists evaluation history per user, and supports multiple LLM backends including OpenAI, Anthropic, AI Foundry, GCP Vertex AI, and AWS Bedrock.
            </p>
          </Section>

          <Section icon={<Zap className="w-6 h-6 text-amber-400" />} title="2. Core Capabilities">
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Multi-Source Skill Import:</strong> Accepts GitHub repos (full tree or single file), raw URLs, local paths, and direct code paste.</li>
              <li><strong className="text-foreground">Static Analysis Engine:</strong> Pattern-based scanning using 20+ regex rules for dangerous code (eval, exec, prototype pollution), exposed secrets (API keys, tokens, passwords), and quality issues (empty catches, missing types, no error handling).</li>
              <li><strong className="text-foreground">Scored Evaluation Reports:</strong> Three-pillar scoring — Safety (40% weight), Security (30%), Quality (30%) — producing an overall score with PASS/REVIEW classification.</li>
              <li><strong className="text-foreground">LLM-Powered Chat:</strong> Interactive assistant using the user's configured AI provider to assess fitness-for-purpose, generate detailed reports, and produce refined/optimized code.</li>
              <li><strong className="text-foreground">User Profiles & History:</strong> Authenticated user sessions with full evaluation history tracking.</li>
              <li><strong className="text-foreground">Report Download:</strong> Export full evaluation results as a text file.</li>
            </ul>
          </Section>

          <Section icon={<ShieldAlert className="w-6 h-6 text-red-400" />} title="3. Limitations & Disclaimers">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-200 font-mono font-bold uppercase tracking-wider mb-2">CRITICAL DISCLAIMER</p>
              <p className="text-red-100/80 leading-relaxed text-sm">
                This tool performs static analysis and heuristic checks. <strong>It CANNOT guarantee 100% safety or security.</strong> Zero-day vulnerabilities, highly obfuscated malicious code, or complex runtime logical errors may bypass these checks. Always run unverified agent skills in an isolated sandbox before deploying.
              </p>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Cannot perfectly simulate runtime execution for every possible input.</li>
              <li>Cannot detect logic bombs or time-delayed malicious behavior.</li>
              <li>Not a substitute for professional penetration testing or human code review.</li>
              <li>LLM-generated refined code should still be reviewed before production use.</li>
              <li>GitHub API rate limits apply to unauthenticated repository fetching (60 requests/hour).</li>
            </ul>
          </Section>

          <Section icon={<Layers className="w-6 h-6 text-purple-400" />} title="4. System Architecture">
            <div className="bg-black/40 border border-white/5 rounded-xl p-3 md:p-6 mb-6 font-mono text-xs md:text-sm overflow-x-auto">
              <pre className="text-muted-foreground whitespace-pre">{`
┌─────────────────────────────────────────┐
│                FRONTEND                  │
│  React 19 + Tailwind v4 + Wouter        │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Landing  │ │   Home   │ │ History  │ │
│  │  Page    │ │Dashboard │ │  Page    │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│       │            │            │        │
│  ┌────────────────────────────────────┐  │
│  │    TanStack Query + apiRequest    │  │
│  └────────────────────────────────────┘  │
└────────────────┬────────────────────────┘
                 │ HTTP / JSON
┌────────────────┴────────────────────────┐
│              BACKEND (Express 5)         │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Auth    │ │  Routes  │ │   LLM    │ │
│  │(Passport)│ │ /api/*   │ │  Proxy   │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│       │            │            │        │
│  ┌────────────────────────────────────┐  │
│  │     Static Analyzer Engine        │  │
│  │  (Pattern Matching + Heuristics)  │  │
│  └────────────────────────────────────┘  │
│       │                                  │
│  ┌────────────────────────────────────┐  │
│  │  Drizzle ORM → PostgreSQL DB      │  │
│  │  Tables: users, sessions,         │  │
│  │  evaluations, provider_configs    │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
              `.trim()}</pre>
            </div>
          </Section>

          <Section icon={<Database className="w-6 h-6 text-cyan-400" />} title="5. Database Schema">
            <div className="space-y-4">
              <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                <h4 className="font-mono font-bold mb-2 text-primary">users</h4>
                <p className="text-sm text-muted-foreground">Stores authenticated user profiles. Created via OpenID Connect on first login.</p>
                <code className="text-xs text-emerald-300 mt-2 block">id (PK), email, first_name, last_name, profile_image_url, created_at, updated_at</code>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                <h4 className="font-mono font-bold mb-2 text-primary">sessions</h4>
                <p className="text-sm text-muted-foreground">Server-side session storage for authenticated users (connect-pg-simple).</p>
                <code className="text-xs text-emerald-300 mt-2 block">sid (PK), sess (JSONB), expire</code>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                <h4 className="font-mono font-bold mb-2 text-primary">evaluations</h4>
                <p className="text-sm text-muted-foreground">Stores all evaluation results with full findings and scores.</p>
                <code className="text-xs text-emerald-300 mt-2 block">id (PK), user_id (FK), source, source_type, skill_code, safety_score, quality_score, security_score, overall_score, summary, safety/quality/security_findings (JSON), created_at</code>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                <h4 className="font-mono font-bold mb-2 text-primary">provider_configs</h4>
                <p className="text-sm text-muted-foreground">Stores the configured LLM provider credentials (encrypted at rest by the database).</p>
                <code className="text-xs text-emerald-300 mt-2 block">id (PK), provider, api_key, model, target_uri, region, project_id, location, access_key_id, secret_access_key</code>
              </div>
            </div>
          </Section>

          <Section icon={<Server className="w-6 h-6 text-orange-400" />} title="6. API Reference">
            <div className="space-y-3 font-mono text-sm">
              {[
                { method: "GET", path: "/api/auth/user", desc: "Get current authenticated user profile" },
                { method: "GET", path: "/api/login", desc: "Initiate OpenID Connect login flow" },
                { method: "GET", path: "/api/logout", desc: "Log out and destroy session" },
                { method: "GET", path: "/api/provider-config", desc: "Get current AI provider config (keys masked)" },
                { method: "POST", path: "/api/provider-config", desc: "Save or update AI provider configuration" },
                { method: "POST", path: "/api/fetch-skill", desc: "Fetch skill source code from GitHub/URL" },
                { method: "POST", path: "/api/evaluate", desc: "Run static analysis and save evaluation" },
                { method: "GET", path: "/api/evaluations", desc: "List all evaluations (most recent first)" },
                { method: "GET", path: "/api/evaluations/:id", desc: "Get a single evaluation by ID" },
                { method: "GET", path: "/api/history", desc: "Get authenticated user's evaluation history" },
                { method: "POST", path: "/api/chat", desc: "Send a chat message to the configured LLM" },
              ].map((route) => (
                <div key={route.path + route.method} className="flex flex-col sm:flex-row items-start gap-1.5 sm:gap-3 bg-black/30 rounded-lg p-3 border border-white/5">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${route.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{route.method}</span>
                    <span className="text-primary text-xs sm:text-sm break-all">{route.path}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">{route.desc}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<Code2 className="w-6 h-6 text-green-400" />} title="7. Build & File Structure">
            <div className="bg-black/40 border border-white/5 rounded-xl p-3 md:p-6 font-mono text-xs md:text-sm overflow-x-auto">
              <pre className="text-muted-foreground whitespace-pre">{`
shared/
  schema.ts              # Drizzle DB schema (all tables)
  models/auth.ts         # Auth-specific user/session tables

server/
  index.ts               # Express server entry point
  db.ts                  # Database connection pool
  routes.ts              # All API route definitions
  storage.ts             # Database CRUD operations
  analyzer.ts            # Static code analysis engine
  llm.ts                 # Multi-provider LLM adapter
  replit_integrations/
    auth/                # Authentication module (OIDC)

client/src/
  App.tsx                # Root component + routing
  pages/
    landing.tsx          # Unauthenticated landing page
    home.tsx             # Main evaluator dashboard
    history.tsx          # User evaluation history
    readme.tsx           # This documentation page
  components/evaluator/
    SkillImporter.tsx    # Multi-source import interface
    AnalysisSim.tsx      # Animated analysis progress
    EvaluationReport.tsx # Score display + detailed findings
    SkillChat.tsx        # LLM-powered chat interface
    SettingsModal.tsx    # AI provider configuration
  hooks/
    use-auth.ts          # Authentication state hook
  lib/
    queryClient.ts       # TanStack Query config
    auth-utils.ts        # Auth error helpers
              `.trim()}</pre>
            </div>
          </Section>

          <Section icon={<Users className="w-6 h-6 text-pink-400" />} title="8. Authentication & User Profiles">
            <p className="text-muted-foreground leading-relaxed mb-4">
              Authentication is handled via Replit's OpenID Connect provider, supporting login with <strong className="text-foreground">Google, GitHub, Apple, and email/password</strong>. User profiles are automatically created on first login and stored in the <code className="text-xs bg-white/10 px-1 py-0.5 rounded">users</code> table.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Sessions are stored server-side in PostgreSQL via <code className="text-xs bg-white/10 px-1 py-0.5 rounded">connect-pg-simple</code>, with automatic token refresh. Unauthenticated users see the landing page; authenticated users get access to the full dashboard, evaluation history, and chat features.
            </p>
          </Section>

          <Section icon={<Cpu className="w-6 h-6 text-emerald-400" />} title="9. How the Analysis Engine Works">
            <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
              <li><strong className="text-foreground">Ingestion:</strong> The user provides a source. For GitHub, the tool fetches the full repo tree via GitHub's REST API (up to 20 code files). For URLs, it fetches raw content. For paste, code is sent directly.</li>
              <li><strong className="text-foreground">Pattern Matching:</strong> The analyzer runs 20+ regex patterns against the codebase, grouped into three categories: <em>Dangerous Patterns</em> (eval, exec, prototype pollution), <em>Secret Patterns</em> (hardcoded keys, tokens), and <em>Quality Patterns</em> (empty catches, TODOs, console.log).</li>
              <li><strong className="text-foreground">Heuristic Checks:</strong> Additional checks for code length, comment density, error handling presence, and type annotation coverage.</li>
              <li><strong className="text-foreground">Scoring:</strong> Each finding has a severity weight. Scores start at 100 and are penalized per finding. The overall score is a weighted average: Safety (40%), Security (30%), Quality (30%).</li>
              <li><strong className="text-foreground">Report Generation:</strong> A summary is generated based on scores, and all findings are categorized as PASS, WARN, INFO, or CRITICAL.</li>
            </ol>
          </Section>

          <Section icon={<Settings className="w-6 h-6 text-purple-400" />} title="10. LLM Integration Guide">
            <p className="text-muted-foreground leading-relaxed mb-4">
              Click the <strong className="text-foreground">AI Provider</strong> button in the top navigation bar to configure your LLM backend.
            </p>
            
            <div className="bg-black/40 border border-white/5 rounded-xl p-6 mb-6">
              <h4 className="font-mono font-bold mb-3 text-foreground">Supported Providers:</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><strong className="text-primary">OpenAI:</strong> API key (sk-...) + model ID (e.g., gpt-4-turbo-preview, gpt-4o).</li>
                <li><strong className="text-primary">Anthropic:</strong> API key (sk-ant-...) + model ID (e.g., claude-3-opus-20240229).</li>
                <li><strong className="text-primary">AI Foundry:</strong> Target URI endpoint + optional API key. Uses OpenAI-compatible request format.</li>
                <li><strong className="text-primary">GCP Vertex AI:</strong> Project ID, Location (e.g., us-central1), and service account bearer token.</li>
                <li><strong className="text-primary">AWS Bedrock:</strong> AWS Region, Access Key ID, and Secret Access Key. Uses SigV4 authentication.</li>
              </ul>
            </div>

            <h4 className="font-mono font-bold mb-2 text-foreground">How the LLM is Used:</h4>
            <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
              <li>The tool bundles the raw skill code, the static analysis findings, and your chat prompt into a structured system prompt.</li>
              <li>This payload is sent server-side to your configured LLM via the appropriate provider API.</li>
              <li>The LLM returns a structured JSON response with fitness assessment, detailed report, and refined code.</li>
              <li>The chat maintains conversation history for follow-up questions and iterative refinement.</li>
            </ol>
          </Section>

          <Section icon={<GitBranch className="w-6 h-6 text-yellow-400" />} title="11. Technology Stack">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {[
                { label: "Frontend", items: "React 19, Tailwind CSS v4, Wouter, TanStack Query, Framer Motion, Radix UI" },
                { label: "Backend", items: "Express 5, Node.js, TypeScript" },
                { label: "Database", items: "PostgreSQL, Drizzle ORM" },
                { label: "Auth", items: "OpenID Connect (Passport.js), connect-pg-simple sessions" },
                { label: "LLM Support", items: "OpenAI, Anthropic, AI Foundry, GCP Vertex AI, AWS Bedrock" },
                { label: "Build", items: "Vite 7, esbuild, tsx" },
              ].map((item) => (
                <div key={item.label} className="bg-black/30 border border-white/5 rounded-lg p-4">
                  <h5 className="font-mono font-bold text-primary text-sm mb-1">{item.label}</h5>
                  <p className="text-xs text-muted-foreground">{item.items}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<FileText className="w-6 h-6 text-slate-400" />} title="12. License & Trademark">
            <p className="text-muted-foreground leading-relaxed">
              This application and all associated intellectual property are the property of <strong className="text-foreground">Taashi Manyanga</strong>. All rights reserved.
            </p>
            <p className="text-muted-foreground mt-2">
              &copy; Taashi Manyanga 2026
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="glass-panel rounded-2xl p-5 md:p-8 border-white/5"
    >
      <h2 className="text-lg md:text-2xl font-mono font-bold mb-4 md:mb-6 flex items-center border-b border-white/10 pb-3 md:pb-4">
        <div className="p-1.5 md:p-2 bg-white/5 rounded-lg mr-3 md:mr-4 border border-white/5 shadow-inner shrink-0">
          {icon}
        </div>
        <span className="break-words">{title}</span>
      </h2>
      <div className="text-base">
        {children}
      </div>
    </motion.section>
  );
}
