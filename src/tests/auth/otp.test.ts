import { describe, it, expect } from "vitest";
import { marketplaceStore } from "@/lib/marketplace-store";

describe("WhatsApp / Phone OTP Registration Flow with Mitra KTP Verification", () => {
  const testPhone = "+6281327446342";
  const testName = "Rois hadi";
  const testOtp = "7294";
  const testKtp = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

  it("berhasil menyimpan dan mengambil data OTP konsumen", () => {
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

  it("berhasil mendaftarkan konsumen tanpa upload KTP", () => {
    const newUser = marketplaceStore.registerUserWithPhone({
      name: "Konsumen Baru",
      phone: "+6281234567890",
      role: "POSTER",
    });

    expect(newUser).toBeDefined();
    expect(newUser.name).toBe("Konsumen Baru");
    expect(newUser.role).toBe("POSTER");
    expect(newUser.isKtpVerified).toBe(false);
  });

  it("berhasil mendaftarkan mitra dengan upload foto KTP dan status terverifikasi", () => {
    const newWorker = marketplaceStore.registerUserWithPhone({
      name: "Mitra KTP Valid",
      phone: "+6281999888777",
      role: "WORKER",
      ktpImage: testKtp,
    });

    expect(newWorker).toBeDefined();
    expect(newWorker.name).toBe("Mitra KTP Valid");
    expect(newWorker.role).toBe("WORKER");
    expect(newWorker.ktpImage).toBe(testKtp);
    expect(newWorker.isKtpVerified).toBe(true);

    // Profile mitra juga otomatis dibuat dengan status terverifikasi
    const mitraProfile = marketplaceStore.getMitraProfile(newWorker.id);
    expect(mitraProfile).toBeDefined();
    expect(mitraProfile?.isKtpVerified).toBe(true);
  });

  it("menghapus OTP setelah verifikasi selesai", () => {
    marketplaceStore.deleteOtp(testPhone);
    const record = marketplaceStore.getOtp(testPhone);
    expect(record).toBeUndefined();
  });
});
