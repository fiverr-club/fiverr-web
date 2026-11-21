import { NextRequest, NextResponse } from "next/server";
import {
  extractBroadcastBearerToken,
  getReactionBotConfig,
  parseBroadcastParams,
  sendReactionNewsBroadcast,
  verifySharedSecret,
} from "@/lib/telegram";

export const dynamic = "force-dynamic";

async function handleBroadcast(req: NextRequest) {
  const config = getReactionBotConfig();
  if (!config) {
    return NextResponse.json(
      { ok: false, error: "REACTION_BOT_TOKEN is not configured." },
      { status: 503 }
    );
  }

  if (!verifySharedSecret(config.broadcastSecret, extractBroadcastBearerToken(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { itemId, chatId, slot, header, topic } = await parseBroadcastParams(req);
  const result = await sendReactionNewsBroadcast({
    pulseId: itemId,
    slot,
    chatId,
    header,
    topic,
  });

  return NextResponse.json(
    { ...result, sentAt: new Date().toISOString() },
    { status: result.ok ? 200 : 502 }
  );
}

export async function POST(req: NextRequest) {
  return handleBroadcast(req);
}

export async function GET(req: NextRequest) {
  return handleBroadcast(req);
}
