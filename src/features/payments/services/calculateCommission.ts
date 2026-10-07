/**
 * Platform Commission Calculation Service
 *
 * NEAR JOB Marketplace — Pure business logic service
 *
 * Rules:
 * - Biaya minimum tugas: Rp 2.000
 * - Komisi platform: Flat 10% (rate: 0.10)
 * - Penentuan harga bebas (tidak harus kelipatan)
 * - Zero or negative budget throws a descriptive RangeError.
 * - Returns { budget, commissionRate, commissionAmount, netAmount }
 */

export interface CommissionResult {
  budget: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
}

export const MIN_BUDGET = 2_000;
export const COMMISSION_RATE = 0.1;
export const COMMISSION_THRESHOLD = 50_000;
export const LOW_BUDGET_RATE = 0.1;
export const HIGH_BUDGET_RATE = 0.1; // Flat 10%

/**
 * Calculates platform commission (flat 10%) and net worker earnings from task budget.
 *
 * @param budget Task budget in Indonesian Rupiah (must be > 0)
 * @returns CommissionResult with rate, commission amount, and net worker payout
 * @throws {RangeError} if budget is zero, negative, or not a finite number
 */
export function calculateCommission(budget: number): CommissionResult {
  if (typeof budget !== "number" || !Number.isFinite(budget)) {
    throw new TypeError("Budget harus berupa angka valid");
  }

  if (budget <= 0) {
    throw new RangeError("Budget harus bernilai positif lebih besar dari nol (Rp0)");
  }

  const commissionRate = COMMISSION_RATE;

  // Round commission to integer Rupiah
  const commissionAmount = Math.round(budget * commissionRate);
  const netAmount = budget - commissionAmount;

  return {
    budget,
    commissionRate,
    commissionAmount,
    netAmount,
  };
}
