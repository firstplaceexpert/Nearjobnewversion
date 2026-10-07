"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Critical root layout error caught by GlobalError", {
      name: error.name,
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-error-light text-error-hover flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-error-hover" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Terjadi Kesalahan Sistem Kritis
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Aplikasi mengalami kesalahan fatal pada root layout. Tim teknis telah menerima
            pencatatan error ini.
          </p>
          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
