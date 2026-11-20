import { NextRequest, NextResponse } from "next/server";
import { handleAgentBotWebhookRequest } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const res = await handleAgentBotWebhookRequest(req);
  return NextResponse.json(res.body, { status: res.status });
}
