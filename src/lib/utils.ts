/**
 * Utility functions — conditional class merger & Indonesian locale formatters.
 */
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Format number to Indonesian Rupiah currency string.
 * Example: 150000 -> "Rp 150.000"
 */
export function formatRupiah(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string or Date object to Indonesian date format.
 * Example: "2026-10-02" -> "2 Okt 2026"
 */
export function formatDate(date: string | Date): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
    }).format(new Date(date));
  } catch {
    return String(date);
  }
}
