import { NextResponse } from "next/server";
import { SEED_JOBS } from "@/lib/jobs";
import { fetchBotHealthStatus, getTelegramConfig } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getTelegramConfig();
  if (!config) {
    return NextResponse.json(
      { ok: false, configured: false, error: "TELEGRAM_BOT_TOKEN is not set." },
      { status: 503 }
    );
  }

  const res = await fetchBotHealthStatus(config, {
    totalItems: SEED_JOBS.length,
    intervalMinutes: 10,
    itemType: "jobs",
  });
  return NextResponse.json(
    {
      ...res.body,
      reactions: {
        autoReact: true,
        isBig: true,
        sweepCountPerMessage: 5,
        scope: "all group messages, broadcasts, commands, and DMs",
        slotOffset: 2,
      },
    },
    { status: res.status }
  );
}
