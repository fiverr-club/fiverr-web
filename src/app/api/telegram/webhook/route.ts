import { NextRequest, NextResponse } from "next/server";
import {
  buildBotCommandResponse,
  getTelegramConfig,
  handleBotWebhookRequest,
} from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const res = await handleBotWebhookRequest(req, getTelegramConfig(), buildBotCommandResponse);
  return NextResponse.json(res.body, { status: res.status });
}
