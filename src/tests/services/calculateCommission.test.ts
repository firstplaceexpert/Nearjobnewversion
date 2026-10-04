import { describe, it, expect } from "vitest";
import {
  calculateCommission,
  COMMISSION_THRESHOLD,
  LOW_BUDGET_RATE,
  HIGH_BUDGET_RATE,
} from "@/features/payments/services/calculateCommission";

describe("calculateCommission — Dynamic Commission Service", () => {
  it("mengekspor konstanta ambang batas Rp50.000 dengan benar", () => {
    expect(COMMISSION_THRESHOLD).toBe(50_000);
  });

  describe("Tepat di batas ambang Rp50.000", () => {
    it("menerapkan komisi 9% untuk budget tepat Rp50.000", () => {
      const result = calculateCommission(50_000);

      expect(result.commissionRate).toBe(HIGH_BUDGET_RATE);
      expect(result.commissionAmount).toBe(4_500); // 50.000 * 0.09
      expect(result.netAmount).toBe(45_500); // 50.000 - 4.500
      expect(result.budget).toBe(50_000);
    });

    it("menerapkan komisi 10% untuk budget tepat di bawah Rp50.000 (Rp49.999)", () => {
      const result = calculateCommission(49_999);

      expect(result.commissionRate).toBe(LOW_BUDGET_RATE);
      expect(result.commissionAmount).toBe(Math.round(49_999 * 0.1)); // 5.000
      expect(result.netAmount).toBe(49_999 - result.commissionAmount);
    });
  });

  describe("Nilai kecil (< Rp50.000)", () => {
    it("menerapkan komisi 10% untuk budget Rp20.000", () => {
      const result = calculateCommission(20_000);

      expect(result.commissionRate).toBe(0.1);
      expect(result.commissionAmount).toBe(2_000);
      expect(result.netAmount).toBe(18_000);
    });

    it("menerapkan komisi 10% untuk budget Rp35.000", () => {
      const result = calculateCommission(35_000);

      expect(result.commissionRate).toBe(0.1);
      expect(result.commissionAmount).toBe(3_500);
      expect(result.netAmount).toBe(31_500);
    });

    it("menerapkan komisi 10% untuk budget minimal Rp10.000", () => {
      const result = calculateCommission(10_000);

      expect(result.commissionRate).toBe(0.1);
      expect(result.commissionAmount).toBe(1_000);
      expect(result.netAmount).toBe(9_000);
    });
  });

  describe("Nilai besar (>= Rp50.000)", () => {
    it("menerapkan komisi 9% untuk budget Rp100.000", () => {
      const result = calculateCommission(100_000);

      expect(result.commissionRate).toBe(0.09);
      expect(result.commissionAmount).toBe(9_000);
      expect(result.netAmount).toBe(91_000);
    });

    it("menerapkan komisi 9% untuk budget Rp500.000", () => {
      const result = calculateCommission(500_000);

      expect(result.commissionRate).toBe(0.09);
      expect(result.commissionAmount).toBe(45_000);
      expect(result.netAmount).toBe(455_000);
    });

    it("menerapkan komisi 9% untuk budget Rp1.000.000", () => {
      const result = calculateCommission(1_000_000);

      expect(result.commissionRate).toBe(0.09);
      expect(result.commissionAmount).toBe(90_000);
      expect(result.netAmount).toBe(910_000);
    });

    it("menerapkan komisi 9% untuk budget profesional Rp5.000.000", () => {
      const result = calculateCommission(5_000_000);

      expect(result.commissionRate).toBe(0.09);
      expect(result.commissionAmount).toBe(450_000);
      expect(result.netAmount).toBe(4_550_000);
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
