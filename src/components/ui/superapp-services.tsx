"use client";

import Link from "next/link";
import { Truck, Sparkles, Store, Users, Laptop, Palette, Car, Zap } from "lucide-react";

export interface SuperAppService {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: typeof Truck;
  badge?: string;
  colorClass: string;
  isInstant?: boolean;
}

export const SUPERAPP_SERVICES: SuperAppService[] = [
  {
    id: "near-express",
    name: "NearExpress",
    category: "Kurir & Logistik",
    description: "Bantuan instan hadir < 30 menit",
    icon: Zap,
    badge: "INSTAN",
    colorClass: "bg-warning text-dark shadow-warning/30",
    isInstant: true,
  },
  {
    id: "near-angkut",
    name: "NearAngkut",
    category: "Angkut Barang",
    description: "Pindahan kos, perabot & barang",
    icon: Truck,
    colorClass: "bg-primary text-white shadow-primary/25",
  },
  {
    id: "near-clean",
    name: "NearClean",
    category: "Pertukangan & Servis",
    description: "Beres-beres kos, rumah & ruko",
    icon: Sparkles,
    badge: "POPULER",
    colorClass: "bg-secondary text-white shadow-secondary/25",
  },
  {
    id: "near-event",
    name: "NearEvent",
    category: "Jaga Booth",
    description: "Jaga booth, usher & bazaar",
    icon: Store,
    colorClass: "bg-dark text-white shadow-dark/25",
  },
  {
    id: "near-helper",
    name: "NearHelper",
    category: "Operasional",
    description: "Antre tiket, belanja & bantuan",
    icon: Users,
    colorClass: "bg-accent text-dark shadow-accent/30",
  },
  {
    id: "near-tech",
    name: "NearTech",
    category: "IT & Desain",
    description: "Rakit PC, wifi & teknisi komputer",
    icon: Laptop,
    colorClass: "bg-primary text-white shadow-primary/25",
  },
  {
    id: "near-design",
    name: "NearDesign",
    category: "IT & Desain",
    description: "Desain flyer, logo, banner & medsos",
    icon: Palette,
    colorClass: "bg-error text-white shadow-error/25",
  },
  {
    id: "near-driver",
    name: "NearDriver",
    category: "Transportasi",
    description: "Sopir cadangan & antar jemput",
    icon: Car,
    colorClass: "bg-dark text-white shadow-dark/25",
  },
];

interface SuperAppServicesProps {
  onSelectInstant?: () => void;
}

export function SuperAppServices({ onSelectInstant }: SuperAppServicesProps) {
  return (
    <div className="w-full bg-white rounded-3xl p-5 md:p-7 border border-gray-border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-dark">Layanan Cepat NEAR JOB</h3>
          </div>
          <p className="text-xs text-gray mt-0.5">
            Pilih jenis bantuan yang Anda butuhkan — pesan langsung atau cari tugas di
            sekitar.
          </p>
        </div>

        <Link
          href="/browse"
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 self-start sm:self-auto"
        >
          Lihat Semua Tugas &rarr;
        </Link>
      </div>

      {/* Grid of 8 Services NearJob SuperApp */}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
        {SUPERAPP_SERVICES.map((srv) => {
          const Icon = srv.icon;

          if (srv.isInstant && onSelectInstant) {
            return (
              <button
                key={srv.id}
                onClick={onSelectInstant}
                className="group flex flex-col items-center text-center p-2 rounded-2xl hover:bg-light transition-all duration-200"
              >
                <div className="relative mb-2">
                  <div
                    className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl ${srv.colorClass} shadow-md flex items-center justify-center transform group-hover:scale-108 group-hover:-translate-y-1 transition-all duration-200`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {srv.badge && (
                    <span className="absolute -top-1.5 -right-2 bg-error text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full uppercase shadow-xs">
                      {srv.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-dark group-hover:text-primary transition-colors">
                  {srv.name}
                </span>
                <span className="text-[10px] text-gray hidden sm:line-clamp-1 mt-0.5">
                  {srv.description}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={srv.id}
              href={`/browse?category=${encodeURIComponent(srv.category)}`}
              className="group flex flex-col items-center text-center p-2 rounded-2xl hover:bg-light transition-all duration-200"
            >
              <div className="relative mb-2">
                <div
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl ${srv.colorClass} shadow-md flex items-center justify-center transform group-hover:scale-108 group-hover:-translate-y-1 transition-all duration-200`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {srv.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-success text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full uppercase shadow-xs">
                    {srv.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-dark group-hover:text-primary transition-colors">
                {srv.name}
              </span>
              <span className="text-[10px] text-gray hidden sm:line-clamp-1 mt-0.5">
                {srv.description}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
