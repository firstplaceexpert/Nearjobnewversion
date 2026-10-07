"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Clock,
  Link2,
  Send,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Home,
  Store,
  Check,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoucherSelector } from "@/components/ui/voucher-selector";
import { applyVoucher } from "@/lib/vouchers";
import type { ServiceCategoryConfig, ServiceVariant } from "@/lib/service-categories";

interface ServiceCategoryDetailProps {
  config: ServiceCategoryConfig;
}

export function ServiceCategoryDetail({ config }: ServiceCategoryDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedVariant, setSelectedVariant] = useState<ServiceVariant>(
    config.variants[0],
  );

  const [title, setTitle] = useState(config.variants[0].name);
  const [description, setDescription] = useState(config.variants[0].description);
  const [linkAsset, setLinkAsset] = useState("");
  const [location, setLocation] = useState(
    config.isRemote
      ? "Online / Remote (Seluruh Indonesia)"
      : "Jl. Malioboro, Kota Yogyakarta",
  );
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [durationHours, setDurationHours] = useState(
    config.variants[0].suggestedDuration || 2,
  );
  const [budgetNum, setBudgetNum] = useState<number>(config.variants[0].defaultBudget);
  const [voucherCode, setVoucherCode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("voucher")?.toUpperCase() || "";
    }
    return "";
  });

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);

  // When variant changes, update title, budget, and description
  const handleSelectVariant = (v: ServiceVariant) => {
    setSelectedVariant(v);
    setTitle(v.name);
    setDescription(v.description);
    if (v.pricingType === "HOURLY" && v.suggestedDuration) {
      setDurationHours(v.suggestedDuration);
      setBudgetNum(v.defaultBudget);
    } else {
      setBudgetNum(v.defaultBudget);
    }
  };

  const handleDurationChange = (nextHours: number) => {
    const h = Math.max(1, nextHours);
    setDurationHours(h);
    if (selectedVariant.pricingType === "HOURLY") {
      const basePerHour =
        selectedVariant.defaultBudget / (selectedVariant.suggestedDuration || 1);
      setBudgetNum(Math.round(basePerHour * h));
    }
  };

  // Category Icon Resolver
  const CategoryIcon =
    config.slug === "tugas"
      ? GraduationCap
      : config.slug === "rumah"
        ? Home
        : config.slug === "event"
          ? Store
          : Clock;

  const postMutation = useMutation({
    mutationFn: async () => {
      const errMap: Record<string, string> = {};

      if (!title.trim() || title.length < 5) {
        errMap.title = "Nama pekerjaan minimal 5 karakter";
      }
      if (!description.trim() || description.length < 20) {
        errMap.description =
          "Deskripsi instruksi minimal 20 karakter agar pekerja paham tugasnya";
      }
      if (!location.trim() || location.length < 3) {
        errMap.location = "Lokasi pekerjaan wajib diisi minimal 3 karakter";
      }

      if (Object.keys(errMap).length > 0) {
        setErrors(errMap);
        throw new Error("Mohon lengkapi formulir dengan benar");
      }

      setErrors({});

      let fullDesc = description.trim();
      if (config.isRemote && linkAsset.trim()) {
        fullDesc += `\n\nLink Bahan / File: ${linkAsset.trim()}`;
      }
      fullDesc += `\nTenggat / Jadwal: ${scheduleDate} ${scheduleTime} WIB`;

      const payload = {
        title: title.trim(),
        category: config.dbCategory,
        type: "DAILY",
        description: fullDesc,
        location: location.trim(),
        budget: budgetNum,
        voucherCode: appliedVoucher?.code || undefined,
        discountAmount: appliedVoucher?.discountAmount || 0,
        finalPaidAmount: appliedVoucher ? appliedVoucher.finalPaidAmount : budgetNum,
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Gagal membuat pesanan tugas");
      }
      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["posterDashboard"] });
      setCreatedTaskId(data?.id || "success");
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* 1. Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-gray"
      >
        <Link href="/" className="hover:text-primary transition-colors">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-dark">{config.code}</span>
      </nav>

      {/* 2. Hero Header Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${config.themeColor.gradient} text-white shadow-xl relative overflow-hidden`}
      >
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider">
            <CategoryIcon className="w-4 h-4" />
            <span>{config.code}</span>
            <span className="text-white/60">•</span>
            <span>{config.typeTag}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {config.title}
          </h1>

          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            {config.longDesc}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/90">
            <span className="flex items-center gap-1.5 bg-black/15 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span>Mitra Terverifikasi & Rekber Aman</span>
            </span>
            <span className="flex items-center gap-1.5 bg-black/15 px-3 py-1 rounded-full">
              <Sparkles className="w-4 h-4 text-warning" />
              <span>Upah Bebas Ditentukan Konsumen</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Notifikasi Berhasil Jika Tugas Dibuat */}
      {createdTaskId && (
        <div className="p-6 rounded-3xl bg-primary/10 border-2 border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-7 h-7 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-extrabold text-dark">
                Pesanan Berhasil Diposting!
              </h3>
              <p className="text-xs text-primary mt-1 max-w-xl">
                Tugas Anda telah aktif di sistem radar NearJob. Mitra yang sesuai akan
                segera merespons permintaan Anda.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-xs font-bold"
            >
              Buka Aktivitas
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push(`/tasks/${createdTaskId}`)}
              className="text-xs font-bold flex items-center gap-1.5"
            >
              <span>Lihat Detail Tugas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* 4. Grid Pilihan Varian Pekerjaan Populer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-dark uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Pilih Jenis Pekerjaan Yang Anda Butuhkan:</span>
          </h2>
          <span className="text-xs text-gray hidden sm:inline">
            Klik salah satu untuk mengisi formulir otomatis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {config.variants.map((v) => {
            const isSelected = selectedVariant.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSelectVariant(v)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-primary-light/20 ring-2 ring-primary/20 shadow-sm"
                    : "border-gray-border/80 bg-white hover:border-primary/50 hover:bg-slate-50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                      {v.badge}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-dark line-clamp-1">
                    {v.name}
                  </h3>
                  <p className="text-xs text-gray mt-1 line-clamp-2 leading-relaxed">
                    {v.description}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Penentuan Upah</span>
                  <span className="font-extrabold text-primary">
                    Sesuai Keinginan Anda
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Formulir Pemesanan Sesuai Kategori */}
      <div className="bg-white rounded-3xl border border-gray-border/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-gray-border/60 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-dark">
              Formulir Pemesanan {config.code}
            </h3>
            <p className="text-xs text-gray mt-0.5">
              Lengkapi instruksi pengerjaan agar mitra dapat langsung bekerja dengan
              akurat
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {config.typeTag}
          </span>
        </div>

        {postMutation.isError && (
          <div className="p-3.5 rounded-2xl bg-error-light text-error text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              {(postMutation.error as Error)?.message || "Gagal mengirim pesanan"}
            </span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            postMutation.mutate();
          }}
          className="space-y-4"
        >
          {/* Judul Tugas */}
          <div>
            <label className="text-xs font-bold text-dark block mb-1">
              Nama / Topik Pekerjaan <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Desain Feed Instagram 3 Slide / Kasih Makan Kucing Siang Hari"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-border text-xs font-semibold focus:outline-none focus:border-primary"
            />
            {errors.title && <p className="text-error text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Durasi Jam jika Hourly */}
          {selectedVariant.pricingType === "HOURLY" && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-dark block">
                  Durasi Pengerjaan / Shift:
                </span>
                <span className="text-slate-500 text-[11px]">
                  Pekerjaan diselesaikan dalam rentang durasi ini
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDurationChange(durationHours - 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-sm text-dark hover:bg-slate-100 flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-12 text-center font-black text-sm text-dark">
                  {durationHours} Jam
                </span>
                <button
                  type="button"
                  onClick={() => handleDurationChange(durationHours + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-sm text-dark hover:bg-slate-100 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Deskripsi & Instruksi */}
          <div>
            <label className="text-xs font-bold text-dark block mb-1">
              Instruksi & Detail Pengerjaan <span className="text-error">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan kebutuhan Anda selengkap mungkin (minimal 20 karakter)..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-border text-xs focus:outline-none focus:border-primary resize-none"
            />
            {errors.description && (
              <p className="text-error text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Jika Remote: Input Link Dokumen/Canva/Drive */}
          {config.isRemote ? (
            <div>
              <label className="text-xs font-bold text-dark block mb-1">
                <Link2 className="w-3.5 h-3.5 text-primary inline mr-1" />
                Link File / Bahan (Google Drive / Canva / Dokumen)
              </label>
              <input
                type="url"
                value={linkAsset}
                onChange={(e) => setLinkAsset(e.target.value)}
                placeholder="https://drive.google.com/... atau https://canva.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-border text-xs focus:outline-none focus:border-primary"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Opsional: Berikan link akses file bahan atau brief materi jika ada.
              </span>
            </div>
          ) : (
            /* Jika On-site: Input Alamat Lokasi Fisik */
            <div>
              <label className="text-xs font-bold text-dark block mb-1">
                <MapPin className="w-3.5 h-3.5 text-primary inline mr-1" />
                Lokasi / Alamat Lengkap Pengerjaan <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Jl. Sudirman No. 10 / Apartemen Mediterania Tower A Lantai 5"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-border text-xs focus:outline-none focus:border-primary"
              />
              {errors.location && (
                <p className="text-error text-xs mt-1">{errors.location}</p>
              )}
            </div>
          )}

          {/* Jadwal Pelaksanaan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-dark block mb-1">
                <Calendar className="w-3.5 h-3.5 text-primary inline mr-1" />
                Tanggal {config.isRemote ? "Tenggat Waktu" : "Pengerjaan"}
              </label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-border text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-dark block mb-1">
                <Clock className="w-3.5 h-3.5 text-primary inline mr-1" />
                Jam {config.isRemote ? "Deadline" : "Mulai"} (WIB)
              </label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-border text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Penentuan Biaya / Upah Sesuai Keinginan Konsumen */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-light/30 via-white to-light border-2 border-primary/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="text-xs font-black text-dark flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-primary" />
                  <span>Tentukan Biaya / Upah Sesuai Keinginan Anda (Rp)</span>
                  <span className="text-error">*</span>
                </label>
                <p className="text-[11px] text-gray mt-0.5">
                  Bebas tentukan upah sesuai anggaran dan kesepakatan yang Anda inginkan
                </p>
              </div>
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full w-fit">
                Bebas Nego / Fleksibel
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-3 font-black text-sm text-gray">
                Rp
              </span>
              <input
                type="number"
                required
                min="2000"
                step="1"
                value={budgetNum || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setBudgetNum(isNaN(val) ? 0 : val);
                }}
                placeholder="Ketik nominal upah (min. Rp 2.000)..."
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-base font-black text-dark border-2 border-gray-border focus:border-primary focus:outline-none transition-all shadow-xs"
              />
            </div>
            <p className="text-[11px] text-gray pt-1">
              Biaya minimum Rp 2.000. Bebas nominal (tidak harus kelipatan).
            </p>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-bold text-gray uppercase tracking-wider">
                Tambah Cepat:
              </span>
              {[10000, 25000, 50000, 100000].map((add) => (
                <button
                  key={add}
                  type="button"
                  onClick={() => setBudgetNum((prev) => (prev || 0) + add)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-primary-light/50 border border-gray-border text-primary transition-all"
                >
                  +{add / 1000}rb
                </button>
              ))}
              <button
                type="button"
                onClick={() => setBudgetNum(0)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-error-light border border-gray-border text-slate-500 hover:text-error-hover transition-all"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Voucher Promo Diskon */}
          <VoucherSelector
            budget={budgetNum}
            appliedCode={voucherCode}
            onApply={(res) => setVoucherCode(res.code)}
            onRemove={() => setVoucherCode("")}
          />

          {/* Total Tarif Layanan Bersih Sesuai Keinginan Konsumen */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="text-slate-600 font-medium">Upah yang Ditawarkan:</span>
              <span
                className={`font-bold ${appliedVoucher ? "line-through text-slate-400" : "text-slate-800"}`}
              >
                Rp {budgetNum.toLocaleString("id-ID")}
              </span>
            </div>

            {appliedVoucher && (
              <div className="flex items-center justify-between text-xs text-secondary-hover font-semibold">
                <span>Diskon Promo ({appliedVoucher.code}):</span>
                <span>- Rp {appliedVoucher.discountAmount.toLocaleString("id-ID")}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs text-slate-700 font-bold block">
                  Total Pembayaran Bersih Konsumen:
                </span>
                <span className="text-[11px] text-slate-400">
                  {appliedVoucher
                    ? `Hemat Rp ${appliedVoucher.discountAmount.toLocaleString("id-ID")} dengan voucher ${appliedVoucher.code}. Dana aman di rekening bersama.`
                    : "Sesuai nominal yang Anda inginkan. Dana aman di rekening bersama sampai tugas selesai."}
                </span>
              </div>
              <span className="font-black text-primary text-xl sm:text-2xl">
                Rp{" "}
                {(appliedVoucher
                  ? appliedVoucher.finalPaidAmount
                  : budgetNum
                ).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Link href="/">
              <Button type="button" variant="outline" size="sm" className="text-xs">
                Kembali ke Beranda
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              loading={postMutation.isPending}
              disabled={postMutation.isPending}
              className="text-xs font-bold px-6 py-3 shadow-md shadow-primary/20 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Konfirmasi & Cari Mitra {config.code}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
