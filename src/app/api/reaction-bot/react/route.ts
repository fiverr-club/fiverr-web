import { NextRequest, NextResponse } from "next/server";
import {
  extractBroadcastBearerToken,
  fanOutReactionsToMessage,
  fanOutReactionWave,
  getReactionBotConfig,
  verifySharedSecret,
} from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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

  let body: {
    chatId?: string | number;
    messageId?: number;
    count?: number;
    mode?: "single" | "sweep";
  } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const chatId = body.chatId ?? config.chatId;
  const messageId = typeof body.messageId === "number" ? body.messageId : undefined;
  if (!messageId || messageId < 1) {
    return NextResponse.json(
      { ok: false, error: "messageId (positive integer) is required." },
      { status: 400 }
    );
  }

  const mode = body.mode === "single" ? "single" : "sweep";
  if (mode === "single") {
    const res = await fanOutReactionsToMessage(chatId, messageId);
    return NextResponse.json({ ok: true, mode, chatId, messageId, ...res });
  }

  const count = Math.max(1, Math.min(10, typeof body.count === "number" ? body.count : 8));
  const wave = await fanOutReactionWave(chatId, messageId, count);
  return NextResponse.json({ ok: true, mode, chatId, anchorMessageId: messageId, countPerBot: count, ...wave });
}
