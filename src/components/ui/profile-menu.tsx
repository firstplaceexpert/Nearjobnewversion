"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  ArrowLeftRight,
  Bike,
  LayoutDashboard,
  MessageSquare,
  Tag,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ActiveUserResponse {
  success: boolean;
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: "POSTER" | "WORKER";
  } | null;
}

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const isMitraPath = pathname.startsWith("/mitra");

  // Fetch current user from active-user API
  const { data } = useQuery<ActiveUserResponse>({
    queryKey: ["activeUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/active-user");
      return res.json();
    },
  });

  const currentUser = data?.currentUser;

  // Switch role mutation
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
      setIsOpen(false);

      if (targetRole === "WORKER") {
        router.push("/mitra");
      } else {
        router.push("/");
      }
    },
  });

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleMode = () => {
    if (isMitraPath) {
      switchMutation.mutate("POSTER");
    } else {
      switchMutation.mutate("WORKER");
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-light hover:bg-gray-border/40 border border-gray-border/60 transition-all hover:scale-102 cursor-pointer shadow-2xs"
        aria-label="Buka Menu Profil & Ganti Peran"
        title="Profil & Ganti Peran Akun"
      >
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
          {isMitraPath ? (
            <Bike className="w-4 h-4 text-white" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
        <div className="hidden sm:flex flex-col text-left leading-none">
          <span className="text-xs font-bold text-dark truncate max-w-[100px]">
            {currentUser?.name || (isMitraPath ? "Siti Rahma" : "Budi Santoso")}
          </span>
          <span className="text-[10px] font-semibold text-primary">
            {isMitraPath ? "Mode Mitra" : "Konsumen"}
          </span>
        </div>
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-3xl shadow-2xl border border-gray-border overflow-hidden z-50 animate-scale-in">
          {/* Header Info */}
          <div className="p-4 bg-gradient-to-br from-slate-50 to-white border-b border-gray-border/60">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-base shadow-sm ${
                  isMitraPath
                    ? "bg-[#1867F8] ring-2 ring-[#23C8FE]/40"
                    : "bg-primary ring-2 ring-primary-light"
                }`}
              >
                {isMitraPath ? (
                  <Bike className="w-6 h-6 text-white" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-dark truncate">
                    {currentUser?.name || (isMitraPath ? "Siti Rahma" : "Budi Santoso")}
                  </h4>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isMitraPath
                        ? "bg-[#1867F8]/10 text-[#1867F8]"
                        : "bg-primary-light text-primary"
                    }`}
                  >
                    {isMitraPath ? "Mitra Kerja" : "Konsumen"}
                  </span>
                </div>
                <p className="text-xs text-gray truncate mt-0.5">
                  {currentUser?.email ||
                    (isMitraPath ? "siti@nearjob.id" : "budi@nearjob.id")}
                </p>
              </div>
            </div>
          </div>

          {/* THE 1-CLICK DUAL-MODE ROLE SWITCHER */}
          <div className="p-4 bg-[#1867F8]/5 border-b border-gray-border/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-dark uppercase tracking-wider flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
                <span>Ganti Peran Akun</span>
              </span>
              <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 1-Klik Beralih
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleMode}
              disabled={switchMutation.isPending}
              className="w-full p-3.5 rounded-2xl flex items-center justify-between gap-3 text-left transition-all shadow-md cursor-pointer group bg-gradient-to-r from-[#1867F8] to-[#23C8FE] hover:opacity-95 text-white shadow-[#1867F8]/20"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {isMitraPath ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bike className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-black block leading-tight">
                    {isMitraPath
                      ? "Beralih ke Mode Konsumen"
                      : "Beralih ke Mode Mitra Kerja"}
                  </span>
                  <span className="text-[11px] text-white/90 block leading-tight mt-0.5">
                    {isMitraPath
                      ? "Pesan bantuan & kirim tugas"
                      : "Terima orderan & cari uang"}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </button>
          </div>

          {/* Quick Menu Links */}
          <div className="p-2 space-y-1 text-xs">
            {isMitraPath ? (
              <>
                <Link
                  href="/mitra"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark hover:bg-light font-semibold transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  <span>Radar Orderan Aktif</span>
                </Link>
                <Link
                  href="/mitra/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark hover:bg-light font-semibold transition-colors"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span>Profil & Performa Mitra</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark hover:bg-light font-semibold transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  <span>Aktivitas & Riwayat Tugas</span>
                </Link>
                <Link
                  href="/chat"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark hover:bg-light font-semibold transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span>Pesan & Obrolan Pekerja</span>
                </Link>
                <Link
                  href="/promo"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark hover:bg-light font-semibold transition-colors"
                >
                  <Tag className="w-4 h-4 text-primary" />
                  <span>Klaim Voucher Promo</span>
                </Link>
              </>
            )}
          </div>

          {/* Security Footer */}
          <div className="p-3 bg-light/60 border-t border-gray-border/60 flex items-center justify-between text-[11px] text-gray px-4">
            <span className="flex items-center gap-1.5 text-primary font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Akun Terverifikasi
            </span>
            <span className="font-mono text-[10px]">NearJob v1.0</span>
          </div>
        </div>
      )}
    </div>
  );
}
