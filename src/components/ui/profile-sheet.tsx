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
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileModals, type ProfileModalType } from "./profile-modals";

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
  const [activeModal, setActiveModal] = useState<ProfileModalType>(null);
  const [activeInfoToast, setActiveInfoToast] = useState<string | null>(null);
  const [customName, setCustomName] = useState<string | null>(null);
  const [customPhone, setCustomPhone] = useState<string | null>(null);

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
  const userName = currentUser?.name || "Dimas Pratama";
  const userEmail = currentUser?.email || "dimas@nearjob.id";
  const userPhone = currentUser?.phone || "+6281298765432";

  const effectiveName = customName || userName;
  const effectivePhone = customPhone || userPhone;

  // Get Initials (e.g. Dimas Pratama -> DP)
  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr.slice(0, 2).toUpperCase() || "DP";
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

      {/* Drawer Panel: NearJob profile design */}
      <div className="relative w-full sm:max-w-md bg-light h-[100dvh] overflow-y-auto shadow-2xl z-10 animate-slide-in-right pb-16 select-none">
        {/* Top Section with Illustrated NearJob Brand Banner */}
        <div className="relative bg-gradient-to-b from-primary via-primary to-secondary overflow-hidden pt-5 pb-20 px-4 min-h-[175px]">
          {/* Top Bar: Back Arrow + "Profil" */}
          <div className="flex items-center gap-3 relative z-10 mb-2">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5 text-white stroke-[2.5]" />
            </button>
            <h1 className="text-xl font-black text-white tracking-tight">Profil</h1>
          </div>

          {/* Cute SVG Illustration Background: Hills, Phone, Lock, Gear, Asterisks, Sparkles */}
          <div className="absolute right-1 -top-1 w-48 h-40 pointer-events-none select-none opacity-95">
            <svg viewBox="0 0 200 160" className="w-full h-full">
              {/* Soft wave contour */}
              <path d="M30 160 Q80 85 200 115 L200 160 Z" fill="#2F2B4F" opacity="0.18" />
              <path
                d="M60 160 Q120 95 200 130 L200 160 Z"
                fill="#2F2B4F"
                opacity="0.25"
              />

              {/* Angled Smartphone Vector */}
              <g transform="rotate(-6 130 80)">
                <rect
                  x="90"
                  y="12"
                  width="72"
                  height="125"
                  rx="16"
                  fill="#2F2B4F"
                  opacity="0.95"
                />
                <rect x="95" y="20" width="62" height="109" rx="12" fill="#23C8FE" />

                {/* Profile Silhouette inside phone */}
                <circle cx="126" cy="52" r="14" fill="#E6F9FF" />
                <path d="M106 88 C106 72, 146 72, 146 88 Z" fill="#E6F9FF" />

                {/* Top speaker slit */}
                <rect x="116" y="15" width="20" height="3" rx="1.5" fill="#3F3A69" />
              </g>

              {/* Pink lock badge */}
              <circle cx="166" cy="62" r="16" fill="#FF9DE0" />
              <rect x="158" y="59" width="16" height="12" rx="3" fill="#C8469C" />
              <path
                d="M162 59 V53 A4 4 0 0 1 170 53 V59"
                fill="none"
                stroke="#C8469C"
                strokeWidth="2.5"
              />

              {/* Gear icon */}
              <circle cx="76" cy="62" r="11" fill="#2F2B4F" opacity="0.6" />
              <circle cx="76" cy="62" r="4.5" fill="#FEE49A" />

              {/* Password bubble */}
              <rect x="60" y="22" width="54" height="19" rx="9.5" fill="#E8F0FE" />
              <circle cx="72" cy="31.5" r="2.5" fill="#1867F8" />
              <circle cx="87" cy="31.5" r="2.5" fill="#1867F8" />
              <circle cx="102" cy="31.5" r="2.5" fill="#1867F8" />

              {/* Sparkle Stars */}
              <polygon
                points="48,92 50,97 55,99 50,101 48,106 46,101 41,99 46,97"
                fill="#FEE49A"
              />
              <polygon
                points="182,102 183,105 186,106 183,107 182,110 181,107 178,106 181,105"
                fill="#FFFFFF"
              />
            </svg>
          </div>
        </div>

        {/* Floating Profile Card: DP, Dimas Pratama */}
        <div className="relative -mt-14 mx-4 z-10 bg-white rounded-3xl shadow-md border border-slate-100/90 overflow-hidden">
          <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Circle avatar: Green with white initials */}
              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs ring-4 ring-white">
                {getInitials(effectiveName)}
              </div>

              {/* User details */}
              <div className="min-w-0 space-y-0.5">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                  {effectiveName}
                </h2>
                <p className="text-xs text-slate-500 font-medium truncate leading-tight">
                  {userEmail}
                </p>
                <p className="text-xs text-slate-500 font-medium leading-tight">
                  {effectivePhone}
                </p>
              </div>
            </div>

            {/* Edit button */}
            <button
              type="button"
              onClick={() => setActiveModal("EDIT_PROFILE")}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors shrink-0 cursor-pointer"
              title="Edit Profil"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          {/* Golden "NearPoin" Rewards Ribbon */}
          <button
            type="button"
            onClick={() => setActiveModal("NEARPOIN")}
            className="w-full bg-warning px-4 py-2.5 flex items-center justify-between text-left hover:bg-warning/80 transition-colors cursor-pointer border-t border-warning-deep/20"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-warning/20 flex items-center justify-center text-warning-deep">
                <Star className="w-3.5 h-3.5 fill-warning text-warning-deep" />
              </div>
              <span className="font-extrabold text-xs text-dark">Gabung NearPoin</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-warning-deep">
                Ada reward eksklusif
              </span>
              <div className="w-5 h-5 rounded-full bg-dark text-white flex items-center justify-center text-[10px] font-bold">
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
              onClick={() => setActiveModal("SECURITY")}
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
              onClick={() => setActiveModal("SUBSCRIPTION")}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Repeat className="w-5 h-5 text-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Langganan</span>
                  <span className="bg-primary text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    Promo terbatas 🔥
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Metode pembayaran */}
            <button
              type="button"
              onClick={() => setActiveModal("PAYMENT")}
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
              onClick={() => setActiveModal("FAMILY")}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Akun Keluarga</span>
                  <span className="bg-primary text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                    Baru
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Alamat tersimpan */}
            <button
              type="button"
              onClick={() => setActiveModal("ADDRESSES")}
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
              onClick={() => setActiveModal("VERIFICATION")}
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
              onClick={() => setActiveModal("APP_ICON")}
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
              className="w-full p-3.5 flex items-center justify-between hover:bg-error-light transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-error-hover" />
                <span className="text-xs font-bold text-error-hover">Keluar Akun</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Toast Notification */}
      {activeInfoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100060] bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-fade-in pointer-events-none">
          <CheckCircle2 className="w-4 h-4 text-secondary" />
          <span>{activeInfoToast}</span>
        </div>
      )}

      {/* All Preference & Profile Sub-Modals */}
      <ProfileModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onSuccess={(msg) => triggerToast(msg)}
        userData={{
          name: effectiveName,
          email: userEmail,
          phone: effectivePhone,
        }}
        onUpdateUser={({ name, phone }) => {
          setCustomName(name);
          setCustomPhone(phone);
        }}
      />
    </div>,
    document.body,
  );
}
