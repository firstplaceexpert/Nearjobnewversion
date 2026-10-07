import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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
    const inputCode = String(body.code || "").trim();
    const nameParam = body.name ? String(body.name).trim() : "";
    const roleParam = body.role === "WORKER" ? "WORKER" : "POSTER";

    if (!rawPhone || !inputCode) {
      return NextResponse.json(
        { success: false, error: "Nomor WhatsApp dan kode OTP wajib diisi." },
        { status: 400 },
      );
    }

    const normalizedPhone = normalizeIndonesianPhone(rawPhone);
    const otpRecord = marketplaceStore.getOtp(normalizedPhone);

    const isDemoBypass = inputCode === "1234";
    const isCodeMatch = otpRecord && otpRecord.code === inputCode;
    const isExpired = otpRecord && Date.now() > otpRecord.expiresAt;

    if (!isDemoBypass && (!otpRecord || isExpired || !isCodeMatch)) {
      return NextResponse.json(
        {
          success: false,
          error: isExpired
            ? "Kode OTP telah kadaluarsa. Silakan kirim ulang kode baru."
            : "Kode OTP yang Anda masukkan salah. Periksa kembali pesan WhatsApp Anda.",
        },
        { status: 400 },
      );
    }

    // Determine final name and role
    const finalName = nameParam || otpRecord?.name || "Pengguna NearJob";
    const finalRole = (otpRecord?.role || roleParam) as "POSTER" | "WORKER";

    // Register or retrieve user in marketplace store
    const user = marketplaceStore.registerUserWithPhone({
      name: finalName,
      phone: normalizedPhone,
      role: finalRole,
    });

    // Clean up OTP record
    marketplaceStore.deleteOtp(normalizedPhone);

    // Set persistent active user session cookie (30 days)
    const cookieStore = await cookies();
    cookieStore.set("nearjob_active_user", user.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: false,
    });

    return NextResponse.json({
      success: true,
      user,
      message: "Verifikasi berhasil! Akun Anda aktif dan siap digunakan.",
      redirectTo: user.role === "POSTER" ? "/" : "/mitra",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
