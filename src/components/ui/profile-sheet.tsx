"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Star,
  Shield,
  CreditCard,
  Users,
  Bookmark,
  UserCheck,
  Clock,
  Tag,
  Smartphone,
  ChevronRight,
  ArrowLeftRight,
  LogOut,
  Repeat,
  CheckCircle2,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActiveUserResponse {
  success: boolean;
  currentUser: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: "POSTER" | "WORKER";
  } | null;
}

export function ProfileSheet({ isOpen, onClose }: ProfileSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const isMitraPath = pathname.startsWith("/mitra");

  // Edit profile state modal
  const [isEditing, setIsEditing] = useState(false);
  const [activeInfoToast, setActiveInfoToast] = useState<string | null>(null);

  // Fetch active user
  const { data } = useQuery<ActiveUserResponse>({
    queryKey: ["activeUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/active-user");
      return res.json();
    },
  });

  const currentUser = data?.currentUser;
  const userName = currentUser?.name || "Rois hadi";
  const userEmail = currentUser?.email || "roishp01@gmail.com";
  const userPhone = currentUser?.phone || "+6281327446342";

  const [editName, setEditName] = useState(userName);
  const [editPhone, setEditPhone] = useState(userPhone);

  // Get Initials (e.g. Rois Hadi -> RH)
  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr.slice(0, 2).toUpperCase() || "RH";
  };

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
      onClose();

      if (targetRole === "WORKER") {
        router.push("/mitra");
      } else {
        router.push("/");
      }
    },
  });

  const handleToggleMode = () => {
    if (isMitraPath) {
      switchMutation.mutate("POSTER");
    } else {
      switchMutation.mutate("WORKER");
    }
  };

  const triggerToast = (msg: string) => {
    setActiveInfoToast(msg);
    setTimeout(() => setActiveInfoToast(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end animate-fade-in">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel: matching Gojek Profile design */}
      <div className="relative w-full max-w-md bg-[#F6F7F9] min-h-screen h-full overflow-y-auto shadow-2xl flex flex-col z-10 animate-slide-in-right pb-10">
        {/* Top Section with Illustrated Green Superapp Banner */}
        <div className="relative bg-gradient-to-b from-[#8BE376] via-[#7CD967] to-[#6ECF57] overflow-hidden pt-4 pb-16 px-4">
          {/* Top Bar: Back Arrow + "Profil" */}
          <div className="flex items-center gap-3 relative z-10 mb-1">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/70 hover:bg-white text-slate-900 flex items-center justify-center transition-all shadow-xs cursor-pointer"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5 text-slate-900" />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Profil</h1>
          </div>

          {/* Cute SVG Illustration Background: Hills, Phone, Lock, Gear, Asterisks, Sparkles */}
          <div className="absolute right-2 top-2 w-48 h-36 pointer-events-none select-none opacity-90">
            <svg viewBox="0 0 200 150" className="w-full h-full">
              {/* Smartphone vector */}
              <rect
                x="85"
                y="15"
                width="70"
                height="115"
                rx="14"
                fill="#2563EB"
                opacity="0.9"
              />
              <rect x="90" y="22" width="60" height="100" rx="10" fill="#60A5FA" />
              {/* User avatar on phone */}
              <circle cx="120" cy="50" r="14" fill="#93C5FD" />
              <path d="M102 85 C102 70, 138 70, 138 85 Z" fill="#93C5FD" />
              {/* Blue lock badge */}
              <circle cx="155" cy="55" r="16" fill="#38BDF8" />
              <rect x="147" y="52" width="16" height="12" rx="3" fill="#0284C7" />
              <path
                d="M151 52 V46 A4 4 0 0 1 159 46 V52"
                fill="none"
                stroke="#0284C7"
                strokeWidth="2.5"
              />
              {/* Gear icon */}
              <circle cx="70" cy="55" r="11" fill="#0D9488" opacity="0.8" />
              {/* Password bubble */}
              <rect x="55" y="20" width="50" height="18" rx="9" fill="#A7F3D0" />
              <circle cx="68" cy="29" r="2.5" fill="#047857" />
              <circle cx="80" cy="29" r="2.5" fill="#047857" />
              <circle cx="92" cy="29" r="2.5" fill="#047857" />
              {/* Sparkles */}
              <polygon
                points="45,85 47,90 52,92 47,94 45,99 43,94 38,92 43,90"
                fill="#FEF08A"
              />
              <polygon
                points="175,95 176,98 179,99 176,100 175,103 174,100 171,99 174,98"
                fill="#FFFFFF"
              />
            </svg>
          </div>
        </div>

        {/* Floating Profile Card */}
        <div className="relative -mt-12 mx-4 z-10 bg-white rounded-3xl shadow-lg border border-slate-100/80 overflow-hidden">
          <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Circle avatar: Green with white initials */}
              <div className="w-14 h-14 rounded-full bg-[#00880D] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
                {getInitials(userName)}
              </div>

              {/* User details */}
              <div className="min-w-0 space-y-0.5">
                <h2 className="text-base font-extrabold text-slate-900 leading-tight truncate">
                  {userName}
                </h2>
                <p className="text-xs text-slate-500 truncate leading-tight">
                  {userEmail}
                </p>
                <p className="text-xs text-slate-500 leading-tight">{userPhone}</p>
              </div>
            </div>

            {/* Edit button */}
            <button
              type="button"
              onClick={() => {
                setEditName(userName);
                setEditPhone(userPhone);
                setIsEditing(true);
              }}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors shrink-0"
              title="Edit Profil"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          {/* Golden "Join GoStar" Ribbon Banner */}
          <button
            type="button"
            onClick={() =>
              triggerToast(
                "Selamat! Anda sudah tergabung di Program Mitra & Konsumen Bintang.",
              )
            }
            className="w-full bg-[#FEE49A] px-4 py-2.5 flex items-center justify-between text-left hover:bg-[#FDE080] transition-colors cursor-pointer border-t border-[#FDE080]"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-900">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
              </div>
              <span className="font-extrabold text-xs text-slate-900">Join GoStar</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-amber-950">
                Ada reward eksklusif
              </span>
              <div className="w-5 h-5 rounded-full bg-[#7C2D12] text-white flex items-center justify-center text-[10px] font-bold">
                &rarr;
              </div>
            </div>
          </button>
        </div>

        {/* Section 1: Preferensi */}
        <div className="mt-4">
          <div className="px-5 py-2">
            <h3 className="text-xs font-bold text-slate-500">Preferensi</h3>
          </div>

          <div className="mx-4 bg-white rounded-2xl border border-slate-100 shadow-2xs divide-y divide-slate-100 overflow-hidden">
            {/* Keamanan akun */}
            <button
              type="button"
              onClick={() => triggerToast("Keamanan Akun: 2FA & Password Terlindungi.")}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-slate-700" />
                <span className="text-xs font-bold text-slate-800">Keamanan akun</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Langganan */}
            <button
              type="button"
              onClick={() =>
                triggerToast("Langganan NearJob Plus aktif dengan diskon komisi.")
              }
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Repeat className="w-5 h-5 text-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Langganan</span>
                  <span className="bg-[#00880D] text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    Promo terbatas 🔥
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Metode pembayaran */}
            <button
              type="button"
              onClick={() => {
                onClose();
                triggerToast("Membuka Saldo & Rekber NearPay.");
              }}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-slate-700" />
                <span className="text-xs font-bold text-slate-800">
                  Metode pembayaran
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Akun Keluarga */}
            <button
              type="button"
              onClick={() =>
                triggerToast("Fitur Akun Keluarga: Hubungkan pembayaran bersama.")
              }
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Akun Keluarga</span>
                  <span className="bg-[#00880D] text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                    Baru
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Alamat tersimpan */}
            <button
              type="button"
              onClick={() =>
                triggerToast("Alamat utama Anda tersimpan: Kota Yogyakarta.")
              }
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Bookmark className="w-5 h-5 text-slate-700" />
                <span className="text-xs font-bold text-slate-800">Alamat tersimpan</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Pusat Akun Terverifikasi */}
            <button
              type="button"
              onClick={() =>
                triggerToast("Status Identitas: KTP & Email Terverifikasi Resmi.")
              }
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-slate-700" />
                <span className="text-xs font-bold text-slate-800">
                  Pusat Akun Terverifikasi
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Section 2: Aktivitas di Gojek / NearJob */}
        <div className="mt-4">
          <div className="px-5 py-2">
            <h3 className="text-xs font-bold text-slate-500">
              Aktivitas di {isMitraPath ? "NearMitra" : "Gojek / NearJob"}
            </h3>
          </div>

          <div className="mx-4 bg-white rounded-2xl border border-slate-100 shadow-2xs divide-y divide-slate-100 overflow-hidden">
            {/* Aktivitas */}
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push(isMitraPath ? "/mitra/orders" : "/dashboard");
              }}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-700" />
                <span className="text-xs font-bold text-slate-800">Aktivitas</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Promo & voucher */}
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/promo");
              }}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-slate-700" />
                <span className="text-xs font-bold text-slate-800">Promo & voucher</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Section 3: Pengaturan aplikasi & Switcher */}
        <div className="mt-4">
          <div className="px-5 py-2">
            <h3 className="text-xs font-bold text-slate-500">Pengaturan aplikasi</h3>
          </div>

          <div className="mx-4 bg-white rounded-2xl border border-slate-100 shadow-2xs divide-y divide-slate-100 overflow-hidden">
            {/* Ikon aplikasi */}
            <button
              type="button"
              onClick={() =>
                triggerToast("Tema Ikon Aplikasi: Mode Standar Hijau Superapp.")
              }
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-slate-700" />
                <span className="text-xs font-bold text-slate-800">Ikon aplikasi</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Ganti Peran: Mode Mitra <-> Mode Konsumen */}
            <button
              type="button"
              onClick={handleToggleMode}
              disabled={switchMutation.isPending}
              className="w-full p-3.5 flex items-center justify-between hover:bg-primary-light/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <ArrowLeftRight className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-xs font-bold text-dark block">
                    {isMitraPath ? "Beralih ke Mode Konsumen" : "Beralih ke Mode Mitra"}
                  </span>
                  <span className="text-[10px] text-primary font-semibold">
                    {switchMutation.isPending ? "Beralih..." : "1-Klik Beralih Portal"}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Keluar Akun */}
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/login");
              }}
              className="w-full p-3.5 flex items-center justify-between hover:bg-rose-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-rose-600" />
                <span className="text-xs font-bold text-rose-600">Keluar Akun</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Interactive Toast Notification */}
        {activeInfoToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{activeInfoToast}</span>
          </div>
        )}

        {/* Edit Profile Modal Dialog */}
        {isEditing && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900">
                  Edit Data Profil
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    triggerToast("Data profil berhasil diperbarui!");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00880D] hover:bg-[#00700B] text-white shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
