import { describe, it, expect } from "vitest";
import {
  calculateCommission,
  MIN_BUDGET,
  COMMISSION_RATE,
  COMMISSION_THRESHOLD,
  LOW_BUDGET_RATE,
  HIGH_BUDGET_RATE,
} from "@/features/payments/services/calculateCommission";

describe("calculateCommission — Platform Commission Service (Flat 10%, Min Rp 2.000)", () => {
  it("mengekspor konstanta komisi 10% dan batas minimum Rp 2.000", () => {
    expect(MIN_BUDGET).toBe(2_000);
    expect(COMMISSION_RATE).toBe(0.1);
    expect(LOW_BUDGET_RATE).toBe(0.1);
    expect(HIGH_BUDGET_RATE).toBe(0.1);
  });

  describe("Biaya Minimum Rp 2.000", () => {
    it("menerapkan komisi 10% untuk biaya minimum tepat Rp 2.000", () => {
      const result = calculateCommission(2_000);

      expect(result.budget).toBe(2_000);
      expect(result.commissionRate).toBe(0.1);
      expect(result.commissionAmount).toBe(200); // 2.000 * 0.10
      expect(result.netAmount).toBe(1_800); // 2.000 - 200
    });
  });

  describe("Penentuan harga bebas (bukan kelipatan bulat)", () => {
    it("menghitung komisi 10% dengan tepat untuk nominal ganjil Rp 2.500", () => {
      const result = calculateCommission(2_500);

      expect(result.budget).toBe(2_500);
      expect(result.commissionRate).toBe(0.1);
      expect(result.commissionAmount).toBe(250);
      expect(result.netAmount).toBe(2_250);
    });

    it("menghitung komisi 10% dengan pembulatan rupiah untuk nominal acak Rp 7.350", () => {
      const result = calculateCommission(7_350);

      expect(result.budget).toBe(7_350);
      expect(result.commissionRate).toBe(0.1);
      expect(result.commissionAmount).toBe(735);
      expect(result.netAmount).toBe(6_615);
    });

    it("menghitung komisi 10% untuk nominal acak Rp 12.345", () => {
      const result = calculateCommission(12_345);

      expect(result.budget).toBe(12_345);
      expect(result.commissionRate).toBe(0.1);
      expect(result.commissionAmount).toBe(Math.round(12_345 * 0.1)); // 1.235
      expect(result.netAmount).toBe(12_345 - result.commissionAmount);
    });
  });

  describe("Penerapan komisi flat 10% di berbagai nominal", () => {
    it("menerapkan komisi 10% untuk budget Rp 20.000", () => {
      const result = calculateCommission(20_000);

      expect(result.commissionRate).toBe(0.1);
      expect(result.commissionAmount).toBe(2_000);
      expect(result.netAmount).toBe(18_000);
    });

    it("menerapkan komisi 10% untuk budget Rp 50.000", () => {
      const result = calculateCommission(50_000);

      expect(result.commissionRate).toBe(0.1);
      expect(result.commissionAmount).toBe(5_000);
      expect(result.netAmount).toBe(45_000);
    });

    it("menerapkan komisi 10% untuk budget Rp 100.000", () => {
      const result = calculateCommission(100_000);

      expect(result.commissionRate).toBe(0.1);
      expect(result.commissionAmount).toBe(10_000);
      expect(result.netAmount).toBe(90_000);
    });

    it("menerapkan komisi 10% untuk budget Rp 1.000.000", () => {
      const result = calculateCommission(1_000_000);

      expect(result.commissionRate).toBe(0.1);
      expect(result.commissionAmount).toBe(100_000);
      expect(result.netAmount).toBe(900_000);
    });
  });

  describe("Validasi batas: Nilai Nol, Negatif, dan Invalid", () => {
    it("harus melempar RangeError ketika budget bernilai 0", () => {
      expect(() => calculateCommission(0)).toThrow(RangeError);
      expect(() => calculateCommission(0)).toThrow(
        "Budget harus bernilai positif lebih besar dari nol",
      );
    });

    it("harus melempar RangeError ketika budget bernilai negatif (-10.000)", () => {
      expect(() => calculateCommission(-10_000)).toThrow(RangeError);
      expect(() => calculateCommission(-10_000)).toThrow(
        "Budget harus bernilai positif lebih besar dari nol",
      );
    });

    it("harus melempar TypeError ketika input bukan number atau NaN", () => {
      // @ts-expect-error testing invalid type
      expect(() => calculateCommission("50000")).toThrow(TypeError);
      expect(() => calculateCommission(NaN)).toThrow(TypeError);
      // @ts-expect-error testing invalid type
      expect(() => calculateCommission(null)).toThrow(TypeError);
      // @ts-expect-error testing invalid type
      expect(() => calculateCommission(undefined)).toThrow(TypeError);
    });
  });
});
