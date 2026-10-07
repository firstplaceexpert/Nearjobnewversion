"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { NotificationsPopover } from "@/components/ui/notifications-popover";
import { ProfileMenu } from "@/components/ui/profile-menu";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { label: "Beranda", href: "/" },
    { label: "Promo", href: "/promo" },
    { label: "Aktivitas", href: "/dashboard" },
    { label: "Chat", href: "/chat" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-border bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="inline-flex items-center p-1 rounded-xl hover:opacity-95 transition-opacity"
            aria-label="NEAR JOB Beranda"
          >
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation: Beranda, Promo, Aktivitas, Chat */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.href)
                    ? "bg-primary-light text-primary font-bold shadow-xs"
                    : "text-gray-600 hover:text-dark hover:bg-light"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Actions: Notifikasi & Profil */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Notifikasi */}
          <NotificationsPopover />

          {/* Menu Profil Interaktif & Role Switcher */}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
