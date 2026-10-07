import { Button } from "@/components/ui/button";
import { Tag, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Promo & Voucher Spesial | NEAR JOB",
  description:
    "Nikmati aneka promo diskon, potongan biaya jasa, dan voucher komisi hemat untuk setiap kebutuhan harianmu.",
};

export default function PromoPage() {
  const promos = [
    {
      id: "NEWUSER20",
      code: "NEARBARU",
      title: "Diskon 20% Pengguna Baru",
      desc: "Potongan biaya jasa hingga Rp 20.000 untuk pesanan tugas pertamamu.",
      category: "Semua Layanan",
      expiry: "Berlaku s/d 31 Des 2026",
      badge: "Spesial Pengguna Baru",
      highlight: true,
    },
    {
      id: "CATCARE10",
      code: "ANABBULHEMAT",
      title: "Voucher Kasih Makan Kucing",
      desc: "Diskon Rp 10.000 untuk jasa rawat & kasih makan hewan peliharaan.",
      category: "Rawat Hewan",
      expiry: "Berlaku setiap hari",
      badge: "NearPet",
    },
    {
      id: "CANVAFREE",
      code: "CANVAMURAH",
      title: "Potongan Tugas Desain Canva",
      desc: "Cashback saldo NearPay Rp 15.000 untuk tugas desain Instagram & poster.",
      category: "IT & Desain",
      expiry: "Khusus Mahasiswa",
      badge: "NearDesign",
    },
    {
      id: "BOOTHPROMO",
      code: "JAGABOOTH50",
      title: "Diskon Shift Booth Bazaar",
      desc: "Potongan Rp 30.000 untuk pemesanan jaga booth minimal 6 jam.",
      category: "Jaga Booth",
      expiry: "Berlaku akhir pekan",
      badge: "Event & Bazaar",
    },
    {
      id: "KILAT5",
      code: "KIRIMCEPAT",
      title: "Gratis Ongkir Kurir 5 KM Pertama",
      desc: "Antar dokumen dan barang kilat tanpa tarif dasar jemput.",
      category: "Kurir & Logistik",
      expiry: "Terbatas kuota harian",
      badge: "NearExpress",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-border/60 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/30 text-dark border border-warning text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Promo & Penawaran Terbatas</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
          Kupon & Diskon Spesial NearJob
        </h1>
        <p className="text-sm text-gray mt-1 max-w-xl">
          Gunakan kode promo berikut saat memesan bantuan atau membuat tugas baru agar
          lebih hemat.
        </p>
      </div>

      {/* Grid Kupon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className={`p-5 rounded-2xl border transition-all ${
              promo.highlight
                ? "bg-gradient-to-br from-primary/10 via-secondary/10 to-white border-primary/40 shadow-sm"
                : "bg-white border-gray-border/80 hover:border-gray-border"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-light text-[11px] font-bold text-gray-700">
                <Tag className="w-3 h-3 text-primary" />
                {promo.badge}
              </span>
              <span className="text-[10px] text-gray font-medium">{promo.expiry}</span>
            </div>

            <h3 className="text-base font-extrabold text-dark mb-1">{promo.title}</h3>
            <p className="text-xs text-gray leading-relaxed mb-4">{promo.desc}</p>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-border/50">
              <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-dashed border-slate-300 font-mono text-xs font-bold text-dark tracking-wider flex items-center gap-1.5">
                <span>{promo.code}</span>
              </div>
              <Link href={`/?voucher=${promo.code}`}>
                <Button
                  size="sm"
                  variant="primary"
                  className="text-xs font-bold px-3 py-1.5 h-auto shadow-xs"
                >
                  Pakai Sekarang
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
