"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Package, Wallet, User } from "lucide-react";

export function MitraBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Radar", href: "/mitra", icon: Compass },
    { label: "Orderan", href: "/mitra/orders", icon: Package },
    { label: "Dompet", href: "/mitra/wallet", icon: Wallet },
    { label: "Profil", href: "/mitra/profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-border/80 shadow-lg pb-safe">
      <div className="grid grid-cols-4 h-15">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? "text-primary font-bold" : "text-gray hover:text-dark"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
