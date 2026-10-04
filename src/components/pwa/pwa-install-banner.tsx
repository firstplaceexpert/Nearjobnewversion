"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Download, X, Share2, PlusSquare, Smartphone } from "lucide-react";
import { usePwa } from "./pwa-provider";

function subscribeStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getDismissedSnapshot() {
  if (typeof window === "undefined") return true;
  const lastDismissed = localStorage.getItem("nearjob_pwa_banner_dismissed");
  if (!lastDismissed) return false;
  const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
  return parseInt(lastDismissed, 10) >= twoDaysAgo;
}

function getDismissedServerSnapshot() {
  return true;
}

export function PwaInstallBanner() {
  const {
    isInstallable,
    isInstalled,
    isIos,
    promptInstall,
    showIosGuide,
    setShowIosGuide,
  } = usePwa();

  const [localDismissed, setLocalDismissed] = useState(false);

  const storedDismissed = useSyncExternalStore(
    subscribeStorage,
    getDismissedSnapshot,
    getDismissedServerSnapshot,
  );

  const isDismissed = localDismissed || storedDismissed;

  const handleDismiss = () => {
    setLocalDismissed(true);
    try {
      localStorage.setItem("nearjob_pwa_banner_dismissed", Date.now().toString());
    } catch {}
  };

  if (
    isInstalled ||
    (isDismissed && !showIosGuide) ||
    (!isInstallable && !showIosGuide)
  ) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Banner */}
      {!isDismissed && isInstallable && (
        <aside
          role="complementary"
          aria-label="Pemberitahuan Pasang Aplikasi NearJob"
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-white/95 backdrop-blur-md border border-primary/20 shadow-2xl rounded-2xl p-4 transition-all duration-300 animate-slide-up"
        >
          <div className="flex items-start gap-3">
            {/* App Icon */}
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0 border border-gray-border/60">
              <Image
                src="/logo.png?v=2"
                alt="NearJob App Icon"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-dark tracking-tight">
                  Pasang Aplikasi NearJob
                </h4>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="p-1 -mr-1 text-gray hover:text-dark rounded-full hover:bg-light transition-colors"
                  aria-label="Tutup saran instalasi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray mt-0.5 line-clamp-2">
                Akses instan di HP & Desktop tanpa buka browser, lebih cepat dan hemat
                kuota.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={promptInstall}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isIos ? "Cara Pasang di iPhone" : "Pasang Sekarang"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-xs text-gray hover:text-dark px-2 py-1.5 font-medium transition-colors"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* iOS Safari Instruction Modal */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-slide-up text-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-border/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-dark">
                    Pasang di iPhone / iPad
                  </h3>
                  <p className="text-xs text-gray">Tanpa perlu App Store (100% Gratis)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-full text-gray hover:text-dark hover:bg-light"
                aria-label="Tutup panduan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-light text-primary font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-gray-700">
                  <p>
                    Ketuk tombol <strong className="text-dark">Bagikan (Share)</strong> di
                    bilah bawah browser Safari:
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-light text-primary font-medium text-xs">
                    <Share2 className="w-4 h-4" />
                    <span>Ikon Bagikan / Share</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-light text-primary font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-gray-700">
                  <p>Gulir sedikit ke bawah dan pilih:</p>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-light text-dark font-semibold text-xs border border-gray-border/60">
                    <PlusSquare className="w-4 h-4 text-primary" />
                    <span>Tambah ke Layar Utama (Add to Home Screen)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-light text-primary font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-gray-700">
                  <p>
                    Ketuk <strong className="text-primary">Tambah (Add)</strong> di pojok
                    kanan atas. Aplikasi NearJob langsung muncul di layar HP Anda!
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover shadow-sm transition-all"
            >
              Mengerti & Siap Pasang
            </button>
          </div>
        </div>
      )}
    </>
  );
}
