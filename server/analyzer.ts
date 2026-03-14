interface AnalysisResult {
  safetyScore: number;
  qualityScore: number;
  securityScore: number;
  overallScore: number;
  summary: string;
  safetyFindings: string[];
  qualityFindings: string[];
  securityFindings: string[];
}

const DANGEROUS_PATTERNS = [
  { pattern: /eval\s*\(/g, msg: "Use of eval() detected — potential code injection risk", severity: 15 },
  { pattern: /new\s+Function\s*\(/g, msg: "Dynamic Function constructor found — potential code injection", severity: 12 },
  { pattern: /child_process/g, msg: "child_process module referenced — potential command execution", severity: 10 },
  { pattern: /exec\s*\(/g, msg: "exec() call detected — potential command injection", severity: 10 },
  { pattern: /execSync\s*\(/g, msg: "execSync() call detected — synchronous command execution risk", severity: 12 },
  { pattern: /spawn\s*\(/g, msg: "spawn() call detected — subprocess creation", severity: 8 },
  { pattern: /__proto__/g, msg: "Prototype pollution vector: __proto__ reference found", severity: 10 },
  { pattern: /\.constructor\s*\[/g, msg: "Prototype pollution via constructor access", severity: 10 },
  { pattern: /process\.env/g, msg: "Direct process.env access — ensure no sensitive data leakage", severity: 3 },
  { pattern: /document\.write/g, msg: "document.write() usage — XSS risk in browser context", severity: 8 },
  { pattern: /innerHTML\s*=/g, msg: "Direct innerHTML assignment — potential XSS vulnerability", severity: 7 },
  { pattern: /dangerouslySetInnerHTML/g, msg: "React dangerouslySetInnerHTML used — sanitize inputs", severity: 6 },
];

const SECRET_PATTERNS = [
  { pattern: /['"]sk-[a-zA-Z0-9]{20,}['"]/g, msg: "Hardcoded OpenAI API key detected", severity: 20 },
  { pattern: /['"]sk-ant-[a-zA-Z0-9]{20,}['"]/g, msg: "Hardcoded Anthropic API key detected", severity: 20 },
  { pattern: /['"]AKIA[A-Z0-9]{16}['"]/g, msg: "Hardcoded AWS Access Key ID detected", severity: 20 },
  { pattern: /['"]ghp_[a-zA-Z0-9]{36}['"]/g, msg: "Hardcoded GitHub personal access token detected", severity: 20 },
  { pattern: /['"]glpat-[a-zA-Z0-9\-_]{20,}['"]/g, msg: "Hardcoded GitLab token detected", severity: 20 },
  { pattern: /password\s*[:=]\s*['"][^'"]{6,}['"]/gi, msg: "Possible hardcoded password found", severity: 15 },
  { pattern: /secret\s*[:=]\s*['"][^'"]{6,}['"]/gi, msg: "Possible hardcoded secret found", severity: 15 },
  { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]{10,}['"]/gi, msg: "Possible hardcoded API key found", severity: 15 },
  { pattern: /Bearer\s+[A-Za-z0-9\-._~+\/]+=*/g, msg: "Hardcoded Bearer token detected", severity: 15 },
];

const QUALITY_CHECKS = [
  { pattern: /catch\s*\(\s*\)\s*\{/g, msg: "Empty catch block — errors are silently swallowed", severity: 8 },
  { pattern: /catch\s*\(\s*\w+\s*\)\s*\{\s*\}/g, msg: "Catch block with no error handling logic", severity: 8 },
  { pattern: /console\.log/g, msg: "console.log statement found — use proper logging in production", severity: 3 },
  { pattern: /TODO|FIXME|HACK|XXX/gi, msg: "Unresolved TODO/FIXME marker found", severity: 5 },
  { pattern: /any\b/g, msg: "TypeScript 'any' type usage — weakens type safety", severity: 4 },
  { pattern: /\/\/\s*@ts-ignore/g, msg: "@ts-ignore directive suppressing type checks", severity: 6 },
  { pattern: /\/\/\s*eslint-disable/g, msg: "ESLint disable directive found — rule violations ignored", severity: 4 },
];

export function analyzeCode(code: string): AnalysisResult {
  const safetyFindings: string[] = [];
  const securityFindings: string[] = [];
  const qualityFindings: string[] = [];

  let safetyPenalty = 0;
  let securityPenalty = 0;
  let qualityPenalty = 0;

  for (const check of DANGEROUS_PATTERNS) {
    const matches = code.match(check.pattern);
    if (matches) {
      safetyFindings.push(`[WARN] ${check.msg} (${matches.length} occurrence${matches.length > 1 ? 's' : ''})`);
      safetyPenalty += check.severity * Math.min(matches.length, 3);
    }
  }

  for (const check of SECRET_PATTERNS) {
    const matches = code.match(check.pattern);
    if (matches) {
      securityFindings.push(`[CRITICAL] ${check.msg} (${matches.length} occurrence${matches.length > 1 ? 's' : ''})`);
      securityPenalty += check.severity * Math.min(matches.length, 3);
    }
  }

  for (const check of QUALITY_CHECKS) {
    const matches = code.match(check.pattern);
    if (matches) {
      qualityFindings.push(`[INFO] ${check.msg} (${matches.length} occurrence${matches.length > 1 ? 's' : ''})`);
      qualityPenalty += check.severity * Math.min(matches.length, 3);
    }
  }

  const lines = code.split("\n");
  const totalLines = lines.length;

  if (totalLines < 10) {
    qualityFindings.push("[WARN] Very short codebase — may be incomplete or a stub");
    qualityPenalty += 15;
  }

  const commentLines = lines.filter(l => l.trim().startsWith("//") || l.trim().startsWith("*") || l.trim().startsWith("/*")).length;
  const commentRatio = totalLines > 0 ? commentLines / totalLines : 0;
  if (commentRatio < 0.05 && totalLines > 20) {
    qualityFindings.push("[INFO] Very low comment density — consider adding documentation");
    qualityPenalty += 5;
  }

  const hasErrorHandling = /try\s*\{/.test(code) || /\.catch\s*\(/.test(code);
  if (!hasErrorHandling && totalLines > 30) {
    qualityFindings.push("[WARN] No try/catch or .catch() error handling found");
    qualityPenalty += 10;
  }

  const hasTypeAnnotations = /:\s*(string|number|boolean|void|any|Promise|Array)/.test(code);
  if (!hasTypeAnnotations && totalLines > 20) {
    qualityFindings.push("[INFO] No type annotations detected — consider adding TypeScript types");
    qualityPenalty += 5;
  }

  if (safetyFindings.length === 0) safetyFindings.push("[PASS] No dangerous patterns detected");
  if (securityFindings.length === 0) securityFindings.push("[PASS] No exposed secrets or credentials found");
  if (qualityFindings.length === 0) qualityFindings.push("[PASS] Code quality checks passed");

  const safetyScore = Math.max(0, Math.min(100, 100 - safetyPenalty));
  const securityScore = Math.max(0, Math.min(100, 100 - securityPenalty));
  const qualityScore = Math.max(0, Math.min(100, 100 - qualityPenalty));
  const overallScore = Math.round(safetyScore * 0.4 + securityScore * 0.3 + qualityScore * 0.3);

  const isPassing = overallScore >= 80;
  const summary = isPassing
    ? `The analyzed skill demonstrates a solid foundation with ${safetyFindings.length <= 1 ? 'strong' : 'moderate'} safety practices. ${securityFindings.length <= 1 ? 'No critical security issues' : 'Some security concerns'} were detected. The code is generally suitable for deployment with ${qualityFindings.length <= 1 ? 'minimal' : 'some'} quality improvements recommended.`
    : `The analyzed skill has notable concerns that should be addressed before production use. ${safetyPenalty > 20 ? 'Safety issues require immediate attention. ' : ''}${securityPenalty > 20 ? 'Critical security vulnerabilities were found. ' : ''}${qualityPenalty > 20 ? 'Significant quality improvements are needed. ' : ''}Review the detailed findings below.`;

  return {
    safetyScore,
    qualityScore,
    securityScore,
    overallScore,
    summary,
    safetyFindings,
    qualityFindings,
    securityFindings,
  };
}
