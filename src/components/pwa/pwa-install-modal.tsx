"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  X,
  Smartphone,
  Laptop,
  QrCode,
  Copy,
  Check,
  Download,
  Sparkles,
  ExternalLink,
  Share2,
  Plus,
  Info,
  Apple,
} from "lucide-react";
import { usePwa } from "./pwa-provider";

function subscribeEmpty() {
  return () => {};
}

function getMobileUrlSnapshot() {
  if (typeof window === "undefined") return "http://192.168.1.76:3000";
  return window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
    ? "http://192.168.1.76:3000"
    : window.location.origin;
}

function getMobileUrlServerSnapshot() {
  return "http://192.168.1.76:3000";
}

export function PwaInstallModal() {
  const { showInstallModal, setShowInstallModal, hasDeferredPrompt, promptInstall } =
    usePwa();

  const [activeTab, setActiveTab] = useState<"mobile" | "desktop" | "apk">("mobile");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const mobileUrl = useSyncExternalStore(
    subscribeEmpty,
    getMobileUrlSnapshot,
    getMobileUrlServerSnapshot,
  );

  useEffect(() => {
    QRCode.toDataURL(mobileUrl, {
      width: 220,
      margin: 1.5,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    })
      .then((dataUri) => setQrDataUrl(dataUri))
      .catch((err) => console.error("QR Code error:", err));
  }, [mobileUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!showInstallModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs animate-fade-in"
      onClick={() => setShowInstallModal(false)}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-border overflow-hidden animate-scale-in text-dark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-border/60 flex items-center justify-between bg-light/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden shadow-xs border border-primary/20 shrink-0 bg-[#1968F9]">
              <Image
                src="/logo.png?v=2"
                alt="NearJob Logo"
                width={44}
                height={44}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-dark">Unduh & Pasang NearJob</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#1867F8]/10 text-[#1867F8]">
                  100% Gratis
                </span>
              </div>
              <p className="text-xs text-gray">
                Akses cepat, hemat kuota & tampil di menu HP / Komputer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowInstallModal(false)}
            className="p-1.5 rounded-full text-gray hover:text-dark hover:bg-gray-border/40 transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-border bg-slate-50/80 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("mobile")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === "mobile"
                ? "border-primary text-primary bg-white rounded-t-xl shadow-2xs"
                : "border-transparent text-gray hover:text-dark"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Pasang di HP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("desktop")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === "desktop"
                ? "border-primary text-primary bg-white rounded-t-xl shadow-2xs"
                : "border-transparent text-gray hover:text-dark"
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Pasang di Laptop</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("apk")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === "apk"
                ? "border-primary text-primary bg-white rounded-t-xl shadow-2xs"
                : "border-transparent text-gray hover:text-dark"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>File APK Android</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: MOBILE (HP) */}
          {activeTab === "mobile" && (
            <div className="space-y-4 animate-fade-in">
              {/* QR Code Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-light/40 to-white border border-primary/20 flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2 rounded-xl shadow-xs border border-gray-border/80 shrink-0">
                  {qrDataUrl ? (
                    <Image
                      src={qrDataUrl}
                      alt="QR Code NearJob"
                      width={130}
                      height={130}
                      className="rounded-lg"
                      unoptimized
                    />
                  ) : (
                    <div className="w-[130px] h-[130px] flex items-center justify-center text-gray">
                      <QrCode className="w-8 h-8 animate-pulse text-primary" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
                    <Sparkles className="w-3 h-3" /> Scan Lewat Kamera HP
                  </span>
                  <h4 className="text-sm font-bold text-dark mt-0.5">
                    Arahkan kamera HP ke QR Code ini
                  </h4>
                  <p className="text-xs text-gray mt-1 leading-relaxed">
                    HP Anda akan langsung membuka NearJob. Pastikan HP terhubung ke Wi-Fi
                    yang sama.
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={mobileUrl}
                      className="text-xs bg-white border border-gray-border rounded-lg px-2.5 py-1.5 flex-1 font-mono text-slate-600 truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step By Step Guides */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Android Guide */}
                <div className="p-3.5 rounded-2xl bg-white border border-gray-border space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-dark">
                    <span className="w-6 h-6 rounded-lg bg-[#1867F8]/10 text-[#1867F8] flex items-center justify-center">
                      <Smartphone className="w-3.5 h-3.5" />
                    </span>
                    <span>Untuk Android (Chrome)</span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4 leading-snug">
                    <li>Buka alamat di atas di browser Google Chrome HP.</li>
                    <li>
                      Ketuk titik tiga <strong className="text-dark">⋮</strong> di pojok
                      kanan atas browser.
                    </li>
                    <li>
                      Pilih{" "}
                      <strong className="text-primary font-bold">
                        &quot;Tambahkan ke Layar Utama&quot;
                      </strong>{" "}
                      atau{" "}
                      <strong className="text-primary font-bold">
                        &quot;Install Aplikasi&quot;
                      </strong>
                      .
                    </li>
                  </ol>
                </div>

                {/* iPhone Guide */}
                <div className="p-3.5 rounded-2xl bg-white border border-gray-border space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-dark">
                    <span className="w-6 h-6 rounded-lg bg-[#1867F8]/10 text-[#1867F8] flex items-center justify-center">
                      <Apple className="w-3.5 h-3.5" />
                    </span>
                    <span>Untuk iPhone (Safari)</span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4 leading-snug">
                    <li>Buka alamat di atas di browser Safari iPhone.</li>
                    <li>
                      Ketuk tombol{" "}
                      <strong className="text-dark inline-flex items-center gap-1">
                        Bagikan (Share <Share2 className="w-3 h-3 inline text-primary" />)
                      </strong>{" "}
                      di bilah bawah.
                    </li>
                    <li>
                      Gulir lalu pilih{" "}
                      <strong className="text-primary font-bold inline-flex items-center gap-1">
                        &quot;Tambah ke Layar Utama&quot;{" "}
                        <Plus className="w-3 h-3 inline" />
                      </strong>
                      .
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DESKTOP (LAPTOP/KOMPUTER) */}
          {activeTab === "desktop" && (
            <div className="space-y-4 animate-fade-in">
              {hasDeferredPrompt ? (
                <div className="p-4 rounded-2xl bg-primary-light/30 border border-primary/20 text-center space-y-3">
                  <h4 className="font-bold text-sm text-dark">
                    Browser Anda Mendukung Instalasi 1-Klik!
                  </h4>
                  <p className="text-xs text-gray max-w-sm mx-auto">
                    Klik tombol di bawah ini untuk langsung menambahkan aplikasi NearJob
                    ke komputer Anda.
                  </p>
                  <button
                    type="button"
                    onClick={promptInstall}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/20 transition-all hover:scale-102"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pasang ke Komputer Sekarang (1-Klik)</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-gray-border space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-dark">
                        Cara Pasang di Browser Komputer Anda:
                      </h4>
                      <p className="text-xs text-gray mt-0.5">
                        Aplikasi web (PWA) dipasang langsung melalui fitur bawaan browser
                        tanpa download file berat:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1 text-xs text-slate-700">
                    <div className="p-3 rounded-xl bg-white border border-gray-border/80">
                      <strong className="text-dark block font-bold mb-1">
                        1. Google Chrome & Microsoft Edge:
                      </strong>
                      <p className="text-slate-600 leading-relaxed">
                        Lihat ke ujung kanan{" "}
                        <strong>Address Bar (bilah URL tempat Anda mengetik web)</strong>.
                        Di sana terdapat ikon kecil{" "}
                        <strong className="text-primary font-mono font-bold bg-primary-light/50 px-1.5 py-0.5 rounded">
                          ⊕ Install NearJob
                        </strong>{" "}
                        atau monitor kecil. Klik ikon tersebut lalu pilih{" "}
                        <strong>Install</strong>.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-gray-border/80">
                      <strong className="text-dark block font-bold mb-1">
                        2. Safari di Mac (macOS Sonoma / Lebih Baru):
                      </strong>
                      <p className="text-slate-600 leading-relaxed">
                        Klik menu bar atas <strong>File</strong> &rarr; pilih{" "}
                        <strong className="text-primary font-bold">
                          &quot;Add to Dock... (Tambahkan ke Dock)&quot;
                        </strong>
                        . Ikon NearJob langsung muncul di Dock Mac Anda!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FILE APK ANDROID */}
          {activeTab === "apk" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Informasi Penting Tentang File APK</span>
                </div>
                <p className="leading-relaxed">
                  NearJob dibangun sebagai <strong>Progressive Web App (PWA)</strong>, di
                  mana Anda <strong>tidak perlu download file APK manual</strong> yang
                  memakan memori HP. Memasang via tab{" "}
                  <strong>&quot;Pasang di HP&quot;</strong> jauh lebih cepat, hemat
                  memori, dan otomatis ter-update setiap saat.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-border space-y-3">
                <h4 className="font-bold text-xs text-dark">
                  Ingin Tetap Memiliki File Mentahan .APK untuk Dikirim ke Teman?
                </h4>
                <p className="text-xs text-gray leading-relaxed">
                  Karena web NearJob sudah memiliki manifest dan Service Worker PWA
                  standar Google, Anda bisa langsung meng-convert website ini menjadi file{" "}
                  <strong>.APK resmi Android</strong> secara instan dan 100% gratis
                  menggunakan <strong>PWABuilder (resmi dari Microsoft & Google)</strong>:
                </p>

                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4">
                  <li>
                    Buka website <strong>PWABuilder.com</strong> di browser.
                  </li>
                  <li>Masukkan link domain NearJob Anda (misal link Vercel).</li>
                  <li>
                    Klik <strong>&quot;Package for Android&quot;</strong> &rarr; file{" "}
                    <strong>.APK</strong> langsung ter-download!
                  </li>
                </ol>

                <a
                  href="https://www.pwabuilder.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <span>Buka PWABuilder (Generator APK Gratis)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-border/60 bg-light/40 flex items-center justify-between">
          <span className="text-[11px] text-gray">
            NearJob v0.1.0 • PWA Standalone Mode
          </span>
          <button
            type="button"
            onClick={() => setShowInstallModal(false)}
            className="px-4 py-1.5 rounded-xl bg-gray-border/60 hover:bg-gray-border text-dark text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
