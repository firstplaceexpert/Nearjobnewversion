import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session-helper";
import { marketplaceStore } from "@/lib/marketplace-store";

export async function GET(
  _request: Request,
  props: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await props.params;
  const activeUser = await getCurrentUser();
  if (!activeUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = marketplaceStore.getChatMessages(taskId);
  return NextResponse.json(messages);
}

export async function POST(
  request: Request,
  props: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await props.params;
  const activeUser = await getCurrentUser();
  if (!activeUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    const message = marketplaceStore.sendChatMessage(taskId, activeUser.id, text);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal mengirim pesan";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
