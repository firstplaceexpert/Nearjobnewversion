"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Power,
  ArrowLeftRight,
  Wallet,
  Compass,
  Package,
  User,
  Star,
} from "lucide-react";
import type { MitraProfile } from "@/features/tasks/types";
import { ProfileMenu } from "@/components/ui/profile-menu";

interface MitraNavbarProps {
  profile: MitraProfile;
  isOnline: boolean;
  onToggleOnline: () => void;
  isToggling?: boolean;
}

export function MitraNavbar({
  profile,
  isOnline,
  onToggleOnline,
  isToggling = false,
}: MitraNavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { label: "Radar Order", href: "/mitra", icon: Compass },
    { label: "Tugas Saya", href: "/mitra/orders", icon: Package },
    { label: "Dompet Mitra", href: "/mitra/wallet", icon: Wallet },
    { label: "Profil Akun", href: "/mitra/profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-border bg-white shadow-xs">
      {/* Top Banner: Dual Portal Switcher Indicator */}
      <div className="bg-dark text-white px-3 sm:px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse shrink-0"></span>
            <span className="font-bold text-[11px] sm:text-xs text-white tracking-wide truncate">
              NEAR MITRA • Mode Kerja
            </span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 font-semibold text-primary-light hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] shrink-0"
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span className="hidden sm:inline">Kembali ke Aplikasi Pelanggan</span>
            <span className="sm:hidden">App Pelanggan</span>
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Brand */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/mitra" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-primary/20">
              N
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-dark tracking-tight">
                  NEAR<span className="text-primary font-black">MITRA</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-primary-light text-primary rounded-md uppercase">
                  PARTNER
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray">
                <Star className="w-3 h-3 fill-warning text-warning" />
                <span className="font-bold text-dark">{profile.rating}</span>
                <span>• Terverifikasi</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-gray-border/60 pl-4">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-xs"
                      : "text-gray hover:text-dark hover:bg-light"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Online Toggle, Quick Balance, Customer App link */}
        <div className="flex items-center gap-3">
          {/* Quick Balance Badge */}
          <Link
            href="/mitra/wallet"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-light hover:bg-primary-light/40 border border-gray-border/60 transition-colors"
          >
            <Wallet className="w-4 h-4 text-primary" />
            <div className="text-left">
              <span className="text-[10px] text-gray block leading-none">
                Pendapatan Hari Ini
              </span>
              <span className="text-xs font-extrabold text-dark leading-none">
                Rp {profile.todayEarnings.toLocaleString("id-ID")}
              </span>
            </div>
          </Link>

          {/* Online / Offline Toggle Button */}
          <button
            onClick={onToggleOnline}
            disabled={isToggling}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl font-bold text-xs transition-all shadow-sm shrink-0 ${
              isOnline
                ? "bg-success text-white hover:bg-success/90 shadow-success/20 ring-2 ring-success/30"
                : "bg-gray-light/40 text-gray hover:bg-gray-light/60 hover:text-dark"
            }`}
          >
            <Power className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">
              {isOnline ? "SIAP KERJA (ONLINE)" : "ISTIRAHAT (OFFLINE)"}
            </span>
            <span className="sm:hidden">{isOnline ? "ONLINE" : "OFFLINE"}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-white animate-ping" : "bg-gray"
              }`}
            ></span>
          </button>

          {/* Profile Menu (Avatar Only) */}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
