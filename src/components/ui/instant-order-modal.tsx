"use client";

import { useState } from "react";
import {
  Zap,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  MessageSquare,
  X,
  AlertCircle,
  Bike,
  UserCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface InstantOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: (taskId: string) => void;
}

export function InstantOrderModal({
  isOpen,
  onClose,
  onOpenChat,
}: InstantOrderModalProps) {
  const [step, setStep] = useState<"FORM" | "SEARCHING" | "ASSIGNED">("FORM");
  const [serviceName, setServiceName] = useState("NearExpress (Antar Kilat)");
  const [location, setLocation] = useState(
    "Lobby Utama Plaza Ambarrukmo, Sleman, Yogyakarta",
  );
  const [budget, setBudget] = useState("50000");
  const [notes, setNotes] = useState(
    "Tolong ambil titipan paket dokumen dan antarkan segera ya.",
  );
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("SEARCHING");

    try {
      const res = await fetch("/api/trackings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName,
          location,
          budget: Number(budget),
          description: notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedTaskId(data.task.id);
        // Simulate realistic radar matching delay (2 seconds)
        setTimeout(() => {
          setStep("ASSIGNED");
        }, 2200);
      } else {
        setStep("FORM");
      }
    } catch {
      setStep("FORM");
    }
  };

  const handleReset = () => {
    setStep("FORM");
    setCreatedTaskId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-border overflow-hidden relative animate-scale-in my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-light flex items-center justify-center text-gray hover:text-dark transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STEP 1: FORM ORDER INSTAN */}
        {step === "FORM" && (
          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark">Pesan Bantuan Instan</h3>
                <p className="text-xs text-gray">
                  Mitra terdekat akan merespons & menuju ke lokasi Anda
                </p>
              </div>
            </div>

            {/* Service selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark">Pilih Jenis Layanan</label>
              <select
                value={serviceName}
                onChange={(e) => {
                  const val = e.target.value;
                  setServiceName(val);
                  if (val.includes("Kucing")) setBudget("40000");
                  else if (val.includes("Canva")) setBudget("50000");
                  else if (val.includes("Booth")) setBudget("180000");
                  else if (val.includes("Bersih")) setBudget("70000");
                  else if (val.includes("Express") || val.includes("Ride"))
                    setBudget("25000");
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-border bg-white text-xs font-semibold focus:outline-none focus:border-primary"
              >
                <option value="NearPet (Rawat & Kasih Makan Kucing)">
                  NearPet (Rawat & Kasih Makan Kucing)
                </option>
                <option value="NearCanva (Tugas Desain Canva / Feed IG)">
                  NearCanva (Tugas Desain Canva / Feed IG)
                </option>
                <option value="NearBooth (Jaga Stand Booth Bazaar 6 Jam)">
                  NearBooth (Jaga Stand Booth Bazaar 6 Jam)
                </option>
                <option value="NearExpress (Antar Dokumen / Barang Kilat)">
                  NearExpress (Antar Dokumen / Barang Kilat)
                </option>
                <option value="NearClean (Beres Bersih Kosan / Rumah 2 Jam)">
                  NearClean (Beres Bersih Kosan / Rumah 2 Jam)
                </option>
                <option value="NearHelper (Bantuan Umum / Antre / Angkat)">
                  NearHelper (Bantuan Umum / Antre / Angkat)
                </option>
              </select>
            </div>

            {/* Location input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Lokasi Penjemputan / Pekerjaan
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Lobi Apartemen Mediterania 2, Jakbar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-border text-xs focus:outline-none focus:border-primary"
              ></input>
            </div>

            {/* Budget input with live breakdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-dark">
                Tawaran Biaya / Imbalan (Rupiah)
              </label>
              <input
                type="number"
                required
                min="2000"
                step="1"
                placeholder="Contoh: 15000, 25500, dll."
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-border text-xs font-bold text-primary focus:outline-none focus:border-primary"
              />
              <p className="text-[10px] text-slate-500">
                Biaya minimum Rp 2.000. Bebas nominal (tidak harus kelipatan).
              </p>

              {/* Total Tarif Layanan */}
              {Number(budget) > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold">
                    Total Biaya Layanan:
                  </span>
                  <span className="font-extrabold text-slate-800 text-sm">
                    Rp {Number(budget).toLocaleString("id-ID")}
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark">
                Instruksi Khusus untuk Mitra
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-border text-xs focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center py-3 text-sm font-bold shadow-md shadow-primary/20"
              >
                Pesan Sekarang (Cari Mitra Terdekat) &rarr;
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: RADAR SEARCHING ANIMATION (GOJEK / GRAB RADAR VIBE) */}
        {step === "SEARCHING" && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative flex items-center justify-center">
              {/* Radar waves */}
              <div className="absolute w-44 h-44 rounded-full bg-primary/10 animate-ping"></div>
              <div className="absolute w-32 h-32 rounded-full bg-primary/20 animate-pulse"></div>
              <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 z-10">
                <Bike className="w-10 h-10 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 max-w-xs">
              <h3 className="text-base font-bold text-dark">Mencari Mitra Terdekat...</h3>
              <p className="text-xs text-gray leading-relaxed">
                Menghubungkan pesanan Anda ke mitra aktif di radius 3 km dari{" "}
                <span className="font-semibold text-dark">{location}</span>.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-primary font-semibold bg-primary-light px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Memverifikasi ketersediaan mitra terdekat...</span>
            </div>
          </div>
        )}

        {/* STEP 3: MATCHED / WORKER ON THE WAY (LIVE TRACKER) */}
        {step === "ASSIGNED" && (
          <div className="space-y-5 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success-light text-success flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-success uppercase tracking-wider">
                  Mitra Ditemukan!
                </span>
                <h3 className="text-lg font-bold text-dark">Sedang Menuju Lokasi Anda</h3>
              </div>
            </div>

            {/* Worker Profile Card (Gojek / Grab Driver card) */}
            <div className="bg-light rounded-2xl p-4 border border-gray-border/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xl overflow-hidden">
                  <UserCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-dark">Bagus Setiawan</h4>
                  <div className="flex items-center gap-2 text-xs text-gray mt-0.5">
                    <span className="text-amber-500 font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      4.96
                    </span>
                    <span>•</span>
                    <span className="font-medium text-dark-soft">
                      Honda Vario (B 4721 SBY)
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-primary uppercase">
                  Estimasi Tiba
                </span>
                <p className="text-base font-extrabold text-primary">6 Menit</p>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="space-y-2 border-l-2 border-primary/30 pl-4 ml-2">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary"></div>
                <p className="text-xs font-bold text-dark">Pesanan Diterima</p>
                <p className="text-[11px] text-gray">{serviceName}</p>
              </div>
              <div className="relative pt-2">
                <div className="absolute -left-[21px] top-3 w-2.5 h-2.5 rounded-full bg-warning animate-ping"></div>
                <p className="text-xs font-bold text-warning">
                  Mitra Dalam Perjalanan ke Lokasi
                </p>
                <p className="text-[11px] text-gray">{location}</p>
              </div>
            </div>

            {/* Safe Escrow Notice */}
            <div className="p-3 bg-primary-light/60 rounded-xl text-xs text-dark-soft flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary shrink-0" />
              <span>
                Dana Rp {Number(budget).toLocaleString("id-ID")} diamankan di NearPay dan
                baru diteruskan saat pekerjaan selesai.
              </span>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                className="justify-center text-xs"
                onClick={() => {
                  if (createdTaskId && onOpenChat) {
                    onOpenChat(createdTaskId);
                    onClose();
                  } else {
                    onClose();
                  }
                }}
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1 text-primary" />
                Chat Mitra
              </Button>
              <Button
                variant="primary"
                className="justify-center text-xs"
                onClick={onClose}
              >
                <Phone className="w-3.5 h-3.5 mr-1" />
                Pantau di Peta
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
