import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const workerId = user?.role === "WORKER" ? user.id : "usr-worker-siti";

    const { taskId, step } = await req.json();
    if (!taskId || !step) {
      return NextResponse.json(
        { success: false, error: "Parameter tidak lengkap" },
        { status: 400 },
      );
    }

    const updated = marketplaceStore.updateMitraOrderStatus(workerId, taskId, step);

    return NextResponse.json({
      success: true,
      data: { activeOrder: updated, isCompleted: step === "COMPLETED" },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
