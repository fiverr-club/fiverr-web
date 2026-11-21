import { NextRequest, NextResponse } from "next/server";
import { CURATED_NEWS_PULSES } from "@/lib/reaction-bot";
import {
  fetchBotHealthStatus,
  getAllReactionCapableBots,
  getReactionSlotBotConfig,
  getReactionSweepCount,
} from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slot: string }> }
) {
  const { slot: rawSlot } = await context.params;
  const slot = Number.parseInt(rawSlot, 10);
  if (!Number.isInteger(slot) || slot < 2 || slot > 10) {
    return NextResponse.json(
      { ok: false, error: "Invalid reaction bot slot (expected 2-10)." },
      { status: 400 }
    );
  }

  const config = getReactionSlotBotConfig(slot);
  if (!config) {
    return NextResponse.json(
      { ok: false, configured: false, error: `REACTION_BOT_TOKEN_${slot} is not set.` },
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
      slot: config.slot,
      label: config.label,
      reactions: {
        autoReact: true,
        isBig: true,
        autoSweepCountPerBot: autoSweepCount,
        slotOffset: config.slotOffset,
        coordinatedBotsCount: activeBots.length,
        coordinatedBots: activeBots.map((b) => ({
          role: b.role,
          label: b.label,
          slotOffset: b.slotOffset,
        })),
      },
    },
    { status: res.status }
  );
}
