"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Tag, LayoutDashboard, MessageSquare, ArrowLeftRight } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Beranda", href: "/", icon: Home },
    { label: "Promo", href: "/promo", icon: Tag },
    { label: "Aktivitas", href: "/dashboard", icon: LayoutDashboard },
    { label: "Chat", href: "/chat", icon: MessageSquare },
    { label: "Mitra", href: "/mitra", icon: ArrowLeftRight },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-border px-2 py-1.5 shadow-lg flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
              isActive ? "text-primary font-bold scale-105" : "text-gray hover:text-dark"
            } ${item.label === "Mitra" ? "font-bold text-slate-800" : ""}`}
          >
            <Icon
              className={`w-5 h-5 mb-0.5 ${
                isActive
                  ? "text-primary stroke-[2.5]"
                  : item.label === "Mitra"
                    ? "text-amber-500 stroke-[2.2]"
                    : "stroke-[1.8]"
              }`}
            />
            <span className="text-[10px] leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
