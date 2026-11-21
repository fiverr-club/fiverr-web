import {
  AI_AGENT_LESSONS,
  type AgentKnowledgeLesson,
} from "@/lib/ai-agent-knowledge";
import {
  CURATED_NEWS_PULSES,
  type TechNewsPulse,
} from "@/lib/reaction-bot";

export const GEMINI_MODELS = [
  "gemini-3-flash-preview",
  "gemini-flash-lite-latest",
  "gemini-3.8-flash",
] as const;

export function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Convert standard LLM Markdown into clean, well-formed Telegram HTML without unclosed tags.
 */
export function markdownToTelegramHtml(markdown: string, maxChars = 3900): string {
  const placeholders: string[] = [];

  // Extract fenced code blocks first so inner characters are escaped cleanly.
  let processed = markdown.replace(
    /```[a-zA-Z0-9_-]*\n?([\s\S]*?)```/g,
    (_match, code: string) => {
      const idx = placeholders.length;
      placeholders.push(`<pre><code>${escapeHtml(code.trimEnd())}</code></pre>`);
      return `@@TGPH_${idx}@@`;
    }
  );

  // Extract inline code spans next.
  processed = processed.replace(/`([^`\n]+)`/g, (_match, code: string) => {
    const idx = placeholders.length;
    placeholders.push(`<code>${escapeHtml(code)}</code>`);
    return `@@TGPH_${idx}@@`;
  });

  // Escape raw HTML in regular prose.
  processed = escapeHtml(processed);

  // Convert Markdown headings, bold, italic, and bullet markers cleanly.
  processed = processed.replace(/^#{1,6}\s+(.+)$/gm, "<b>$1</b>");
  processed = processed.replace(/\*\*([^\n*]+)\*\*/g, "<b>$1</b>");
  processed = processed.replace(/(^|[\s(])\*([^\s*\n][^*\n]*?)\*([\s).,!?:;]|$)/g, "$1<i>$2</i>$3");
  processed = processed.replace(/^\s*[-*]\s+/gm, "• ");

  // Restore code placeholders.
  processed = processed.replace(/@@TGPH_(\d+)@@/g, (_m, idxStr: string) => {
    return placeholders[Number(idxStr)] ?? "";
  });

  processed = processed.trim();
  if (processed.length <= maxChars) {
    return processed;
  }

  // Avoid cutting inside an open HTML tag or placeholder.
  const sliced = processed.slice(0, maxChars - 16);
  const lastNewline = sliced.lastIndexOf("\n");
  const safeCut = lastNewline > maxChars * 0.6 ? sliced.slice(0, lastNewline) : sliced;
  // Strip any dangling partial tag at cut boundary.
  const cleaned = safeCut.replace(/<[^>]*$/, "").trimEnd();
  return `${cleaned}\n\n<i>…(truncated)</i>`;
}

interface GeminiResponsePayload {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        thought?: boolean;
      }>;
    };
  }>;
  error?: { code?: number; message?: string; status?: string };
}

export async function callGeminiGenerateContent(params: {
  systemInstruction: string;
  prompt: string;
  responseMimeType?: "application/json" | "text/plain";
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
}): Promise<{ ok: boolean; text?: string; model?: string; error?: string }> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return { ok: false, error: "GEMINI_API_KEY is not configured." };
  }

  const errors: string[] = [];
  const timeoutMs = params.timeoutMs ?? 9000;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: params.systemInstruction }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: params.prompt }],
              },
            ],
            generationConfig: {
              temperature: params.temperature ?? 0.7,
              maxOutputTokens: params.maxOutputTokens ?? 1024,
              ...(params.responseMimeType
                ? { responseMimeType: params.responseMimeType }
                : {}),
            },
          }),
          signal: AbortSignal.timeout(timeoutMs),
          cache: "no-store",
        }
      );

      const data = (await response.json()) as GeminiResponsePayload;
      if (!response.ok || data.error) {
        errors.push(`${model}: ${data.error?.message || `HTTP ${response.status}`}`);
        continue;
      }

      const parts = data.candidates?.[0]?.content?.parts || [];
      const answerText = parts
        .filter((p) => !p.thought && typeof p.text === "string")
        .map((p) => p.text)
        .join("")
        .trim();

      if (!answerText) {
        errors.push(`${model}: empty candidate text`);
        continue;
      }

      return { ok: true, text: answerText, model };
    } catch (err) {
      errors.push(`${model}: ${err instanceof Error ? err.message : "request failed"}`);
    }
  }

  return {
    ok: false,
    error: errors.join(" | ") || "All Gemini models failed.",
  };
}

const VALID_CATEGORIES = new Set<AgentKnowledgeLesson["category"]>([
  "Architecture",
  "Tool Use & MCP",
  "Memory & RAG",
  "Multi-Agent",
  "Evals & Safety",
  "Production & Ops",
]);

export async function generateFreshAgentLessonWithGemini(
  seedLesson: AgentKnowledgeLesson,
  slot: number
): Promise<{ ok: boolean; lesson: AgentKnowledgeLesson; model?: string; error?: string }> {
  const prompt = [
    `Generate ONE fresh, deeply practical English engineering lesson for senior developers building AI Agents.`,
    `Track focus: "${seedLesson.category}" — inspired by (but do NOT copy verbatim) the theme "${seedLesson.title}".`,
    `Slot rotation index: #${slot} (vary your angle, failure mode, or implementation detail so each broadcast feels novel).`,
    ``,
    `Return strict JSON with this exact shape:`,
    `{`,
    `  "category": "Architecture" | "Tool Use & MCP" | "Memory & RAG" | "Multi-Agent" | "Evals & Safety" | "Production & Ops",`,
    `  "title": "Concise 8-14 word English title",`,
    `  "summary": "2 clear English sentences explaining why it matters in production",`,
    `  "keyPoints": ["Actionable takeaway 1", "Actionable takeaway 2", "Actionable takeaway 3"],`,
    `  "codeSnippet": "Concise 3-6 line TypeScript or Python pattern (no markdown backticks)",`,
    `  "antiPattern": "1 sharp English sentence describing a common mistake to avoid",`,
    `  "tags": ["TagOne", "TagTwo", "TagThree"]`,
    `}`,
  ].join("\n");

  const res = await callGeminiGenerateContent({
    systemInstruction:
      "You are a principal AI Systems & Agent Architect writing crisp, strictly English, production-tested engineering briefings. Output valid JSON only.",
    prompt,
    responseMimeType: "application/json",
    temperature: 0.85,
    maxOutputTokens: 900,
    timeoutMs: 9500,
  });

  if (!res.ok || !res.text) {
    return { ok: false, lesson: seedLesson, error: res.error };
  }

  try {
    const cleanJson = res.text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(cleanJson) as Partial<AgentKnowledgeLesson>;

    if (
      typeof parsed.title !== "string" ||
      parsed.title.trim().length < 8 ||
      typeof parsed.summary !== "string" ||
      parsed.summary.trim().length < 20 ||
      !Array.isArray(parsed.keyPoints) ||
      parsed.keyPoints.length < 2 ||
      typeof parsed.antiPattern !== "string" ||
      parsed.antiPattern.trim().length < 10
    ) {
      return { ok: false, lesson: seedLesson, error: "Incomplete Gemini JSON payload." };
    }

    const category =
      parsed.category && VALID_CATEGORIES.has(parsed.category)
        ? parsed.category
        : seedLesson.category;

    const generatedLesson: AgentKnowledgeLesson = {
      id: `${seedLesson.id}-gemini-${Date.now()}`,
      category,
      title: parsed.title.trim(),
      summary: parsed.summary.trim(),
      keyPoints: parsed.keyPoints
        .filter((k): k is string => typeof k === "string" && k.trim().length > 0)
        .slice(0, 4),
      codeSnippet:
        typeof parsed.codeSnippet === "string" && parsed.codeSnippet.trim().length > 0
          ? parsed.codeSnippet.replace(/^```[a-z]*\n?|\n?```$/g, "").trim()
          : seedLesson.codeSnippet,
      antiPattern: parsed.antiPattern.trim(),
      tags: Array.isArray(parsed.tags)
        ? parsed.tags
            .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
            .map((t) => t.replace(/^#+/, "").replace(/[^a-zA-Z0-9]/g, ""))
            .filter(Boolean)
            .slice(0, 4)
        : seedLesson.tags,
    };

    return {
      ok: true,
      lesson: generatedLesson,
      model: res.model,
    };
  } catch (err) {
    return {
      ok: false,
      lesson: seedLesson,
      error: err instanceof Error ? err.message : "Failed to parse Gemini JSON.",
    };
  }
}

export async function askGeminiAgentTutor(params: {
  question: string;
  senderName?: string;
  replyToText?: string;
}): Promise<{ ok: boolean; htmlText: string; model?: string; error?: string }> {
  const cleanQuestion = params.question.trim();
  if (!cleanQuestion) {
    return {
      ok: false,
      htmlText:
        "Please include your question! Example: <code>/ask How do I make agent tool calls idempotent?</code>",
    };
  }

  const userPromptParts = [
    params.senderName ? `Developer asking: ${params.senderName}` : null,
    params.replyToText
      ? `Previous message context being replied to:\n"""\n${params.replyToText.slice(0, 800)}\n"""`
      : null,
    `Question: ${cleanQuestion}`,
  ].filter(Boolean);

  const res = await callGeminiGenerateContent({
    systemInstruction: [
      "You are AI Agent Programming Bot (@agent_programming_bot), a friendly senior AI Agent Engineer helping developers in the Dev Community Telegram group and DMs.",
      "ALWAYS reply strictly in clear, practical technical English (even if greeted briefly).",
      "Focus on actionable engineering guidance covering AI Agents, Tool Calling, MCP, Hybrid RAG, Memory architectures, Multi-Agent orchestration, Evals, Security, and TypeScript/Python patterns.",
      "Keep responses concise (around 150-320 words), well-formatted with bullet points and brief code snippets when useful, and directly answer the user's question without fluff.",
    ].join(" "),
    prompt: userPromptParts.join("\n\n"),
    responseMimeType: "text/plain",
    temperature: 0.65,
    maxOutputTokens: 1100,
    timeoutMs: 11000,
  });

  if (!res.ok || !res.text) {
    const fallbackLesson = AI_AGENT_LESSONS[Math.floor(Math.random() * AI_AGENT_LESSONS.length)];
    return {
      ok: false,
      error: res.error,
      htmlText: [
        `⚠️ <b>AI engine is briefly busy right now</b> — here is a curated quick tip while it recovers:`,
        ``,
        `📌 <b>${escapeHtml(fallbackLesson.title)}</b>`,
        `💡 ${escapeHtml(fallbackLesson.summary)}`,
        `⚠️ <i>Avoid: ${escapeHtml(fallbackLesson.antiPattern)}</i>`,
      ].join("\n"),
    };
  }

  return {
    ok: true,
    model: res.model,
    htmlText: markdownToTelegramHtml(res.text),
  };
}

const VALID_NEWS_CATEGORIES = new Set<TechNewsPulse["category"]>([
  "AI & Models",
  "DevTools & Cloud",
  "Web & Frontend",
  "Open Source",
  "Backend & Systems",
  "Community & Jobs",
]);

export async function generateFreshTechNewsPulseWithGemini(
  seedPulse: TechNewsPulse,
  slot: number,
  topicOverride?: string
): Promise<{ ok: boolean; pulse: TechNewsPulse; model?: string; error?: string }> {
  const focusLine = topicOverride?.trim()
    ? `Focus specifically on this requested developer/tech topic: "${topicOverride.trim()}".`
    : `Category focus: "${seedPulse.category}" — inspired by (do NOT copy verbatim) "${seedPulse.title}".`;

  const prompt = [
    `Write ONE crisp, high-energy developer news & engineering trend pulse for a Telegram tech community (@devcommunity101).`,
    focusLine,
    `Slot index: #${slot} (vary angle and insights so every post feels fresh and engaging).`,
    ``,
    `Return strict JSON with this exact shape:`,
    `{`,
    `  "category": "AI & Models" | "DevTools & Cloud" | "Web & Frontend" | "Open Source" | "Backend & Systems" | "Community & Jobs",`,
    `  "title": "Punchy 7-13 word headline",`,
    `  "summary": "2 concise, insightful sentences explaining why builders care right now",`,
    `  "highlights": ["Crisp bullet 1", "Crisp bullet 2", "Crisp bullet 3"],`,
    `  "discussionPrompt": "1 short engaging question to spark replies and reactions in chat",`,
    `  "tags": ["TagOne", "TagTwo", "TagThree"]`,
    `}`,
  ].join("\n");

  const res = await callGeminiGenerateContent({
    systemInstruction:
      "You are Reaction News Bot (@reaction_news_bot), an energetic senior tech editor curating sharp, practical developer news pulses for engineers. Output valid JSON only.",
    prompt,
    responseMimeType: "application/json",
    temperature: 0.85,
    maxOutputTokens: 700,
    timeoutMs: 9000,
  });

  if (!res.ok || !res.text) {
    return { ok: false, pulse: seedPulse, error: res.error };
  }

  try {
    const cleanJson = res.text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(cleanJson) as Partial<TechNewsPulse>;

    if (
      typeof parsed.title !== "string" ||
      parsed.title.trim().length < 8 ||
      typeof parsed.summary !== "string" ||
      parsed.summary.trim().length < 20 ||
      !Array.isArray(parsed.highlights) ||
      parsed.highlights.length < 2
    ) {
      return { ok: false, pulse: seedPulse, error: "Incomplete Gemini news JSON." };
    }

    const category =
      parsed.category && VALID_NEWS_CATEGORIES.has(parsed.category)
        ? parsed.category
        : seedPulse.category;

    const generated: TechNewsPulse = {
      id: `${seedPulse.id}-gemini-${Date.now()}`,
      category,
      title: parsed.title.trim(),
      summary: parsed.summary.trim(),
      highlights: parsed.highlights
        .filter((h): h is string => typeof h === "string" && h.trim().length > 0)
        .slice(0, 3),
      discussionPrompt:
        typeof parsed.discussionPrompt === "string" && parsed.discussionPrompt.trim().length > 5
          ? parsed.discussionPrompt.trim()
          : seedPulse.discussionPrompt,
      tags: Array.isArray(parsed.tags)
        ? parsed.tags
            .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
            .map((t) => t.replace(/^#+/, "").replace(/[^a-zA-Z0-9]/g, ""))
            .filter(Boolean)
            .slice(0, 4)
        : seedPulse.tags,
    };

    return { ok: true, pulse: generated, model: res.model };
  } catch (err) {
    return {
      ok: false,
      pulse: seedPulse,
      error: err instanceof Error ? err.message : "Failed to parse Gemini news JSON.",
    };
  }
}

export async function askGeminiReactionBuddy(params: {
  message: string;
  senderName?: string;
  replyToText?: string;
}): Promise<{ ok: boolean; htmlText: string; model?: string; error?: string }> {
  const cleanMessage = params.message.trim();
  if (!cleanMessage) {
    return {
      ok: false,
      htmlText:
        "🔥 Hey! Tag me with any tech topic, or try <code>/hype 10</code>, <code>/news</code>, or <code>/vibe</code>!",
    };
  }

  const userPromptParts = [
    params.senderName ? `Community member: ${params.senderName}` : null,
    params.replyToText
      ? `Message being replied to:\n"""\n${params.replyToText.slice(0, 600)}\n"""`
      : null,
    `Message: ${cleanMessage}`,
  ].filter(Boolean);

  const res = await callGeminiGenerateContent({
    systemInstruction: [
      "You are Reaction News Bot (@reaction_news_bot), an upbeat, friendly community engagement & tech news bot in Dev Community Telegram group.",
      "Reply naturally in the same language as the user's message (Vietnamese if they write Vietnamese, English if they write English).",
      "Keep replies punchy, warm, helpful, and concise (under 140 words), with 1-3 tasteful emojis and practical tech/community insight.",
    ].join(" "),
    prompt: userPromptParts.join("\n\n"),
    responseMimeType: "text/plain",
    temperature: 0.75,
    maxOutputTokens: 500,
    timeoutMs: 9000,
  });

  if (!res.ok || !res.text) {
    const fallback =
      CURATED_NEWS_PULSES[Math.floor(Math.random() * CURATED_NEWS_PULSES.length)];
    return {
      ok: false,
      error: res.error,
      htmlText: [
        `🔥 <b>Always hyped to chat!</b>`,
        ``,
        `📰 Quick pulse: <b>${escapeHtml(fallback.title)}</b>`,
        `💡 ${escapeHtml(fallback.summary)}`,
        ``,
        `Try <code>/hype 10</code> to blast reactions across the latest 10 posts, or <code>/news</code> for a fresh pulse!`,
      ].join("\n"),
    };
  }

  return {
    ok: true,
    model: res.model,
    htmlText: markdownToTelegramHtml(res.text),
  };
}
