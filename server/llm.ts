import OpenAI from "openai";
import type { ProviderConfig } from "@shared/schema";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callDefaultLLM(messages: ChatMessage[]): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  const res = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages,
    max_completion_tokens: 4096,
  });

  return res.choices[0]?.message?.content || "";
}

export async function callLLM(config: ProviderConfig, messages: ChatMessage[]): Promise<string> {
  switch (config.provider) {
    case "openai":
      return callOpenAI(config, messages);
    case "anthropic":
      return callAnthropic(config, messages);
    case "foundry":
      return callFoundry(config, messages);
    case "vertex":
      return callVertex(config, messages);
    case "bedrock":
      return callBedrock(config, messages);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

async function callOpenAI(config: ProviderConfig, messages: ChatMessage[]): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || "gpt-4-turbo-preview",
      messages,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callAnthropic(config: ProviderConfig, messages: ChatMessage[]): Promise<string> {
  const systemMsg = messages.find(m => m.role === "system")?.content || "";
  const nonSystemMessages = messages.filter(m => m.role !== "system");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model || "claude-3-opus-20240229",
      max_tokens: 4096,
      system: systemMsg,
      messages: nonSystemMessages.map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i, /^127\.\d+\.\d+\.\d+$/, /^0\.0\.0\.0$/,
  /^10\.\d+\.\d+\.\d+$/, /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/, /^169\.254\.\d+\.\d+$/,
  /^metadata\.google\.internal$/i, /^\[::1?\]$/,
];

function isOutboundUrlSafe(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:") return false;
    for (const p of BLOCKED_HOST_PATTERNS) {
      if (p.test(parsed.hostname)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function callFoundry(config: ProviderConfig, messages: ChatMessage[]): Promise<string> {
  if (!config.targetUri) throw new Error("AI Foundry requires a Target URI");
  if (!isOutboundUrlSafe(config.targetUri)) {
    throw new Error("Target URI is blocked for security reasons. Only public HTTPS URLs are allowed.");
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`;

  const res = await fetch(config.targetUri, {
    method: "POST",
    headers,
    redirect: "error",
    body: JSON.stringify({
      messages,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI Foundry API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || data.content?.[0]?.text || JSON.stringify(data);
}

async function callVertex(config: ProviderConfig, messages: ChatMessage[]): Promise<string> {
  if (!config.projectId || !config.apiKey) {
    throw new Error("Vertex AI requires Project ID and Service Account Key");
  }

  const location = config.location || "us-central1";
  const model = config.model || "gemini-1.5-pro";
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      contents: messages
        .filter(m => m.role !== "system")
        .map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      systemInstruction: {
        parts: [{ text: messages.find(m => m.role === "system")?.content || "" }],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vertex AI error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callBedrock(config: ProviderConfig, messages: ChatMessage[]): Promise<string> {
  if (!config.accessKeyId || !config.secretAccessKey) {
    throw new Error("AWS Bedrock requires Access Key ID and Secret Access Key");
  }

  const region = config.region || "us-east-1";
  const model = config.model || "anthropic.claude-3-sonnet-20240229-v1:0";
  const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${model}/invoke`;

  const systemMsg = messages.find(m => m.role === "system")?.content || "";
  const nonSystemMessages = messages.filter(m => m.role !== "system");

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    system: systemMsg,
    messages: nonSystemMessages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  });

  const encoder = new TextEncoder();
  const payloadHash = await crypto.subtle.digest("SHA-256", encoder.encode(body));
  const hashHex = Array.from(new Uint8Array(payloadHash)).map(b => b.toString(16).padStart(2, "0")).join("");

  const now = new Date();
  const dateStamp = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 8);
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const credentialScope = `${dateStamp}/${region}/bedrock/aws4_request`;

  const canonicalHeaders = `content-type:application/json\nhost:bedrock-runtime.${region}.amazonaws.com\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-date";
  const canonicalRequest = `POST\n/model/${model}/invoke\n\n${canonicalHeaders}\n${signedHeaders}\n${hashHex}`;

  const canonicalRequestHash = await crypto.subtle.digest("SHA-256", encoder.encode(canonicalRequest));
  const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash)).map(b => b.toString(16).padStart(2, "0")).join("");

  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHashHex}`;

  async function hmacSha256(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  }

  const kDate = await hmacSha256(encoder.encode(`AWS4${config.secretAccessKey}`), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, "bedrock");
  const kSigning = await hmacSha256(kService, "aws4_request");
  const signature = Array.from(new Uint8Array(await hmacSha256(kSigning, stringToSign))).map(b => b.toString(16).padStart(2, "0")).join("");

  const authHeader = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Amz-Date": amzDate,
      "Authorization": authHeader,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AWS Bedrock error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "";
}
