"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VoucherSelector } from "@/components/ui/voucher-selector";
import { applyVoucher } from "@/lib/vouchers";
import {
  Search,
  Star,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Store,
  Cat,
  Palette,
  Utensils,
  GraduationCap,
  Clock,
  Plus,
  X,
  Send,
  Tag,
  Home,
  Pin,
  ChevronRight,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletBar } from "@/components/ui/wallet-bar";
import type { TaskItem } from "@/features/tasks/types";

export type PricingMode = "PER_TASK" | "HOURLY" | "PER_KM" | "DAILY";

interface ServicePreset {
  id: string;
  icon: typeof Cat;
  serviceCode: string;
  name: string;
  category: string;
  mode: PricingMode;
  budget: number;
  duration?: number;
  rate?: number;
  note: string;
  badge: string;
  desc: string;
  bgClass: string;
}

interface MainServiceItem {
  id: string;
  slug: string;
  code: string;
  title: string;
  ribbon: string;
  badgePrice?: string;
  icon: typeof GraduationCap;
  bgClass: string;
  iconColor: string;
}

interface CustomerFocusHomeProps {
  initialTasks?: TaskItem[];
  currentUserId?: string;
}

export function CustomerFocusHome({ initialTasks = [] }: CustomerFocusHomeProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Quick/Custom Task
  const [modalOpen, setModalOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return !!params.get("voucher");
    }
    return false;
  });
  const [selectedService, setSelectedService] = useState<ServicePreset | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Jasa Harian");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Jl. Malioboro, Kota Yogyakarta");
  const scheduleDate = new Date().toISOString().split("T")[0];
  const scheduleTime = "10:00";
  const [pricingMode, setPricingMode] = useState<PricingMode>("PER_TASK");
  const [durationHours, setDurationHours] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(30000);
  const [budgetStr, setBudgetStr] = useState("40000");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successTask, setSuccessTask] = useState<TaskItem | null>(null);

  // Voucher Code State (auto-read from URL query param ?voucher=NEARBARU)
  const [voucherCode, setVoucherCode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("voucher")?.toUpperCase() || "";
    }
    return "";
  });

  const budgetNum = parseInt(budgetStr.replace(/\D/g, ""), 10) || 0;

  // Real-time derived voucher discount calculation (no setState in effect needed)
  const appliedVoucher = useMemo(() => {
    if (!voucherCode || budgetNum <= 0) return null;
    const res = applyVoucher(voucherCode, budgetNum);
    if (!res.isValid || !res.voucher) return null;
    return {
      code: res.voucher.code,
      discountAmount: res.discountAmount,
      finalPaidAmount: res.finalPaidAmount,
    };
  }, [voucherCode, budgetNum]);

  // TEPAT 4 LAYANAN UTAMA (SATU BARIS SAJA - PERSIS ALA GOJEK)
  const mainServices: MainServiceItem[] = [
    {
      id: "tugas",
      slug: "tugas",
      code: "NearTugas",
      title: "Tugas Kuliah",
      ribbon: "Remote",
      icon: GraduationCap,
      bgClass: "bg-[#1867F8]/10 border-[#1867F8]/25 hover:border-[#1867F8]/60",
      iconColor: "text-[#1867F8]",
    },
    {
      id: "rumah",
      slug: "rumah",
      code: "NearRumah",
      title: "Bantu Rumah",
      ribbon: "Lokasi",
      icon: Home,
      bgClass: "bg-[#23C8FE]/15 border-[#23C8FE]/30 hover:border-[#23C8FE]/60",
      iconColor: "text-[#0aaedc]",
    },
    {
      id: "event",
      slug: "event",
      code: "NearEvent",
      title: "Jaga Stand",
      ribbon: "Shift",
      icon: Store,
      bgClass: "bg-[#FEE49A]/30 border-[#FEE49A] hover:border-[#e6c968]",
      iconColor: "text-[#2F2B4F]",
    },
    {
      id: "titip",
      slug: "titip",
      code: "NearTitip",
      title: "Titip Antre",
      ribbon: "Antre",
      icon: Clock,
      bgClass: "bg-[#FF9DE0]/20 border-[#FF9DE0]/40 hover:border-[#FF9DE0]/70",
      iconColor: "text-[#c8469c]",
    },
  ];

  // Presets untuk bagian "Pilihan kamu biasanya"
  const quickPresets: ServicePreset[] = [
    {
      id: "kucing",
      icon: Cat,
      serviceCode: "NearPet",
      name: "Kasih Makan Kucing & Anabul",
      category: "Jasa Harian",
      mode: "PER_TASK",
      budget: 40000,
      note: "Kunjungan kasih makan kucing, ganti air minum bersih & bersihkan pasir litterbox.",
      badge: "Perawatan Anabul",
      desc: "Kasih Makan & Pasir",
      bgClass: "bg-[#FEE49A]/30 text-[#2F2B4F] border-[#FEE49A]",
    },
    {
      id: "canva",
      icon: Palette,
      serviceCode: "NearCanva",
      name: "Tugas Desain Canva & Feed IG",
      category: "IT & Desain",
      mode: "PER_TASK",
      budget: 50000,
      note: "Bantu buat desain feed Instagram / banner promosi / poster menggunakan template Canva.",
      badge: "Desain Grafis",
      desc: "Desain Feed & Poster",
      bgClass: "bg-[#FF9DE0]/25 text-[#c8469c] border-[#FF9DE0]/50",
    },
    {
      id: "clean",
      icon: Sparkles,
      serviceCode: "NearClean",
      name: "Beres Bersih Kosan 2 Jam",
      category: "Pertukangan & Servis",
      mode: "HOURLY",
      duration: 2,
      rate: 35000,
      budget: 70000,
      note: "Sapu, pel lantai, bersihkan kamar mandi & buang sampah kosan.",
      badge: "Kebersihan Kosan",
      desc: "Sapu, Pel & Kamar Mandi",
      bgClass: "bg-[#23C8FE]/15 text-[#0aaedc] border-[#23C8FE]/35",
    },
    {
      id: "masak",
      icon: Utensils,
      serviceCode: "NearCook",
      name: "Bantu Masak Lauk Rumahan",
      category: "Jasa Harian",
      mode: "PER_TASK",
      budget: 60000,
      note: "Bantu potong sayur, bumbu & masak 2-3 lauk rumahan untuk anak kos / keluarga.",
      badge: "Masak Rumahan",
      desc: "Masak Rumahan 2-3 Menu",
      bgClass: "bg-[#F57373]/15 text-[#e35555] border-[#F57373]/30",
    },
  ];

  const handleOpenPreset = (srv: ServicePreset) => {
    setSelectedService(srv);
    setTitle(srv.name);
    setCategory(srv.category);
    setDescription(srv.note);
    setPricingMode(srv.mode);
    setBudgetStr(srv.budget.toString());
    if (srv.duration) setDurationHours(srv.duration);
    if (srv.rate) setHourlyRate(srv.rate);
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenCustom = () => {
    setSelectedService(null);
    setTitle("");
    setCategory("Jasa Harian");
    setDescription("");
    setPricingMode("PER_TASK");
    setBudgetStr("50000");
    setErrors({});
    setModalOpen(true);
  };

  const handleModeChange = (mode: PricingMode) => {
    setPricingMode(mode);
    if (mode === "HOURLY") {
      setBudgetStr((durationHours * hourlyRate).toString());
    } else {
      setBudgetStr("50000");
    }
  };

  const handleDurationChange = (hours: number) => {
    const next = Math.max(1, hours);
    setDurationHours(next);
    setBudgetStr((next * hourlyRate).toString());
  };

  const postMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) {
        setErrors({ title: "Nama pekerjaan wajib diisi" });
        throw new Error("Mohon lengkapi nama pekerjaan");
      }
      if (!location.trim()) {
        setErrors({ location: "Lokasi wajib diisi" });
        throw new Error("Mohon lengkapi lokasi pekerjaan");
      }

      setErrors({});

      const finalBudget = appliedVoucher ? appliedVoucher.finalPaidAmount : budgetNum;

      const payload = {
        title,
        category,
        type: "DAILY",
        description:
          description.trim() ||
          `Permintaan layanan ${title} terjadwal pada ${scheduleDate} jam ${scheduleTime} WIB.${appliedVoucher ? ` [Voucher: ${appliedVoucher.code} Hemat Rp${appliedVoucher.discountAmount.toLocaleString("id-ID")}]` : ""}`,
        location,
        budget: finalBudget,
        voucherCode: appliedVoucher?.code || null,
        discountAmount: appliedVoucher?.discountAmount || null,
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Gagal memposting pesanan tugas");
      }
      return json.data;
    },
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["posterDashboard"] });
      setSuccessTask(newTask);
      setModalOpen(false);
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 animate-fade-in">
      {/* 1. Header Atas: Search Bar + Tombol Voucher (Ala Gojek) */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari bantuan (kucing, canva, jaga stand...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-transparent focus:border-primary text-xs font-semibold text-dark placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs"
          />
        </div>

        <Link
          href="/promo"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FEE49A] hover:bg-[#FEE49A]/90 text-[#2F2B4F] border border-[#FEE49A] text-xs font-black transition-all shrink-0 shadow-2xs"
        >
          <Star className="w-3.5 h-3.5 fill-[#2F2B4F] text-[#2F2B4F]" />
          <span>Voucher</span>
        </Link>
      </div>

      {/* 2. Banner Promo Utama (Hero Visual Harmonis Warna Brand) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2F2B4F] via-[#1867F8] to-[#23C8FE] p-5 sm:p-6 text-white shadow-md">
        <div className="relative z-10 max-w-sm space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black tracking-wider uppercase">
            <Gift className="w-3 h-3 text-[#FEE49A]" />
            <span>Promo Hemat NearJob</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
            Menu Bantuan 20 Ribuan & Bebas Repot
          </h2>

          <p className="text-xs text-blue-100 leading-relaxed">
            Pakai kupon{" "}
            <span className="font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded text-white">
              NEARBARU
            </span>{" "}
            untuk diskon pesanan pertamamu!
          </p>
        </div>

        <div className="absolute -right-4 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 3. Kartu NearPay Horizontal (1:1 Mirip GoPay Card di Gojek) */}
      <WalletBar variant="gopay-card" />

      {/* Banner Sukses Pemesanan Jika Ada */}
      {successTask && (
        <div className="p-4 rounded-2xl bg-[#1867F8]/10 border border-[#1867F8]/20 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#1867F8] shrink-0" />
            <div>
              <p className="text-xs font-black text-dark">Pesanan Berhasil Diposting!</p>
              <p className="text-[11px] text-[#1867F8]">
                &ldquo;{successTask.title}&rdquo; aktif di radar pekerja.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => router.push(`/tasks/${successTask.id}`)}
            className="text-xs font-bold"
          >
            Lihat
          </Button>
        </div>
      )}

      {/* 4. TEPAT SATU BARIS SAJA (4 LAYANAN UTAMA ALA GOJEK) */}
      <div className="bg-white rounded-3xl border border-gray-border/80 p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
          {mainServices.map((srv) => {
            const Icon = srv.icon;
            return (
              <Link
                key={srv.id}
                href={`/services/${srv.slug}`}
                className="flex flex-col items-center group"
              >
                {/* Squircle Icon Container dengan Ribbon di Pojok Kiri Atas */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl border ${srv.bgClass} flex items-center justify-center relative transition-all duration-200 group-hover:scale-105 group-hover:shadow-md`}
                >
                  {/* Pita / Ribbon Kecil di Sudut Atas */}
                  <span className="absolute -top-1.5 -left-1.5 bg-[#2F2B4F] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                    {srv.ribbon}
                  </span>

                  <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${srv.iconColor}`} />
                </div>

                {/* Judul Layanan di Bawah Ikon */}
                <span className="text-xs font-extrabold text-dark mt-2 group-hover:text-primary transition-colors truncate w-full">
                  {srv.code}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 5. Banner Promo Harmonis Palet Resmi */}
      <Link
        href="/promo"
        className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#2F2B4F] to-[#1867F8] hover:opacity-95 text-white flex items-center justify-between gap-3 shadow-xs transition-all group"
      >
        <div className="flex items-center gap-2 text-xs font-bold truncate">
          <Tag className="w-3.5 h-3.5 text-[#23C8FE] shrink-0" />
          <span className="truncate">Mau tarif tugas & bantuan lebih hemat?</span>
        </div>
        <span className="text-xs font-black bg-[#FEE49A] hover:bg-[#FEE49A]/90 text-[#2F2B4F] px-2.5 py-1 rounded-xl shrink-0 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shadow-2xs">
          <span>Klaim Voucher</span>
          <ChevronRight className="w-3 h-3 text-[#2F2B4F]" />
        </span>
      </Link>

      {/* 6. Bagian "Pilihan Kamu Biasanya" (Pesanan Populer / Terakhir) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-dark uppercase tracking-wider">
            Pilihan Kamu Biasanya
          </h3>
          <Link
            href="/dashboard"
            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
          >
            <span>Semua Aktivitas</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Jika ada pesanan aktif dari props */}
        {initialTasks.length > 0 ? (
          <div className="space-y-2">
            {initialTasks.slice(0, 2).map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-white border border-gray-border/80 flex items-center justify-between gap-3 hover:border-primary/50 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#1867F8] animate-pulse" />
                    <span className="text-[10px] font-black text-[#1867F8] uppercase">
                      Sedang Aktif
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-dark truncate">{t.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{t.location}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/tasks/${t.id}`)}
                  className="text-xs font-bold shrink-0"
                >
                  Detail
                </Button>
              </div>
            ))}
          </div>
        ) : (
          /* Card Rekomendasi Pintas 1-Klik */
          <div className="grid grid-cols-2 gap-2.5">
            {quickPresets.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleOpenPreset(preset)}
                  className="p-3 rounded-2xl border border-gray-border/80 bg-white hover:border-primary/50 text-left flex items-start gap-2.5 transition-all group"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${preset.bgClass}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-dark truncate group-hover:text-primary transition-colors">
                      {preset.name}
                    </h4>
                    <p className="text-[10px] text-[#1867F8] font-extrabold truncate">
                      {preset.badge}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Tombol Tugas Kustom (Pekerjaan Bebas Lainnya) */}
      <button
        type="button"
        onClick={handleOpenCustom}
        className="w-full p-3.5 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary bg-primary-light/20 hover:bg-primary-light/40 transition-all flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-dark group-hover:text-primary transition-colors">
              Punya Tugas Bebas Lainnya? (Jasa Kustom)
            </h4>
            <p className="text-[11px] text-slate-500">
              Tulis kebutuhan apa saja & tentukan upah sendiri
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
          &rarr;
        </span>
      </button>

      {/* Booking Modal untuk Pesanan Pintas / Kustom */}

      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-border overflow-hidden relative animate-scale-in my-auto max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-light flex items-center justify-center text-gray hover:text-dark transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                postMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-gray-border/60">
                <div className="w-10 h-10 rounded-2xl bg-primary-light text-primary flex items-center justify-center font-bold">
                  {selectedService ? (
                    <selectedService.icon className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-dark">
                    {selectedService
                      ? `Pesan ${selectedService.serviceCode}`
                      : "Buat Tugas Kustom"}
                  </h3>
                  <p className="text-xs text-gray">
                    Konfirmasi rincian pekerjaan dan tarif transparan
                  </p>
                </div>
              </div>

              {postMutation.isError && (
                <div className="p-3 rounded-xl bg-error-light text-error text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {(postMutation.error as Error)?.message || "Gagal membuat pesanan"}
                  </span>
                </div>
              )}

              {/* Judul Tugas */}
              <div>
                <label className="text-xs font-bold text-dark block mb-1">
                  Nama Pekerjaan <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Kasih makan kucing / Desain feed Canva"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-border text-xs font-semibold focus:outline-none focus:border-primary"
                />
                {errors.title && (
                  <p className="text-error text-xs mt-1">{errors.title}</p>
                )}
              </div>

              {/* Skema Upah Selector */}
              <div>
                <label className="text-xs font-bold text-dark block mb-1.5">
                  Skema Perhitungan Upah:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleModeChange("PER_TASK")}
                    className={`flex-1 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      pricingMode === "PER_TASK"
                        ? "bg-primary-light text-primary border-primary shadow-xs"
                        : "bg-slate-50 text-gray-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                    <span>Per Tugas (Flat)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange("HOURLY")}
                    className={`flex-1 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      pricingMode === "HOURLY"
                        ? "bg-primary-light text-primary border-primary shadow-xs"
                        : "bg-slate-50 text-gray-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Per Jam (Shift)</span>
                  </button>
                </div>
              </div>

              {/* Penentuan Upah oleh Konsumen (Per Tugas) */}
              {pricingMode === "PER_TASK" && (
                <div>
                  <label className="text-xs font-bold text-dark block mb-1">
                    Nominal Upah yang Anda Tawarkan <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray">
                      Rp
                    </span>
                    <input
                      type="number"
                      required
                      min="2000"
                      step="1"
                      value={budgetStr}
                      onChange={(e) => setBudgetStr(e.target.value)}
                      placeholder="Ketik nominal upah (min. Rp 2.000)..."
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-border text-xs font-bold text-dark focus:outline-none focus:border-primary"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Biaya minimum Rp 2.000. Bebas nominal (tidak harus kelipatan).
                  </p>
                </div>
              )}

              {/* Dynamic Durasi & Tarif jika Per Jam */}
              {pricingMode === "HOURLY" && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      Durasi Pekerjaan:{" "}
                      <strong className="text-dark">{durationHours} Jam</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDurationChange(durationHours - 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-bold text-sm text-dark hover:bg-slate-100 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold">{durationHours}</span>
                      <button
                        type="button"
                        onClick={() => handleDurationChange(durationHours + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-bold text-sm text-dark hover:bg-slate-100 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-dark block mb-1">
                      Tarif per Jam yang Anda Tawarkan
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray">
                        Rp
                      </span>
                      <input
                        type="number"
                        min="2000"
                        step="1"
                        value={hourlyRate}
                        onChange={(e) => {
                          const r = parseInt(e.target.value, 10) || 0;
                          setHourlyRate(r);
                          setBudgetStr((durationHours * r).toString());
                        }}
                        className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-gray-border text-xs font-bold text-dark focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Lokasi Pengerjaan */}
              <div>
                <label className="text-xs font-bold text-dark block mb-1">
                  <MapPin className="w-3.5 h-3.5 text-primary inline mr-1" />
                  Lokasi Pekerjaan <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Jl. Sudirman No. 10 / Apartemen Mediterania"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-border text-xs focus:outline-none focus:border-primary"
                />
                {errors.location && (
                  <p className="text-error text-xs mt-1">{errors.location}</p>
                )}
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="text-xs font-bold text-dark block mb-1">
                  Catatan / Instruksi Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tulis instruksi khusus untuk pekerja..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-border text-xs focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Voucher Diskon Selector */}
              {budgetNum > 0 && (
                <VoucherSelector
                  budget={budgetNum}
                  appliedCode={voucherCode}
                  onApply={(res) => setVoucherCode(res.code)}
                  onRemove={() => setVoucherCode("")}
                />
              )}

              {/* Total Tarif Layanan & Rincian Pembayaran */}
              {budgetNum > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-semibold">
                      Upah Tawaran Layanan:
                    </span>
                    <span
                      className={`font-bold ${appliedVoucher ? "line-through text-slate-400" : "text-dark"}`}
                    >
                      Rp {budgetNum.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {appliedVoucher && appliedVoucher.discountAmount > 0 && (
                    <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        Diskon Voucher ({appliedVoucher.code}):
                      </span>
                      <span>
                        - Rp {appliedVoucher.discountAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-800 font-black block">
                        Total yang Harus Dibayar:
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {appliedVoucher
                          ? "Sudah dipotong diskon voucher promo"
                          : "Sesuai nominal tawaran upah Anda"}
                      </span>
                    </div>
                    <span className="font-black text-primary text-base sm:text-lg">
                      Rp{" "}
                      {(appliedVoucher
                        ? appliedVoucher.finalPaidAmount
                        : budgetNum
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={postMutation.isPending}
                  disabled={postMutation.isPending}
                  className="flex-1 text-xs font-bold py-3 shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Konfirmasi & Cari Pekerja</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
