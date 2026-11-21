import { NextResponse } from "next/server";
import { CURATED_NEWS_PULSES } from "@/lib/reaction-bot";
import { GEMINI_MODELS, getGeminiApiKey } from "@/lib/gemini";
import {
  fetchBotHealthStatus,
  getAllReactionCapableBots,
  getReactionBotConfig,
  getReactionSweepCount,
} from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getReactionBotConfig();
  if (!config) {
    return NextResponse.json(
      { ok: false, configured: false, error: "REACTION_BOT_TOKEN is not set." },
      { status: 503 }
    );
  }

  const res = await fetchBotHealthStatus(config, {
    totalItems: CURATED_NEWS_PULSES.length,
    intervalMinutes: 15,
    itemType: "tech_news_pulses",
  });

  const activeBots = getAllReactionCapableBots();
  const autoSweepCount = getReactionSweepCount(7);

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
        isBig: true,
        autoSweepCountPerBot: autoSweepCount,
        maxHypeWavePerBot: 10,
        coordinatedBotsCount: activeBots.length,
        coordinatedBots: activeBots.map((b) => ({
          role: b.role,
          label: b.label,
          slotOffset: b.slotOffset,
        })),
        interactiveActionBarButtons: 8,
        telegramSingleBotPerMessageLimit: 1,
      },
    },
    { status: res.status }
  );
}
