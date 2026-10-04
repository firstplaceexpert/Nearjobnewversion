"use client";

import { Download } from "lucide-react";
import { usePwa } from "./pwa-provider";

interface PwaInstallButtonProps {
  className?: string;
  variant?: "navbar" | "full" | "outline";
}

export function PwaInstallButton({
  className = "",
  variant = "navbar",
}: PwaInstallButtonProps) {
  const { isInstallable, isInstalled, promptInstall } = usePwa();

  if (isInstalled || !isInstallable) {
    return null;
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={promptInstall}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-xs hover:shadow transition-all ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>Unduh / Pasang App</span>
      </button>
    );
  }

  if (variant === "outline") {
    return (
      <button
        type="button"
        onClick={promptInstall}
        className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Unduh / Pasang App</span>
      </button>
    );
  }

  // Default navbar variant: visible on desktop/tablet
  return (
    <button
      type="button"
      onClick={promptInstall}
      className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold border border-primary/25 transition-all hover:scale-102 cursor-pointer ${className}`}
      title="Pasang NearJob ke Komputer atau HP"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install App</span>
    </button>
  );
}
