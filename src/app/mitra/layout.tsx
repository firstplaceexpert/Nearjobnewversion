import type { Metadata } from "next";
import { MitraLayoutClient } from "./mitra-layout-client";

export const metadata: Metadata = {
  title: "NEAR MITRA — Portal Kerja & GoPartner Mode",
  description:
    "Antarmuka khusus mitra kerja, pengemudi, dan penyedia jasa NEAR JOB. Terima orderan kilat, pantau rute, dan kelola penghasilan harian.",
};

export default function MitraLayout({ children }: { children: React.ReactNode }) {
  return <MitraLayoutClient>{children}</MitraLayoutClient>;
}
