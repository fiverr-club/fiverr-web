import { NextResponse } from "next/server";
import { CURATED_NEWS_PULSES } from "@/lib/reaction-bot";
import { GEMINI_MODELS, getGeminiApiKey } from "@/lib/gemini";
import {
  fetchBotHealthStatus,
  getAllReactionCapableBots,
  getReactionBotConfig,
  getReactionPrimaryEmojiOverride,
  getReactionStackMode,
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
  const autoSweepCount = getReactionSweepCount(10);

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
        instantAllBotBlastOnMessage: true,
        stackMode: getReactionStackMode(),
        primaryEmojiOverride: getReactionPrimaryEmojiOverride(),
        isBig: true,
        autoSweepCountPerBot: autoSweepCount,
        maxHypeWavePerBot: 10,
        maxSlotBots: 30,
        coordinatedBotsCount: activeBots.length,
        coordinatedBots: activeBots.map((b) => ({
          role: b.role,
          label: b.label,
          slotOffset: b.slotOffset,
        })),
        interactiveActionBarButtons: 8,
        telegramSingleBotPerMessageLimit: 1,
        swarmScalingHint:
          "All bots now stack on the SAME emoji per message (e.g. ❤️ xN) to maximize counts. Add more BotFather tokens via REACTION_BOT_TOKEN_2..30 or REACTION_SWARM_BOT_TOKENS to stack ❤️ 20+ on every single message.",
      },
    },
    { status: res.status }
  );
}
