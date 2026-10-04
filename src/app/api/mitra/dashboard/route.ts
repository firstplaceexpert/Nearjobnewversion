import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const workerId = user?.role === "WORKER" ? user.id : "usr-worker-siti";

    const profile = marketplaceStore.getMitraProfile(workerId);
    const activeOrder = marketplaceStore.getMitraActiveOrder(workerId);
    const incomingOrder = marketplaceStore.getMitraIncomingOrder(workerId);
    const wallet = marketplaceStore.getWallet(workerId);
    const earnings = marketplaceStore.getWorkerEarningsSummary(workerId);
    const nearbyTasks = marketplaceStore
      .getTasks({ status: "OPEN" })
      .filter((t) => t.id !== activeOrder?.taskId)
      .slice(0, 8);

    return NextResponse.json({
      success: true,
      data: {
        profile,
        activeOrder,
        incomingOrder,
        wallet,
        earnings,
        nearbyTasks,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
