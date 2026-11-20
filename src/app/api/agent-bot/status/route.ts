import { NextResponse } from "next/server";
import { AI_AGENT_LESSONS } from "@/lib/ai-agent-knowledge";
import { GEMINI_MODELS, getGeminiApiKey } from "@/lib/gemini";
import { fetchBotHealthStatus, getAgentBotConfig } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getAgentBotConfig();
  if (!config) {
    return NextResponse.json(
      { ok: false, configured: false, error: "AGENT_BOT_TOKEN is not set." },
      { status: 503 }
    );
  }

  const res = await fetchBotHealthStatus(config, {
    totalItems: AI_AGENT_LESSONS.length,
    intervalMinutes: 5,
    itemType: "ai_agent_lessons",
  });

  return NextResponse.json(
    {
      ...res.body,
      ai: {
        enabled: Boolean(getGeminiApiKey()),
        primaryModel: GEMINI_MODELS[0],
        fallbackModels: GEMINI_MODELS.slice(1),
      },
      reactions: {
        autoReact: true,
        primaryEmoji: "❤️",
      },
    },
    { status: res.status }
  );
}
