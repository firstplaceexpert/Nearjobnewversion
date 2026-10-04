import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Silakan login terlebih dahulu" },
        { status: 401 },
      );
    }

    const applications = marketplaceStore.getApplicationsByWorker(currentUser.id);
    const earnings = marketplaceStore.getWorkerEarningsSummary(currentUser.id);

    return NextResponse.json({
      success: true,
      data: {
        user: currentUser,
        earnings,
        applications,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
