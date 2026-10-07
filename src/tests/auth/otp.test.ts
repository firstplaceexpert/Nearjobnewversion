import { describe, it, expect } from "vitest";
import { marketplaceStore } from "@/lib/marketplace-store";

describe("WhatsApp / Phone OTP Registration Flow", () => {
  const testPhone = "+6281327446342";
  const testName = "Rois hadi";
  const testOtp = "7294";

  it("berhasil menyimpan dan mengambil data OTP", () => {
    marketplaceStore.saveOtp({
      phone: testPhone,
      code: testOtp,
      name: testName,
      role: "POSTER",
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    const record = marketplaceStore.getOtp(testPhone);
    expect(record).toBeDefined();
    expect(record?.code).toBe(testOtp);
    expect(record?.name).toBe(testName);
    expect(record?.role).toBe("POSTER");
  });

  it("berhasil mendaftarkan pengguna baru via nomor HP", () => {
    const newUser = marketplaceStore.registerUserWithPhone({
      name: "Budi Baru",
      phone: "+6281999888777",
      role: "WORKER",
    });

    expect(newUser).toBeDefined();
    expect(newUser.name).toBe("Budi Baru");
    expect(newUser.phone).toBe("+6281999888777");
    expect(newUser.role).toBe("WORKER");

    // Pastikan user dapat dicari berdasarkan nomor HP
    const found = marketplaceStore.findUserByPhone("+6281999888777");
    expect(found).toBeDefined();
    expect(found?.id).toBe(newUser.id);
  });

  it("menghapus OTP setelah verifikasi selesai", () => {
    marketplaceStore.deleteOtp(testPhone);
    const record = marketplaceStore.getOtp(testPhone);
    expect(record).toBeUndefined();
  });
});
