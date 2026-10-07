"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoucherSelector } from "@/components/ui/voucher-selector";
import { applyVoucher } from "@/lib/vouchers";
import { TASK_CATEGORIES, JOB_TYPE_BADGE } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils";
import { calculateCommission } from "@/features/payments/services/calculateCommission";
import { postTaskSchema } from "@/lib/validations";
import { Pencil, Eye, AlertCircle, MapPin, Calendar, Send } from "lucide-react";

export default function PostTaskPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Jasa Harian");
  const [type, setType] = useState<"DAILY" | "PART_TIME" | "FREELANCE" | "FULL_TIME">(
    "DAILY",
  );
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [budgetStr, setBudgetStr] = useState("100000");
  const [voucherCode, setVoucherCode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("voucher")?.toUpperCase() || "";
    }
    return "";
  });

  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const budgetNum = parseInt(budgetStr.replace(/\D/g, ""), 10) || 0;
  let commissionData = null;
  try {
    if (budgetNum > 0) {
      commissionData = calculateCommission(budgetNum);
    }
  } catch {
    // ignore
  }

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

  const postTaskMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        category,
        type,
        description,
        location,
        budget: budgetNum,
        scheduleDate,
        scheduleTime,
        voucherCode: appliedVoucher?.code || undefined,
        discountAmount: appliedVoucher?.discountAmount || 0,
        finalPaidAmount: appliedVoucher ? appliedVoucher.finalPaidAmount : budgetNum,
      };

      // Client-side validation check
      const parsed = postTaskSchema.safeParse(payload);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, val] of Object.entries(parsed.error.flatten().fieldErrors)) {
          if (val && val.length > 0) fieldErrors[key] = val[0];
        }
        setErrors(fieldErrors);
        throw new Error("Mohon lengkapi seluruh formulir dengan benar");
      }

      setErrors({});

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Gagal memposting tugas");
      }

      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["posterDashboard"] });
      router.push("/dashboard");
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-bold text-primary uppercase tracking-wider block">
          Pemberi Tugas (Poster)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight mt-1">
          Pasang Pekerjaan atau Tugas Baru
        </h1>
        <p className="text-sm text-gray mt-1">
          Tentukan tugas yang ingin diselesaikan, jadwal, dan budget yang wajar. Pelamar
          terdekat akan segera merespons.
        </p>

        {/* Tab switch Form vs Live Preview */}
        <div className="flex items-center gap-2 mt-6 border-b border-light pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "form"
                ? "bg-primary text-white shadow-xs"
                : "bg-light text-gray hover:text-dark"
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Formulir Pengisian</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "preview"
                ? "bg-primary text-white shadow-xs"
                : "bg-light text-gray hover:text-dark"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Kartu Tugas Sebelum Submit</span>
          </button>
        </div>
      </div>

      {postTaskMutation.isError && (
        <div className="mb-6 p-4 rounded-xl bg-error-light text-error text-xs sm:text-sm font-medium border border-error/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{postTaskMutation.error.message}</span>
        </div>
      )}

      {activeTab === "preview" ? (
        /* Live Preview Tab */
        <div className="space-y-6">
          <div className="p-4 bg-primary-light/30 border border-primary-light rounded-xl text-xs text-primary font-medium">
            Pratinjau tampilan kartu tugas Anda di halaman pencarian:
          </div>

          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary/30 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="primary" size="sm">
                      {category}
                    </Badge>
                    <Badge variant={JOB_TYPE_BADGE[type].variant} size="sm">
                      {JOB_TYPE_BADGE[type].label}
                    </Badge>
                  </div>
                  <Badge variant="primary" size="sm">
                    Baru
                  </Badge>
                </div>

                <h3 className="font-bold text-dark text-lg">
                  {title || "Judul Tugas Anda Akan Muncul Di Sini"}
                </h3>

                <p className="text-gray text-xs sm:text-sm line-clamp-3 leading-relaxed">
                  {description ||
                    "Deskripsi tugas dan rincian pekerjaan yang Anda tuliskan akan muncul di sini."}
                </p>

                <div className="text-xs text-gray space-y-1.5 pt-2 border-t border-light">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{location || "Lokasi belum diisi"}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>
                      {scheduleDate || "Tanggal"} ({scheduleTime || "Jam"})
                    </span>
                  </p>
                </div>

                <div className="pt-3 border-t border-light flex justify-between items-end">
                  <div>
                    <span className="text-[11px] text-gray block">Budget Anda</span>
                    <span className="font-extrabold text-lg text-dark">
                      {formatRupiah(
                        appliedVoucher ? appliedVoucher.finalPaidAmount : budgetNum,
                      )}
                    </span>
                    {appliedVoucher && (
                      <span className="text-[10px] text-secondary-hover block font-bold">
                        Voucher {appliedVoucher.code} (-
                        {formatRupiah(appliedVoucher.discountAmount)})
                      </span>
                    )}
                    {commissionData && (
                      <span className="text-[11px] text-success block font-medium">
                        Diterima Worker: {formatRupiah(commissionData.netAmount)}
                      </span>
                    )}
                  </div>
                  <Button size="sm" variant="primary" disabled>
                    Lihat Detail
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center pt-4">
            <Button variant="outline" size="md" onClick={() => setActiveTab("form")}>
              Kembali Mengedit Formulir
            </Button>
          </div>
        </div>
      ) : (
        /* Form Fill Tab */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            postTaskMutation.mutate();
          }}
          className="space-y-6"
        >
          {/* Section 1: Basic Information */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-dark text-base">
                1. Informasi Pokok Pekerjaan
              </h3>

              <div>
                <label className="text-xs font-semibold text-dark block mb-1.5">
                  Judul Tugas <span className="text-error">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Jaga Stand Bazaar Kuliner, Angkut Kardus Pindahan Kost..."
                  error={errors.title}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">
                    Kategori Tugas <span className="text-error">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-light rounded-xl text-xs sm:text-sm text-dark border border-gray-border focus:border-primary focus:bg-white focus:outline-none transition-all"
                  >
                    {TASK_CATEGORIES.filter((c) => c !== "Semua Kategori").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">
                    Tipe Durasi Tugas <span className="text-error">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as typeof type)}
                    className="w-full px-3.5 py-2.5 bg-light rounded-xl text-xs sm:text-sm text-dark border border-gray-border focus:border-primary focus:bg-white focus:outline-none transition-all"
                  >
                    <option value="DAILY">Harian / Sekali Selesai (Daily)</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="FREELANCE">Freelance (Proyek)</option>
                    <option value="FULL_TIME">Full Time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-dark block mb-1.5">
                  Deskripsi Lengkap & Jobdesk <span className="text-error">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Jelaskan apa yang harus dikerjakan, syarat khusus (misal: punya motor, pakaian hitam putih), dan fasilitas yang disediakan (makan siang/transport)..."
                  className={`w-full px-3.5 py-2.5 bg-light rounded-xl text-xs sm:text-sm text-dark border focus:border-primary focus:bg-white focus:outline-none transition-all placeholder:text-gray-light ${
                    errors.description ? "border-error" : "border-gray-border"
                  }`}
                />
                {errors.description && (
                  <p className="text-[11px] text-error mt-1">{errors.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Location & Schedule */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-dark text-base">
                2. Lokasi & Jadwal Pelaksanaan
              </h3>

              <div>
                <label className="text-xs font-semibold text-dark block mb-1.5">
                  Lokasi Pelaksanaan <span className="text-error">*</span>
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Malioboro Mall Lt. 2, Yogyakarta atau Remote / Online"
                  error={errors.location}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">
                    Tanggal Pelaksanaan <span className="text-error">*</span>
                  </label>
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    error={errors.scheduleDate}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">
                    Jam Pelaksanaan <span className="text-error">*</span>
                  </label>
                  <Input
                    type="text"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    placeholder="Contoh: 09:00 - 17:00 WIB"
                    error={errors.scheduleTime}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Budget & Commission */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-dark text-base">
                3. Imbalan / Upah & Perhitungan Komisi Dinamis
              </h3>

              <div>
                <label className="text-xs font-semibold text-dark block mb-1.5">
                  Nominal Budget (Rupiah) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-xs sm:text-sm text-gray">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="2000"
                    placeholder="Contoh: 15000, 25500, dll."
                    value={budgetStr}
                    onChange={(e) => setBudgetStr(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-light rounded-xl text-xs sm:text-sm font-bold text-dark border border-gray-border focus:border-primary focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-gray mt-1">
                  Biaya minimum Rp 2.000. Bebas nominal (tidak harus kelipatan).
                </p>
                {errors.budget && (
                  <p className="text-[11px] text-error mt-1">{errors.budget}</p>
                )}
              </div>

              {/* Voucher Promo Diskon */}
              <VoucherSelector
                budget={budgetNum}
                appliedCode={voucherCode}
                onApply={(res) => setVoucherCode(res.code)}
                onRemove={() => setVoucherCode("")}
              />

              {/* Rincian Pembayaran Konsumen */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Nominal Upah Tugas:</span>
                  <span
                    className={`font-semibold ${appliedVoucher ? "line-through text-slate-400" : "text-slate-800"}`}
                  >
                    {formatRupiah(budgetNum)}
                  </span>
                </div>

                {appliedVoucher && (
                  <div className="flex items-center justify-between text-secondary-hover font-semibold">
                    <span>Potongan Diskon ({appliedVoucher.code}):</span>
                    <span>- {formatRupiah(appliedVoucher.discountAmount)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-800">Total yang Anda Bayar:</span>
                  <span className="font-extrabold text-base text-primary">
                    {formatRupiah(
                      appliedVoucher ? appliedVoucher.finalPaidAmount : budgetNum,
                    )}
                  </span>
                </div>
              </div>

              {/* Real-time Commission Box */}
              {commissionData && (
                <div className="p-4 rounded-xl bg-primary-light/20 border border-primary-light space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray">Tarif Komisi Platform:</span>
                    <Badge variant="primary" size="sm">
                      10% (Flat)
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-error font-medium">
                    <span>Biaya Platform Terpotong Otomatis:</span>
                    <span>- {formatRupiah(commissionData.commissionAmount)}</span>
                  </div>

                  <div className="pt-2 border-t border-primary-light flex items-center justify-between">
                    <span className="font-bold text-dark">
                      Pekerja Akan Menerima (Net):
                    </span>
                    <span className="font-extrabold text-base text-success">
                      {formatRupiah(commissionData.netAmount)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setActiveTab("preview")}
            >
              Lihat Preview
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={postTaskMutation.isPending}
              disabled={postTaskMutation.isPending}
              className="font-bold shadow-md flex items-center gap-1.5"
            >
              {postTaskMutation.isPending ? (
                "Menerbitkan..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Pasang Tugas Sekarang</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
