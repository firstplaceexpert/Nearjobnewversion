import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session-helper";
import { marketplaceStore } from "@/lib/marketplace-store";

export async function GET() {
  const activeUser = await getCurrentUser();
  if (!activeUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wallet = marketplaceStore.getWallet(activeUser.id);
  return NextResponse.json(wallet);
}

export async function POST(request: Request) {
  const activeUser = await getCurrentUser();
  if (!activeUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const amount = Number(body.amount);
    if (!amount || amount < 2000) {
      return NextResponse.json(
        { error: "Nominal top up minimal Rp 2.000" },
        { status: 400 },
      );
    }

    const updated = marketplaceStore.topUpWallet(activeUser.id, amount);
    return NextResponse.json({ success: true, wallet: updated });
  } catch {
    return NextResponse.json({ error: "Gagal memproses top up saldo" }, { status: 500 });
  }
}
