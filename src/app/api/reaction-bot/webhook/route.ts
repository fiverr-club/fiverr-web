import { NextRequest, NextResponse } from "next/server";
import { handleReactionBotWebhookRequest } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const res = await handleReactionBotWebhookRequest(req);
  return NextResponse.json(res.body, { status: res.status });
}
