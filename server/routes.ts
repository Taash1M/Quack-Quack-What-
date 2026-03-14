import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProviderConfigSchema } from "@shared/schema";
import { analyzeCode } from "./analyzer";
import { callLLM, callDefaultLLM } from "./llm";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

const BLOCKED_HOSTS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^fc00:/i,
  /^fe80:/i,
  /^::1$/,
  /^metadata\.google/i,
  /^metadata\.aws/i,
];

function isUrlSafe(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    const hostname = parsed.hostname;
    for (const pattern of BLOCKED_HOSTS) {
      if (pattern.test(hostname)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function sanitizeErrorMessage(error: any): string {
  const msg = error?.message || "An unexpected error occurred";
  const clean = msg
    .replace(/sk-[a-zA-Z0-9]+/g, "sk-***")
    .replace(/sk-ant-[a-zA-Z0-9]+/g, "sk-ant-***")
    .replace(/AKIA[A-Z0-9]+/g, "AKIA***")
    .replace(/Bearer\s+[^\s]+/g, "Bearer ***");
  return clean.length > 200 ? clean.slice(0, 200) + "..." : clean;
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 30;

function rateLimit(identifier: string): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 10000) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }
  const entry = rateLimitMap.get(identifier);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use("/api", (req: any, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const userId = req.user?.claims?.sub;
    const identifier = userId || ip;
    if (rateLimit(identifier)) {
      return res.status(429).json({ message: "Too many requests. Please try again later." });
    }
    next();
  });

  await setupAuth(app);
  registerAuthRoutes(app);

  app.get("/api/provider-config", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const config = await storage.getProviderConfig(userId);
    if (!config) return res.json(null);
    const safe = {
      provider: config.provider,
      model: config.model,
      hasApiKey: !!config.apiKey,
      hasAccessKey: !!config.accessKeyId,
      hasSecretKey: !!config.secretAccessKey,
    };
    return res.json(safe);
  });

  app.post("/api/provider-config", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const parsed = insertProviderConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid configuration format" });
    }
    if (parsed.data.targetUri) {
      if (!isUrlSafe(parsed.data.targetUri)) {
        return res.status(400).json({ message: "Invalid or blocked Target URI. Only public HTTPS URLs are allowed." });
      }
      try {
        const parsedUrl = new URL(parsed.data.targetUri);
        if (parsedUrl.protocol !== "https:") {
          return res.status(400).json({ message: "Target URI must use HTTPS." });
        }
      } catch {
        return res.status(400).json({ message: "Invalid Target URI format." });
      }
    }
    const config = await storage.upsertProviderConfig(userId, parsed.data);
    return res.json({ success: true, provider: config.provider });
  });

  app.post("/api/fetch-skill", async (req, res) => {
    const { source, sourceType } = req.body;
    if (!source || typeof source !== "string") {
      return res.status(400).json({ message: "Source is required" });
    }

    try {
      let code = "";

      if (sourceType === "github") {
        code = await fetchFromGitHub(source);
      } else if (sourceType === "url") {
        if (!isUrlSafe(source)) {
          return res.status(400).json({ message: "Invalid or blocked URL. Only public HTTP/HTTPS URLs are allowed." });
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          const response = await fetch(source, {
            signal: controller.signal,
            redirect: "error",
            headers: { "User-Agent": "QuackQuackWhat/1.0" },
          });
          clearTimeout(timeout);
          if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status}`);
          const contentLength = response.headers.get("content-length");
          if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
            throw new Error("File too large (max 5MB)");
          }
          code = (await response.text()).slice(0, 5 * 1024 * 1024);
        } catch (err: any) {
          clearTimeout(timeout);
          throw err;
        }
      } else if (sourceType === "local") {
        if (source.length > 5 * 1024 * 1024) {
          return res.status(400).json({ message: "Code too large (max 5MB)" });
        }
        code = source;
      } else {
        return res.status(400).json({ message: "Invalid source type" });
      }

      return res.json({ code });
    } catch (error: any) {
      return res.status(500).json({ message: sanitizeErrorMessage(error) });
    }
  });

  app.post("/api/evaluate", async (req: any, res) => {
    const { source, sourceType, code } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ message: "Code is required for evaluation" });
    }

    if (code.length > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "Code too large (max 5MB)" });
    }

    const analysis = analyzeCode(code);

    const userId = req.user?.claims?.sub || null;

    const evaluation = await storage.createEvaluation({
      source: (source || "direct-input").slice(0, 500),
      sourceType: (sourceType || "local").slice(0, 20),
      skillCode: code,
      userId,
      ...analysis,
    });

    return res.json(evaluation);
  });

  app.get("/api/evaluations", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const evaluations = await storage.getEvaluationsByUser(userId);
    return res.json(evaluations);
  });

  app.get("/api/evaluations/:id", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const evaluation = await storage.getEvaluation(req.params.id);
    if (!evaluation || evaluation.userId !== userId) {
      return res.status(404).json({ message: "Evaluation not found" });
    }
    return res.json(evaluation);
  });

  app.get("/api/history", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const evaluations = await storage.getEvaluationsByUser(userId);
    return res.json(evaluations);
  });

  const chatSchema = z.object({
    message: z.string().min(1).max(10000),
    skillCode: z.string().max(5 * 1024 * 1024).optional(),
    evaluationSummary: z.string().max(10000).optional(),
    conversationHistory: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().max(50000),
    })).max(50).optional(),
  });

  app.post("/api/chat", async (req: any, res) => {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid request format" });
    }

    const { message, skillCode, evaluationSummary, conversationHistory } = parsed.data;

    const systemPrompt = `You are an expert AI skill evaluation assistant. Your role is to analyze AI agent skills and provide feedback on their safety, quality, security and fitness for purpose.

When the user describes a use case, you must:
1. Assess if the skill code is fit for the described purpose
2. Provide short-form feedback (2-3 sentences) about fitness
3. Provide a detailed analysis report covering performance, safety, and security improvements
4. Generate a refined version of the code that has been cleaned for safety, optimized for performance, and tuned for the described use case

IMPORTANT: Always respond with valid JSON in this exact format:
{
  "fit": "Good" | "Moderate" | "Poor",
  "feedback": "Short 2-3 sentence assessment",
  "report": "Detailed multi-paragraph analysis",
  "refinedCode": "The complete refined code"
}

${skillCode ? `\n--- SKILL CODE BEING EVALUATED ---\n${skillCode}\n--- END CODE ---` : ''}
${evaluationSummary ? `\n--- EVALUATION SUMMARY ---\n${evaluationSummary}\n--- END SUMMARY ---` : ''}`;

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    if (conversationHistory) {
      for (const msg of conversationHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: "user", content: message });

    try {
      let response: string;

      const userId = req.user?.claims?.sub;
      let userConfig = userId ? await storage.getProviderConfig(userId) : null;
      const hasCustomCredentials = userConfig && (
        (userConfig.provider === "bedrock" && userConfig.accessKeyId && userConfig.secretAccessKey) ||
        (userConfig.provider === "foundry" && userConfig.targetUri) ||
        (userConfig.apiKey)
      );

      if (hasCustomCredentials && userConfig) {
        response = await callLLM(userConfig, messages);
      } else {
        response = await callDefaultLLM(messages);
      }

      let result;
      try {
        result = JSON.parse(response);
      } catch {
        result = {
          fit: "Unknown",
          feedback: response.slice(0, 200),
          report: response,
          refinedCode: null,
        };
      }

      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ message: sanitizeErrorMessage(error) });
    }
  });

  app.get("/api/download-docs", (_req, res) => {
    const filePath = `${process.cwd()}/docs/quack-quack-what-documentation.zip`;
    res.download(filePath, "quack-quack-what-documentation.zip", (err) => {
      if (err) {
        res.status(404).json({ message: "Documentation archive not found" });
      }
    });
  });

  return httpServer;
}

async function fetchFromGitHub(repo: string): Promise<string> {
  const cleanRepo = repo.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").replace(/\/$/, "");
  const parts = cleanRepo.split("/");
  if (parts.length < 2) throw new Error("Invalid GitHub repository format. Use: owner/repo");

  const owner = parts[0].replace(/[^a-zA-Z0-9\-_]/g, "");
  const repoName = parts[1].replace(/[^a-zA-Z0-9\-_.]/g, "");
  const path = parts.slice(2).join("/");

  if (!owner || !repoName) throw new Error("Invalid GitHub repository format");

  const apiBase = `https://api.github.com/repos/${owner}/${repoName}`;

  if (path) {
    const safePath = path.replace(/\.\./g, "");
    const fileRes = await fetch(`${apiBase}/contents/${safePath}`, {
      headers: { "Accept": "application/vnd.github.v3.raw", "User-Agent": "QuackQuackWhat/1.0" },
    });
    if (!fileRes.ok) throw new Error(`GitHub API error: ${fileRes.status}`);
    return (await fileRes.text()).slice(0, 5 * 1024 * 1024);
  }

  const treeRes = await fetch(`${apiBase}/git/trees/main?recursive=1`, {
    headers: { "Accept": "application/vnd.github.v3+json", "User-Agent": "QuackQuackWhat/1.0" },
  });

  let treeData;
  if (!treeRes.ok) {
    const masterRes = await fetch(`${apiBase}/git/trees/master?recursive=1`, {
      headers: { "Accept": "application/vnd.github.v3+json", "User-Agent": "QuackQuackWhat/1.0" },
    });
    if (!masterRes.ok) throw new Error(`Could not access repository: ${masterRes.status}`);
    treeData = await masterRes.json();
  } else {
    treeData = await treeRes.json();
  }

  if (!treeData?.tree || !Array.isArray(treeData.tree)) {
    throw new Error("Invalid repository structure");
  }

  const codeFiles = treeData.tree
    .filter((f: any) => f.type === "blob" && /\.(ts|js|py|md|json|yaml|yml)$/i.test(f.path))
    .slice(0, 20);

  const codeChunks: string[] = [];
  for (const file of codeFiles) {
    try {
      const contentRes = await fetch(`${apiBase}/contents/${file.path}`, {
        headers: { "Accept": "application/vnd.github.v3.raw", "User-Agent": "QuackQuackWhat/1.0" },
      });
      if (contentRes.ok) {
        const content = (await contentRes.text()).slice(0, 500000);
        codeChunks.push(`// === FILE: ${file.path} ===\n${content}`);
      }
    } catch {}
  }

  if (codeChunks.length === 0) throw new Error("No readable code files found in repository");

  return codeChunks.join("\n\n");
}
