"use client";

import Image from "next/image";
import { Download, Smartphone, Laptop, CheckCircle2 } from "lucide-react";
import { usePwa } from "./pwa-provider";

export function PwaInstallCard() {
  const { isInstalled, promptInstall } = usePwa();

  if (isInstalled) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-emerald-800">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold">Aplikasi NearJob Aktif</h4>
            <p className="text-[11px] text-emerald-700">
              Anda sedang menggunakan NearJob dalam mode aplikasi standalone.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary to-primary-hover text-white shadow-md shadow-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0 bg-white p-0.5 border border-white/20">
          <Image
            src="/logo.png?v=2"
            alt="NearJob Icon"
            width={48}
            height={48}
            className="w-full h-full object-cover rounded-lg"
            unoptimized
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold tracking-tight">
              Pakai NearJob Sebagai Aplikasi
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
              Gratis
            </span>
          </div>
          <p className="text-xs text-white/90 mt-0.5">
            Bisa dipasang di HP (Android/iOS) dan Laptop. Akses lebih cepat & layar penuh.
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/80 font-medium">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> Android & iPhone
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Laptop className="w-3 h-3" /> Windows & Mac
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={promptInstall}
        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-primary hover:bg-slate-50 font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all shrink-0 hover:scale-102 cursor-pointer"
      >
        <Download className="w-4 h-4" />
        <span>Unduh / Pasang Aplikasi</span>
      </button>
    </div>
  );
}
