"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
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

  // Hydration-safe mount detection without setState-in-effect
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [activeInfoToast, setActiveInfoToast] = useState<string | null>(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex justify-end animate-fade-in overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel: matching Gojek Profile design */}
      <div className="relative w-full sm:max-w-md bg-[#F6F7F9] h-[100dvh] overflow-y-auto shadow-2xl z-10 animate-slide-in-right pb-16 select-none">
        {/* Top Section with Illustrated Green Superapp Banner */}
        <div className="relative bg-gradient-to-b from-[#87DC71] via-[#74D15C] to-[#5FC445] overflow-hidden pt-5 pb-20 px-4 min-h-[175px]">
          {/* Top Bar: Back Arrow + "Profil" */}
          <div className="flex items-center gap-3 relative z-10 mb-2">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/50 hover:bg-white text-slate-900 flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5 text-slate-900 stroke-[2.5]" />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Profil</h1>
          </div>

          {/* Cute SVG Illustration Background: Hills, Phone, Lock, Gear, Asterisks, Sparkles */}
          <div className="absolute right-1 -top-1 w-48 h-40 pointer-events-none select-none opacity-95">
            <svg viewBox="0 0 200 160" className="w-full h-full">
              {/* Green Hill Contour */}
              <path d="M30 160 Q80 85 200 115 L200 160 Z" fill="#4EAB36" opacity="0.35" />
              <path
                d="M60 160 Q120 95 200 130 L200 160 Z"
                fill="#4EAB36"
                opacity="0.45"
              />

              {/* Angled Smartphone Vector */}
              <g transform="rotate(-6 130 80)">
                <rect
                  x="90"
                  y="12"
                  width="72"
                  height="125"
                  rx="16"
                  fill="#1E40AF"
                  opacity="0.95"
                />
                <rect x="95" y="20" width="62" height="109" rx="12" fill="#60A5FA" />

                {/* Profile Silhouette inside phone */}
                <circle cx="126" cy="52" r="14" fill="#BFDBFE" />
                <path d="M106 88 C106 72, 146 72, 146 88 Z" fill="#BFDBFE" />

                {/* Top speaker slit */}
                <rect x="116" y="15" width="20" height="3" rx="1.5" fill="#93C5FD" />
              </g>

              {/* Blue lock badge */}
              <circle cx="166" cy="62" r="16" fill="#38BDF8" />
              <rect x="158" y="59" width="16" height="12" rx="3" fill="#0284C7" />
              <path
                d="M162 59 V53 A4 4 0 0 1 170 53 V59"
                fill="none"
                stroke="#0284C7"
                strokeWidth="2.5"
              />

              {/* Gear icon */}
              <circle cx="76" cy="62" r="11" fill="#0D9488" opacity="0.85" />
              <circle cx="76" cy="62" r="4.5" fill="#5FC445" />

              {/* Password bubble */}
              <rect x="60" y="22" width="54" height="19" rx="9.5" fill="#A7F3D0" />
              <circle cx="72" cy="31.5" r="2.5" fill="#047857" />
              <circle cx="87" cy="31.5" r="2.5" fill="#047857" />
              <circle cx="102" cy="31.5" r="2.5" fill="#047857" />

              {/* Sparkle Stars */}
              <polygon
                points="48,92 50,97 55,99 50,101 48,106 46,101 41,99 46,97"
                fill="#FEF08A"
              />
              <polygon
                points="182,102 183,105 186,106 183,107 182,110 181,107 178,106 181,105"
                fill="#FFFFFF"
              />
            </svg>
          </div>
        </div>

        {/* Floating Profile Card: RH, Rois hadi, roishp01@gmail.com, +6281327446342 */}
        <div className="relative -mt-14 mx-4 z-10 bg-white rounded-3xl shadow-md border border-slate-100/90 overflow-hidden">
          <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Circle avatar: Green with white initials RH */}
              <div className="w-14 h-14 rounded-full bg-[#00880D] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs ring-4 ring-white">
                {getInitials(userName)}
              </div>

              {/* User details */}
              <div className="min-w-0 space-y-0.5">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                  {userName}
                </h2>
                <p className="text-xs text-slate-500 font-medium truncate leading-tight">
                  {userEmail}
                </p>
                <p className="text-xs text-slate-500 font-medium leading-tight">
                  {userPhone}
                </p>
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
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors shrink-0 cursor-pointer"
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
            className="w-full bg-[#FEE49A] px-4 py-2.5 flex items-center justify-between text-left hover:bg-[#FDD874] transition-colors cursor-pointer border-t border-[#FCD34D]"
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
        <div className="pt-2">
          <div className="px-5 py-2">
            <h3 className="text-xs font-bold text-slate-500">Preferensi</h3>
          </div>

          <div className="mx-4 bg-white rounded-2xl border border-slate-100 shadow-2xs divide-y divide-slate-100 overflow-hidden">
            {/* Keamanan akun */}
            <button
              type="button"
              onClick={() => triggerToast("Keamanan Akun: 2FA & Password Terlindungi.")}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
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
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
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
                triggerToast("Membuka Saldo & Rekber NearPay.");
              }}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
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
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
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
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
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
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
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

        {/* Section 2: Aktivitas di NearJob */}
        <div className="pt-2">
          <div className="px-5 py-2">
            <h3 className="text-xs font-bold text-slate-500">Aktivitas di NearJob</h3>
          </div>

          <div className="mx-4 bg-white rounded-2xl border border-slate-100 shadow-2xs divide-y divide-slate-100 overflow-hidden">
            {/* Aktivitas */}
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push(isMitraPath ? "/mitra/orders" : "/dashboard");
              }}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
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
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
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
        <div className="pt-2">
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
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
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
              className="w-full p-3.5 flex items-center justify-between hover:bg-primary-light/30 transition-colors text-left cursor-pointer"
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
              className="w-full p-3.5 flex items-center justify-between hover:bg-rose-50 transition-colors text-left cursor-pointer"
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
          <div className="fixed inset-0 z-[100005] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900">
                  Edit Data Profil
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
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
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    triggerToast("Data profil berhasil diperbarui!");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00880D] hover:bg-[#00700B] text-white shadow-xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
