"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftRight, Bike, User, CheckCircle2 } from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RoleSwitcherBannerProps {
  currentRole: "POSTER" | "WORKER";
  className?: string;
}

export function RoleSwitcherBanner({
  currentRole,
  className = "",
}: RoleSwitcherBannerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isMitra = currentRole === "WORKER";

  const switchMutation = useMutation({
    mutationFn: async (targetRole: "POSTER" | "WORKER") => {
      const targetUserId =
        targetRole === "WORKER" ? "usr-worker-siti" : "usr-poster-budi";

      const res = await fetch("/api/auth/active-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });
      return res.json();
    },
    onSuccess: (_, targetRole) => {
      queryClient.invalidateQueries({ queryKey: ["activeUser"] });
      queryClient.invalidateQueries({ queryKey: ["posterDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["mitraDashboard"] });

      if (targetRole === "WORKER") {
        router.push("/mitra");
      } else {
        router.push("/");
      }
    },
  });

  const handleSwitch = () => {
    if (isMitra) {
      switchMutation.mutate("POSTER");
    } else {
      switchMutation.mutate("WORKER");
    }
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl border transition-all ${
        isMitra
          ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700 shadow-md shadow-slate-900/10"
          : "bg-gradient-to-r from-blue-50 to-indigo-50/60 text-dark border-primary/25 shadow-xs"
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Information */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              isMitra
                ? "bg-amber-400 text-slate-900 font-extrabold"
                : "bg-primary text-white font-extrabold"
            }`}
          >
            {isMitra ? <Bike className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isMitra
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                    : "bg-primary-light text-primary border border-primary/20"
                }`}
              >
                {isMitra ? "Mode Aktif: MITRA KERJA" : "Mode Aktif: KONSUMEN"}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Terhubung</span>
              </span>
            </div>

            <h4
              className={`text-sm sm:text-base font-extrabold mt-1 tracking-tight ${
                isMitra ? "text-white" : "text-dark"
              }`}
            >
              {isMitra
                ? "Sedang Siap Terima Orderan (Mitra Kerja)"
                : "Sedang Dalam Mode Pemesan (Konsumen)"}
            </h4>

            <p
              className={`text-xs mt-0.5 max-w-md ${
                isMitra ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {isMitra
                ? "Mau mencari bantuan atau posting lowongan tugas? Beralih ke akun Konsumen kapan saja."
                : "Punya waktu luang dan ingin cari cuan dengan ambil orderan terdekat? Beralih ke akun Mitra."}
            </p>
          </div>
        </div>

        {/* The Action Switch Button */}
        <button
          type="button"
          onClick={handleSwitch}
          disabled={switchMutation.isPending}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shrink-0 cursor-pointer shadow-sm hover:scale-102 ${
            isMitra
              ? "bg-white hover:bg-slate-100 text-slate-900"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          }`}
        >
          <ArrowLeftRight className="w-4 h-4 text-amber-400" />
          <span>
            {switchMutation.isPending
              ? "Mengalihkan..."
              : isMitra
                ? "Beralih ke Konsumen"
                : "Beralih ke Mode Mitra 🛵"}
          </span>
        </button>
      </div>
    </div>
  );
}
