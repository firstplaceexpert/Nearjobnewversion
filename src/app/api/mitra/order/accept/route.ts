import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const workerId = user?.role === "WORKER" ? user.id : "usr-worker-siti";

    const { taskId } = await req.json();
    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "ID tugas diperlukan" },
        { status: 400 },
      );
    }

    const activeOrder = marketplaceStore.acceptMitraOrder(workerId, taskId);

    return NextResponse.json({
      success: true,
      data: { activeOrder },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
