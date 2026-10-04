import { Logo } from "@/components/ui/logo";
import { BRAND } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-border bg-white text-gray py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <Logo size="md" />
            <span className="hidden sm:inline text-gray-border">•</span>
            <p className="text-xs text-gray max-w-md">{BRAND.description}</p>
          </div>

          <p className="text-xs text-gray text-center sm:text-right shrink-0">
            © {new Date().getFullYear()} NEAR JOB — Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
