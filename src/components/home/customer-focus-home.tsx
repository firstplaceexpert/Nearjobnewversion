"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletBar } from "@/components/ui/wallet-bar";
import { PwaInstallCard } from "@/components/pwa";
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
  badgePrice: string;
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServicePreset | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Jasa Harian");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Jl. Sudirman, Jakarta Pusat");
  const scheduleDate = new Date().toISOString().split("T")[0];
  const scheduleTime = "10:00";
  const [pricingMode, setPricingMode] = useState<PricingMode>("PER_TASK");
  const [durationHours, setDurationHours] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(30000);
  const [budgetStr, setBudgetStr] = useState("40000");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successTask, setSuccessTask] = useState<TaskItem | null>(null);

  // TEPAT 4 LAYANAN UTAMA (SATU BARIS SAJA - PERSIS ALA GOJEK)
  const mainServices: MainServiceItem[] = [
    {
      id: "tugas",
      slug: "tugas",
      code: "NearTugas",
      title: "Tugas Kuliah",
      ribbon: "Remote",
      badgePrice: "Mulai 35rb",
      icon: GraduationCap,
      bgClass: "bg-indigo-50 border-indigo-100 hover:border-indigo-300",
      iconColor: "text-indigo-600",
    },
    {
      id: "rumah",
      slug: "rumah",
      code: "NearRumah",
      title: "Bantu Rumah",
      ribbon: "Lokasi",
      badgePrice: "Mulai 35rb",
      icon: Home,
      bgClass: "bg-emerald-50 border-emerald-100 hover:border-emerald-300",
      iconColor: "text-emerald-600",
    },
    {
      id: "event",
      slug: "event",
      code: "NearEvent",
      title: "Jaga Stand",
      ribbon: "Shift",
      badgePrice: "Mulai 30rb/j",
      icon: Store,
      bgClass: "bg-amber-50 border-amber-100 hover:border-amber-300",
      iconColor: "text-amber-600",
    },
    {
      id: "titip",
      slug: "titip",
      code: "NearTitip",
      title: "Titip Antre",
      ribbon: "Antre",
      badgePrice: "Mulai 35rb",
      icon: Clock,
      bgClass: "bg-sky-50 border-sky-100 hover:border-sky-300",
      iconColor: "text-sky-600",
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
      badge: "Rp 40.000 / visit",
      desc: "Kasih Makan & Pasir",
      bgClass: "bg-amber-500/10 text-amber-600 border-amber-200",
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
      badge: "Rp 50.000 / tugas",
      desc: "Desain Feed & Poster",
      bgClass: "bg-purple-500/10 text-purple-600 border-purple-200",
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
      badge: "Rp 70.000 / 2 jam",
      desc: "Sapu, Pel & Kamar Mandi",
      bgClass: "bg-teal-500/10 text-teal-600 border-teal-200",
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
      badge: "Rp 60.000 / sesi",
      desc: "Masak Rumahan 2-3 Menu",
      bgClass: "bg-orange-500/10 text-orange-600 border-orange-200",
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

  const budgetNum = parseInt(budgetStr.replace(/\D/g, ""), 10) || 0;

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

      const payload = {
        title,
        category,
        type: "DAILY",
        description:
          description.trim() ||
          `Permintaan layanan ${title} terjadwal pada ${scheduleDate} jam ${scheduleTime} WIB.`,
        location,
        budget: budgetNum,
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
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-100/80 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-black transition-all shrink-0 shadow-2xs"
        >
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>Voucher</span>
        </Link>

        {/* Profil Bulat Pengguna (Persis Posisi Avatar di Screenshot Gojek) */}
        <Link
          href="/dashboard"
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-dark shrink-0 transition-all shadow-2xs"
          title="Profil Saya"
        >
          <User className="w-4 h-4 text-slate-700" />
        </Link>
      </div>

      {/* 2. Banner Promo Utama (Hero Visual Melengkung Ala Gojek) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-5 sm:p-6 text-white shadow-md">
        <div className="relative z-10 max-w-sm space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black tracking-wider uppercase">
            <Gift className="w-3 h-3 text-amber-200" />
            <span>Promo Hemat NearJob</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
            Menu Bantuan 20 Ribuan & Bebas Repot
          </h2>

          <p className="text-xs text-rose-100 leading-relaxed">
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
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-black text-emerald-900">
                Pesanan Berhasil Diposting!
              </p>
              <p className="text-[11px] text-emerald-700">
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
                  {/* Pita / Ribbon Kecil di Sudut Atas (Mirip Gojek 5rb/8rb) */}
                  <span className="absolute -top-1.5 -left-1.5 bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                    {srv.ribbon}
                  </span>

                  <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${srv.iconColor}`} />
                </div>

                {/* Judul Layanan di Bawah Ikon */}
                <span className="text-xs font-extrabold text-dark mt-2 group-hover:text-primary transition-colors truncate w-full">
                  {srv.code}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold truncate w-full">
                  {srv.badgePrice}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 5. Banner Hijau Tipis Promo (Slim Strip Ala Gojek) */}
      <Link
        href="/promo"
        className="p-3 sm:p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-between gap-3 shadow-xs transition-all group"
      >
        <div className="flex items-center gap-2 text-xs font-bold truncate">
          <Tag className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
          <span className="truncate">Mau tarif tugas & bantuan lebih hemat?</span>
        </div>
        <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-xl text-white shrink-0 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          <span>Klaim Voucher</span>
          <ChevronRight className="w-3 h-3" />
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
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase">
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
                    <p className="text-[10px] text-emerald-700 font-extrabold truncate">
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

      {/* 8. Banner Unduh / Pasang Aplikasi (PWA Android, iOS & Desktop) */}
      <PwaInstallCard />

      {/* Booking Modal untuk Pesanan Pintas / Kustom */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-border overflow-hidden relative animate-scale-in max-h-[90vh] overflow-y-auto">
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

              {/* Dynamic Durasi jika Per Jam */}
              {pricingMode === "HOURLY" && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Durasi: <strong className="text-dark">{durationHours} Jam</strong> (@
                    Rp {hourlyRate.toLocaleString("id-ID")}/jam)
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

              {/* Total Tarif Layanan Bersih Tanpa Bocoran Komisi */}
              {budgetNum > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-700 font-bold block">
                      Total Biaya Layanan:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Tarif all-in resmi NearJob
                    </span>
                  </div>
                  <span className="font-black text-dark text-base sm:text-lg">
                    Rp {budgetNum.toLocaleString("id-ID")}
                  </span>
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
