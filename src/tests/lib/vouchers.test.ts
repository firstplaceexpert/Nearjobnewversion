import { describe, it, expect } from "vitest";
import { applyVoucher, AVAILABLE_VOUCHERS, MIN_BUDGET } from "@/lib/vouchers";

describe("Discount Voucher Calculation and Validation", () => {
  it("should have pre-configured vouchers available", () => {
    expect(AVAILABLE_VOUCHERS.length).toBeGreaterThan(0);
    const nearbaru = AVAILABLE_VOUCHERS.find((v) => v.code === "NEARBARU");
    expect(nearbaru).toBeDefined();
    expect(nearbaru?.discountValue).toBe(20);
  });

  it("should successfully apply percentage discount voucher (NEARBARU)", () => {
    const result = applyVoucher("NEARBARU", 50000);
    expect(result.isValid).toBe(true);
    expect(result.voucher?.code).toBe("NEARBARU");
    // 20% of 50.000 = 10.000, maxDiscount 20.000
    expect(result.discountAmount).toBe(10000);
    expect(result.finalPaidAmount).toBe(40000);
  });

  it("should handle case-insensitive voucher codes", () => {
    const resultLower = applyVoucher("nearbaru", 50000);
    expect(resultLower.isValid).toBe(true);
    expect(resultLower.discountAmount).toBe(10000);
  });

  it("should successfully apply fixed discount voucher (ANABBULHEMAT)", () => {
    const result = applyVoucher("ANABBULHEMAT", 40000);
    expect(result.isValid).toBe(true);
    expect(result.discountAmount).toBe(10000);
    expect(result.finalPaidAmount).toBe(30000);
  });

  it("should protect minimum payment floor of Rp 2.000", () => {
    // If voucher discount would reduce budget below Rp 2.000,
    // finalPaidAmount must remain at least Rp 2.000
    const result = applyVoucher("CANVAMURAH", 5000);
    expect(result.isValid).toBe(true);
    expect(result.finalPaidAmount).toBe(MIN_BUDGET);
    expect(result.discountAmount).toBe(3000); // 5.000 - 2.000
  });

  it("should reject voucher when budget is below minOrder requirement", () => {
    // JAGABOOTH50 requires minOrder 100.000
    const result = applyVoucher("JAGABOOTH50", 50000);
    expect(result.isValid).toBe(false);
    expect(result.discountAmount).toBe(0);
    expect(result.finalPaidAmount).toBe(50000);
    expect(result.error).toContain("membutuhkan minimal biaya");
  });

  it("should reject invalid / non-existent voucher code", () => {
    const result = applyVoucher("KODE_PALSU_123", 50000);
    expect(result.isValid).toBe(false);
    expect(result.discountAmount).toBe(0);
    expect(result.finalPaidAmount).toBe(50000);
    expect(result.error).toContain("tidak ditemukan");
  });

  it("should reject empty voucher code", () => {
    const result = applyVoucher("", 50000);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("tidak boleh kosong");
  });
});
