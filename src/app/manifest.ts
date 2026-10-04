import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NEAR JOB — Pekerjaan Dekat, Peluang Nyata",
    short_name: "NearJob",
    description:
      "Platform marketplace tugas dan pekerjaan terbuka. Temukan pekerjaan di sekitarmu atau posting tugas untuk dikerjakan oleh pekerja terdekat.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2F6BFF",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["business", "productivity", "utilities"],
    lang: "id",
    dir: "ltr",
    prefer_related_applications: false,
    shortcuts: [
      {
        name: "Cari Pekerjaan",
        short_name: "Cari",
        description: "Temukan lowongan dan tugas di sekitarmu",
        url: "/",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Aktivitas Saya",
        short_name: "Aktivitas",
        description: "Lihat status tugas dan pekerjaan saya",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Pesan & Chat",
        short_name: "Chat",
        description: "Buka obrolan dan koordinasi kerja",
        url: "/chat",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
