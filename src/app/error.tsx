"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { logger } from "@/lib/logger";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    logger.error("Error caught by page ErrorBoundary", {
      name: error.name,
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-border p-8 shadow-sm space-y-6">
        <Logo size="md" className="justify-center" />

        <div className="space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-error-light text-error flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-error" />
          </div>
          <h2 className="text-xl font-bold text-dark">Terjadi Kendala Teknis</h2>
          <p className="text-xs text-gray leading-relaxed">
            Halaman mengalami masalah saat memproses permintaan Anda. Jangan khawatir,
            data Anda tetap aman.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="p-3 bg-light rounded-xl text-left overflow-x-auto text-[11px] font-mono text-error">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/")}>
            Kembali ke Beranda
          </Button>
          <Button variant="primary" size="sm" onClick={() => reset()}>
            Coba Muat Ulang
          </Button>
        </div>
      </div>
    </div>
  );
}
