import Link from "next/link";
import { Navbar, Footer, Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-border p-8 shadow-xs space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-3xl mx-auto font-black">
            404
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-dark tracking-tight">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-xs sm:text-sm text-gray leading-relaxed">
              Tautan yang Anda tuju mungkin telah dipindahkan, tugas telah selesai, atau
              URL salah diketik.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Ke Beranda
              </Button>
            </Link>
            <Link href="/browse" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full sm:w-auto">
                Cari Tugas Lain
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
