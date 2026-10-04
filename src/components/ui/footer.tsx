import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { BRAND } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-border bg-white text-gray py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm max-w-sm leading-relaxed text-gray">
              {BRAND.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-primary font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
              Sistem Aktif & Terlindungi (SSL & Anti-CSRF)
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-dark text-sm mb-3">Navigasi Cepat</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/browse" className="hover:text-primary transition-colors">
                  Cari Tugas Terdekat
                </Link>
              </li>
              <li>
                <Link href="/post-task" className="hover:text-primary transition-colors">
                  Pasang Tugas Baru
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard Pengguna
                </Link>
              </li>
              <li>
                <Link
                  href="/design-system"
                  className="hover:text-primary transition-colors"
                >
                  Design System
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-dark text-sm mb-3">Ketentuan & Keamanan</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray/80">Komisi Transparan (9% - 10%)</li>
              <li className="text-gray/80">Validasi Server Zod</li>
              <li className="text-gray/80">Perlindungan XSS & CSRF</li>
              <li className="text-gray/80">Prisma Parameterized Queries</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-light flex flex-col sm:flex-row items-center justify-between text-xs text-gray gap-4">
          <p>© {new Date().getFullYear()} NEAR JOB — Hak Cipta Dilindungi.</p>
          <p className="text-gray-light">
            Dibangun dengan Next.js 16, Tailwind CSS v4 & Prisma 8
          </p>
        </div>
      </div>
    </footer>
  );
}
