/**
 * Dynamic Commission Calculation Service
 *
 * NEAR JOB Marketplace — Pure business logic service
 *
 * Rules:
 * - Budget < Rp50.000  → 10% commission (rate: 0.10)
 * - Budget >= Rp50.000 → 9% commission (rate: 0.09)
 * - Zero or negative budget throws a descriptive RangeError.
 * - Returns { budget, commissionRate, commissionAmount, netAmount }
 */

export interface CommissionResult {
  budget: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
}

export const COMMISSION_THRESHOLD = 50_000;
export const LOW_BUDGET_RATE = 0.1;
export const HIGH_BUDGET_RATE = 0.09;

/**
 * Calculates platform commission and net worker earnings from task budget.
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

  const commissionRate =
    budget >= COMMISSION_THRESHOLD ? HIGH_BUDGET_RATE : LOW_BUDGET_RATE;

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
