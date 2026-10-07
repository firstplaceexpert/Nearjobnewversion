/**
 * NearJob Promo & Discount Vouchers Service
 */
import { MIN_BUDGET } from "@/features/payments/services/calculateCommission";
export { MIN_BUDGET };

export interface Voucher {
  id: string;
  code: string;
  title: string;
  desc: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  maxDiscount?: number;
  minOrder?: number;
  badge: string;
  highlight?: boolean;
}

export const AVAILABLE_VOUCHERS: Voucher[] = [
  {
    id: "NEWUSER20",
    code: "NEARBARU",
    title: "Diskon 20% Pengguna Baru",
    desc: "Potongan biaya jasa hingga Rp 20.000 untuk pesanan pertamamu.",
    discountType: "PERCENT",
    discountValue: 20,
    maxDiscount: 20000,
    minOrder: 2000,
    badge: "Spesial Pengguna Baru",
    highlight: true,
  },
  {
    id: "CATCARE10",
    code: "ANABBULHEMAT",
    title: "Voucher Kasih Makan Kucing",
    desc: "Diskon Rp 10.000 untuk jasa rawat & kasih makan anabul.",
    discountType: "FIXED",
    discountValue: 10000,
    minOrder: 2000,
    badge: "NearPet",
  },
  {
    id: "CANVAFREE",
    code: "CANVAMURAH",
    title: "Potongan Tugas Desain Canva",
    desc: "Potongan biaya Rp 15.000 untuk tugas desain Instagram & poster.",
    discountType: "FIXED",
    discountValue: 15000,
    minOrder: 2000,
    badge: "NearDesign",
  },
  {
    id: "BOOTHPROMO",
    code: "JAGABOOTH50",
    title: "Diskon Shift Booth Bazaar",
    desc: "Potongan Rp 30.000 untuk pemesanan jaga booth bazaar mall (min. order Rp 100.000).",
    discountType: "FIXED",
    discountValue: 30000,
    minOrder: 100000,
    badge: "Event & Bazaar",
  },
  {
    id: "KILAT5",
    code: "KIRIMCEPAT",
    title: "Gratis Biaya Kurir Kilat",
    desc: "Potongan Rp 10.000 untuk antar dokumen atau barang kilat.",
    discountType: "FIXED",
    discountValue: 10000,
    minOrder: 2000,
    badge: "NearExpress",
  },
  {
    id: "HEMAT5000",
    code: "HEMAT50",
    title: "Voucher Diskon Rp 5.000",
    desc: "Potongan langsung Rp 5.000 untuk semua jenis tugas dan layanan.",
    discountType: "FIXED",
    discountValue: 5000,
    minOrder: 2000,
    badge: "Semua Layanan",
  },
];

export interface ApplyVoucherResult {
  isValid: boolean;
  valid: boolean;
  voucher?: Voucher;
  discountAmount: number;
  finalPaidAmount: number;
  error?: string;
}

/**
 * Validates and applies a voucher to a given task budget.
 *
 * @param code The voucher code entered by consumer
 * @param budget The raw budget set by consumer
 */
export function applyVoucher(code: string, budget: number): ApplyVoucherResult {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return {
      isValid: false,
      valid: false,
      discountAmount: 0,
      finalPaidAmount: budget,
      error: "Kode voucher tidak boleh kosong",
    };
  }

  const voucher = AVAILABLE_VOUCHERS.find((v) => v.code.toUpperCase() === cleanCode);

  if (!voucher) {
    return {
      isValid: false,
      valid: false,
      discountAmount: 0,
      finalPaidAmount: budget,
      error: `Kode voucher "${cleanCode}" tidak ditemukan atau sudah kedaluwarsa.`,
    };
  }

  if (budget < (voucher.minOrder || MIN_BUDGET)) {
    return {
      isValid: false,
      valid: false,
      voucher,
      discountAmount: 0,
      finalPaidAmount: budget,
      error: `Voucher ini membutuhkan minimal biaya tugas Rp ${(voucher.minOrder || MIN_BUDGET).toLocaleString("id-ID")}.`,
    };
  }

  let rawDiscount = 0;
  if (voucher.discountType === "PERCENT") {
    rawDiscount = Math.round((budget * voucher.discountValue) / 100);
    if (voucher.maxDiscount) {
      rawDiscount = Math.min(rawDiscount, voucher.maxDiscount);
    }
  } else {
    rawDiscount = voucher.discountValue;
  }

  // Ensure consumer always pays at least MIN_BUDGET (Rp 2.000)
  const finalPaidAmount = Math.max(MIN_BUDGET, budget - rawDiscount);
  const effectiveDiscount = Math.max(0, budget - finalPaidAmount);

  return {
    isValid: true,
    valid: true,
    voucher,
    discountAmount: effectiveDiscount,
    finalPaidAmount,
  };
}
