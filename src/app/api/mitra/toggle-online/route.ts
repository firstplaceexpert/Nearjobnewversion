import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const workerId = user?.role === "WORKER" ? user.id : "usr-worker-siti";

    const body = await req.json().catch(() => ({}));
    const isOnline = typeof body.isOnline === "boolean" ? body.isOnline : true;

    const result = marketplaceStore.setMitraOnline(workerId, isOnline);

    return NextResponse.json({
      success: true,
      data: { isOnline: result },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
