import { NextRequest, NextResponse } from "next/server";
import { callGeminiGenerateContent, getGeminiApiKey } from "@/lib/gemini";

export const dynamic = "force-dynamic";

interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  let body: {
    message?: string;
    mode?: "scoping" | "engineering";
    history?: ChatMessageInput[];
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ ok: false, error: "Message is required." }, { status: 400 });
  }
  if (message.length > 2500) {
    return NextResponse.json(
      { ok: false, error: "Message is too long (max 2,500 characters)." },
      { status: 400 }
    );
  }

  const mode = body.mode === "scoping" ? "scoping" : "engineering";
  const recentHistory = Array.isArray(body.history)
    ? body.history
        .filter(
          (item): item is ChatMessageInput =>
            (item?.role === "user" || item?.role === "assistant") &&
            typeof item?.content === "string" &&
            item.content.trim().length > 0
        )
        .slice(-6)
    : [];

  const historyContext =
    recentHistory.length > 0
      ? `Recent conversation:\n${recentHistory
          .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content.slice(0, 600)}`)
          .join("\n")}\n\n`
      : "";

  const systemInstruction =
    mode === "scoping"
      ? [
          "You are FIVERREX AI Project & Proposal Copilot on fiverrex.vercel.app.",
          "Help clients scope technical projects into 3 milestone-backed Escrow tiers (Basic / Standard / Premium) with realistic USD budgets, timelines, and deliverables, OR help freelancers craft sharp winning bid proposals.",
          "Reply clearly in English using concise headings and bullet points (150-320 words). Mention relevant FIVERREX workflows like /jobs, /quests (+500 credits), or Milestone Escrow when helpful.",
        ].join(" ")
      : [
          "You are FIVERREX AI Agent Engineering Copilot (the web companion to @agent_programming_bot in @devcommunity101).",
          "Give concise, production-tested engineering guidance on AI Agents, MCP, Tool Calling, Hybrid RAG, Memory tiers, Multi-Agent orchestration, Evals, Next.js 15, and Spring Boot 3 DDD microservices.",
          "Reply in crisp technical English (150-320 words) with structured bullets and short code snippets when appropriate.",
        ].join(" ");

  if (!getGeminiApiKey()) {
    return NextResponse.json({
      ok: true,
      source: "fallback",
      reply:
        "FIVERREX AI Copilot is currently running in offline guidance mode.\n\nRecommended next steps:\n• Browse 500+ open projects on /jobs and estimate 3 clear Escrow milestones (Architecture → Core Build & Tests → Deployment).\n• Complete Telegram quests on /quests to unlock +500 free bidding credits.\n• Chat live with @agent_programming_bot on Telegram for continuous AI Agent engineering tips.",
    });
  }

  const ai = await callGeminiGenerateContent({
    systemInstruction,
    prompt: `${historyContext}User: ${message}`,
    temperature: 0.65,
    maxOutputTokens: 1024,
    timeoutMs: 11000,
  });

  if (!ai.ok || !ai.text) {
    return NextResponse.json({
      ok: true,
      source: "fallback",
      reply:
        "The Gemini model is experiencing momentary high load. Here is a quick checklist while you retry:\n\n• Define strict typed tool schemas and idempotency keys before production rollout.\n• Break deliverables into 2-3 verifiable milestones with automated tests.\n• You can also chat directly with @agent_programming_bot in Telegram @devcommunity101.",
    });
  }

  return NextResponse.json({
    ok: true,
    source: "gemini",
    model: ai.model,
    reply: ai.text,
  });
}
