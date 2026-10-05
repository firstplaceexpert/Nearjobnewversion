import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session-helper";
import { marketplaceStore } from "@/lib/marketplace-store";

export async function GET() {
  const activeUser = await getCurrentUser();
  if (!activeUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trackings = marketplaceStore.getActiveOrderTrackings(activeUser.id);
  return NextResponse.json(trackings);
}

export async function POST(request: Request) {
  const activeUser = await getCurrentUser();
  if (!activeUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = marketplaceStore.createInstantOrder(activeUser.id, {
      serviceName: body.serviceName || "NearExpress",
      location: body.location || "Kota Yogyakarta",
      budget: Number(body.budget) || 50000,
      description: body.description || "Pesanan instan bantuan cepat di dekat lokasi.",
      latitude: body.latitude,
      longitude: body.longitude,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal membuat pesanan instan";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
