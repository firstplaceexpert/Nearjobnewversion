import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const workerId = user?.role === "WORKER" ? user.id : "usr-worker-siti";

    const { amount, bank, accountNumber } = await req.json();
    if (!amount || amount < 10000 || !bank || !accountNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Nominal penarikan minimal Rp 10.000 dan data bank lengkap",
        },
        { status: 400 },
      );
    }

    const result = marketplaceStore.withdrawMitraEarnings(
      workerId,
      Number(amount),
      bank,
      accountNumber,
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 },
    );
  }
}
