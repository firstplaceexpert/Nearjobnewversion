import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { PwaProvider, PwaInstallBanner, PwaInstallModal } from "@/components/pwa";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#2F6BFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "NEAR JOB — Pekerjaan dekat, peluang nyata.",
    template: "%s | NEAR JOB",
  },
  description:
    "Platform marketplace tugas dan pekerjaan terbuka. Temukan pekerjaan di sekitarmu atau posting tugas untuk dikerjakan oleh pekerja terdekat.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NearJob",
  },
  icons: {
    icon: [
      { url: "/favicon.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png?v=2", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" }],
  },
  keywords: [
    "lowongan kerja",
    "freelance",
    "pekerjaan harian",
    "marketplace tugas",
    "NEAR JOB",
  ],
  authors: [{ name: "NEAR JOB" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "NEAR JOB",
    title: "NEAR JOB — Pekerjaan dekat, peluang nyata.",
    description:
      "Platform marketplace tugas dan pekerjaan terbuka. Temukan pekerjaan di sekitarmu.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <QueryProvider>
          <PwaProvider>
            {children}
            <PwaInstallBanner />
            <PwaInstallModal />
          </PwaProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
