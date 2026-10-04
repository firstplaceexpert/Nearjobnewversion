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
          ? "bg-gradient-to-r from-[#2F2B4F] to-[#3f3a69] text-white border-[#3f3a69] shadow-md shadow-[#2F2B4F]/20"
          : "bg-gradient-to-r from-[#1867F8]/10 via-[#23C8FE]/10 to-white text-dark border-[#1867F8]/20 shadow-xs"
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Information */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              isMitra
                ? "bg-[#FEE49A] text-[#2F2B4F] font-extrabold"
                : "bg-[#1867F8] text-white font-extrabold"
            }`}
          >
            {isMitra ? <Bike className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isMitra
                    ? "bg-[#FEE49A]/20 text-[#FEE49A] border border-[#FEE49A]/40"
                    : "bg-[#1867F8]/10 text-[#1867F8] border border-[#1867F8]/20"
                }`}
              >
                {isMitra ? "Mode Aktif: MITRA KERJA" : "Mode Aktif: KONSUMEN"}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1867F8]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1867F8]" />
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
              ? "bg-white hover:bg-slate-100 text-[#2F2B4F]"
              : "bg-[#2F2B4F] hover:bg-[#3f3a69] text-white"
          }`}
        >
          <ArrowLeftRight className="w-4 h-4 text-[#FEE49A]" />
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
