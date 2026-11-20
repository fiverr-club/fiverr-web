import { NextRequest, NextResponse } from "next/server";
import {
  extractBroadcastBearerToken,
  getTelegramConfig,
  parseBroadcastParams,
  sendTelegramJobBroadcast,
  verifySharedSecret,
} from "@/lib/telegram";

export const dynamic = "force-dynamic";

async function handleBroadcast(req: NextRequest) {
  const config = getTelegramConfig();
  if (!config) {
    return NextResponse.json(
      { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured." },
      { status: 503 }
    );
  }

  if (!verifySharedSecret(config.broadcastSecret, extractBroadcastBearerToken(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { itemId, chatId, slot, header } = await parseBroadcastParams(req);
  const result = await sendTelegramJobBroadcast({ jobId: itemId, slot, chatId, header });

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
