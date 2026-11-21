import { NextRequest, NextResponse } from "next/server";
import { handleReactionSlotWebhookRequest } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slot: string }> }
) {
  const { slot: rawSlot } = await context.params;
  const slot = Number.parseInt(rawSlot, 10);
  if (!Number.isInteger(slot) || slot < 2 || slot > 30) {
    return NextResponse.json(
      { ok: false, error: "Invalid reaction bot slot (expected 2-30)." },
      { status: 400 }
    );
  }

  const res = await handleReactionSlotWebhookRequest(req, slot);
  return NextResponse.json(res.body, { status: res.status });
}
