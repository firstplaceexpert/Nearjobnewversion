import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await props.params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Silakan login terlebih dahulu" },
        { status: 401 },
      );
    }

    const { task, transaction } = marketplaceStore.completeTask(currentUser.id, taskId);

    return NextResponse.json({
      success: true,
      data: { task, transaction },
      message: "Tugas berhasil diselesaikan dan status pembayaran telah dicatat!",
    });
  } catch (error) {
    const msg = (error as Error).message;
    const status = msg.includes("Akses ditolak") ? 403 : 400;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
