import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

function normalizeIndonesianPhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "").trim();
  if (cleaned.startsWith("+62")) {
    return cleaned;
  }
  if (cleaned.startsWith("62")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+62${cleaned.slice(1)}`;
  }
  return `+62${cleaned}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawPhone = String(body.phone || "").trim();
    const name = String(body.name || "Pengguna").trim();
    const role = (body.role === "WORKER" ? "WORKER" : "POSTER") as "POSTER" | "WORKER";

    const digitsOnly = rawPhone.replace(/\D/g, "");
    if (!rawPhone || digitsOnly.length < 9 || digitsOnly.length > 15) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nomor WhatsApp / HP tidak valid. Masukkan nomor yang benar (contoh: 081327446342).",
        },
        { status: 400 },
      );
    }

    const normalizedPhone = normalizeIndonesianPhone(rawPhone);

    // Generate random 4-digit numeric OTP code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    marketplaceStore.saveOtp({
      phone: normalizedPhone,
      code,
      name,
      role,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      message: `Kode OTP verifikasi berhasil dikirimkan ke nomor WhatsApp ${normalizedPhone}`,
      phone: normalizedPhone,
      debugOtp: code,
      expiresInSeconds: 300,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
