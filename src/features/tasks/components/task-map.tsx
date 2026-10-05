"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TaskItem } from "@/features/tasks/types";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Clock,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface TaskMapProps {
  tasks: TaskItem[];
  selectedCategory?: string;
  onApplyClick?: (task: TaskItem) => void;
}

// Haversine formula to compute distance in kilometers
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// URL Tile Provider
function getTileUrl(style: "standard" | "voyager" | "satellite"): string {
  if (style === "satellite") {
    return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  }
  if (style === "voyager") {
    return "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  }
  // High-clarity OpenStreetMap Standard
  return "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
}

// Preset area Yogyakarta (Jogja) untuk simulasi GPS Mitra
const AREA_PRESETS = [
  { name: "Malioboro / Tugu", lat: -7.7828, lng: 110.367 },
  { name: "UGM / Sleman", lat: -7.7713, lng: 110.3776 },
  { name: "Gejayan / Seturan", lat: -7.768, lng: 110.3895 },
  { name: "Kotagede / Bantul", lat: -7.8285, lng: 110.3995 },
];

/**
 * Menyediakan nama sub-menu layanan, kode brand, emoji ikon, dan warna tema
 */
function getSubMenuInfo(category: string, title: string) {
  const text = (category + " " + title).toLowerCase();

  if (
    text.includes("kucing") ||
    text.includes("hewan") ||
    text.includes("pet") ||
    text.includes("anjing")
  ) {
    return {
      subMenu: "Rawat Hewan",
      brandCode: "NearPet",
      icon: "🐱",
      bg: "bg-amber-100 text-amber-800",
    };
  }
  if (
    text.includes("angkut") ||
    text.includes("pindahan") ||
    text.includes("galon") ||
    text.includes("kardus")
  ) {
    return {
      subMenu: "Angkut Barang",
      brandCode: "NearAngkut",
      icon: "📦",
      bg: "bg-blue-100 text-blue-800",
    };
  }
  if (
    text.includes("bersih") ||
    text.includes("cuci") ||
    text.includes("clean") ||
    text.includes("kamar") ||
    text.includes("pel")
  ) {
    return {
      subMenu: "Beres-Beres",
      brandCode: "NearClean",
      icon: "🧹",
      bg: "bg-emerald-100 text-emerald-800",
    };
  }
  if (
    text.includes("desain") ||
    text.includes("banner") ||
    text.includes("logo") ||
    text.includes("grafis") ||
    text.includes("canva") ||
    text.includes("ppt")
  ) {
    return {
      subMenu: "Desain Grafis",
      brandCode: "NearDesign",
      icon: "🎨",
      bg: "bg-purple-100 text-purple-800",
    };
  }
  if (
    text.includes("kasir") ||
    text.includes("ritel") ||
    text.includes("toko") ||
    text.includes("cafe") ||
    text.includes("kopi")
  ) {
    return {
      subMenu: "Staf Kasir",
      brandCode: "NearKasir",
      icon: "☕",
      bg: "bg-orange-100 text-orange-800",
    };
  }
  if (
    text.includes("booth") ||
    text.includes("pameran") ||
    text.includes("event") ||
    text.includes("expo") ||
    text.includes("bazaar") ||
    text.includes("usher")
  ) {
    return {
      subMenu: "Jaga Booth",
      brandCode: "NearEvent",
      icon: "🎪",
      bg: "bg-rose-100 text-rose-800",
    };
  }
  if (
    text.includes("listrik") ||
    text.includes("pertukangan") ||
    text.includes("servis") ||
    text.includes("ac") ||
    text.includes("saklar") ||
    text.includes("teknisi")
  ) {
    return {
      subMenu: "Servis Listrik",
      brandCode: "NearFix",
      icon: "⚡",
      bg: "bg-yellow-100 text-yellow-800",
    };
  }
  if (
    text.includes("foto") ||
    text.includes("kamera") ||
    text.includes("video") ||
    text.includes("wisuda")
  ) {
    return {
      subMenu: "Fotografer",
      brandCode: "NearFoto",
      icon: "📸",
      bg: "bg-teal-100 text-teal-800",
    };
  }
  if (
    text.includes("kurir") ||
    text.includes("logistik") ||
    text.includes("antar") ||
    text.includes("kirim")
  ) {
    return {
      subMenu: "Kurir Instan",
      brandCode: "NearExpress",
      icon: "⚡",
      bg: "bg-amber-100 text-amber-800",
    };
  }
  if (text.includes("antre") || text.includes("belanja") || text.includes("titip")) {
    return {
      subMenu: "Titip & Antre",
      brandCode: "NearHelper",
      icon: "🛒",
      bg: "bg-pink-100 text-pink-800",
    };
  }

  // Fallback nama sub menu
  const fallback = category.split("&")[0].trim();
  return {
    subMenu: fallback || "Jasa Harian",
    brandCode: "NearJob",
    icon: "💼",
    bg: "bg-slate-100 text-slate-800",
  };
}

export function TaskMap({ tasks, onApplyClick }: TaskMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const radiusCircleRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polylineRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileLayerRef = useRef<any>(null);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  }>({
    lat: -7.7828,
    lng: 110.367,
    name: "Malioboro / Tugu, Yogyakarta",
  });

  const [selectedRadius, setSelectedRadius] = useState<number | null>(5); // 5km default
  const [mapStyle, setMapStyle] = useState<"standard" | "voyager" | "satellite">(
    "standard",
  );
  const [activeTask, setActiveTask] = useState<(TaskItem & { distance: number }) | null>(
    null,
  );
  const [isLocating, setIsLocating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter tasks with valid numeric coordinates
  const tasksWithCoords = tasks.filter(
    (t) => typeof t.latitude === "number" && typeof t.longitude === "number",
  );

  const mappedTasks = tasksWithCoords
    .map((task) => {
      const distance = getDistanceKm(
        userLocation.lat,
        userLocation.lng,
        task.latitude as number,
        task.longitude as number,
      );
      return { ...task, distance };
    })
    .filter((t) => {
      if (selectedRadius === null) return true;
      return t.distance <= selectedRadius;
    })
    .sort((a, b) => a.distance - b.distance);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderMarkers = (L: any, map: any) => {
    // 1. Bersihkan marker, circle, & rute sebelumnya
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // 2. Lingkaran Radius Radar (Visualisasi Area Jangkauan Mitra yang Jelas)
    if (selectedRadius !== null) {
      const circle = L.circle([userLocation.lat, userLocation.lng], {
        radius: selectedRadius * 1000,
        color: "#16a34a",
        fillColor: "#22c55e",
        fillOpacity: 0.08,
        weight: 2,
        dashArray: "6, 6",
      }).addTo(map);
      radiusCircleRef.current = circle;
    }

    // 3. User / Mitra Position Marker (Gojek / Grab Blue Radar Pulse)
    const userIcon = L.divIcon({
      className: "custom-user-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 rounded-full bg-[#1867F8]/25 animate-ping"></div>
          <div class="w-10 h-10 rounded-full bg-[#1867F8] border-3 border-white shadow-xl flex items-center justify-center text-white font-black text-xs">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    userMarker.bindTooltip("Posisi Anda (Mitra Siap Kerja)", {
      permanent: false,
      direction: "top",
      className: "text-xs font-bold px-2 py-1 bg-dark text-white rounded-lg shadow-md",
    });

    markersRef.current.push(userMarker);

    // 4. Render Task Markers (Hanya Nama Sub Menu & Harga, Rincian saat diklik)
    mappedTasks.forEach((task) => {
      const budgetInK =
        task.budget >= 1000000
          ? `${(task.budget / 1000000).toFixed(1)}jt`
          : `${Math.round(task.budget / 1000)}rb`;

      const isSelected = activeTask?.id === task.id;
      const info = getSubMenuInfo(task.category, task.title);

      const taskIcon = L.divIcon({
        className: "custom-task-marker-pin",
        html: `
          <div style="transform: translate(-50%, -100%); width: max-content;" class="group cursor-pointer select-none">
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
              isSelected
                ? "bg-[#1867F8] text-white shadow-[0_10px_26px_rgba(24,103,248,0.48)] ring-4 ring-[#1867F8]/25 scale-110 -translate-y-1.5"
                : "bg-white/95 text-[#2F2B4F] shadow-[0_4px_16px_rgba(0,0,0,0.18)] border border-slate-200/90 hover:border-[#1867F8] hover:shadow-[0_8px_24px_rgba(24,103,248,0.25)] hover:scale-105"
            }">
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 shadow-xs ${
                isSelected ? "bg-white/20 text-white" : info.bg
              }">
                ${info.icon}
              </div>
              <div class="flex flex-col text-left pr-1 leading-none">
                <span class="text-[12px] font-black tracking-tight whitespace-nowrap mb-0.5 ${
                  isSelected ? "text-white" : "text-[#2F2B4F]"
                }">
                  ${info.subMenu}
                </span>
                <span class="text-[11px] font-black ${
                  isSelected ? "text-[#FEE49A]" : "text-[#1867F8]"
                }">
                  Rp ${budgetInK}
                </span>
              </div>
            </div>
            <div class="w-2.5 h-2.5 mx-auto rotate-45 -mt-1 shadow-xs ${
              isSelected
                ? "bg-[#1867F8]"
                : "bg-white/95 border-r border-b border-slate-200/90"
            }"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([task.latitude as number, task.longitude as number], {
        icon: taskIcon,
        zIndexOffset: isSelected ? 500 : 100,
      }).addTo(map);

      marker.on("click", () => {
        setActiveTask(task);
        map.panTo([task.latitude as number, task.longitude as number], {
          animate: true,
          duration: 0.5,
        });
      });

      markersRef.current.push(marker);
    });

    // 5. Garis Rute Navigasi (Polyline) jika ada task yang aktif dipilih
    if (activeTask && activeTask.latitude && activeTask.longitude) {
      const line = L.polyline(
        [
          [userLocation.lat, userLocation.lng],
          [activeTask.latitude, activeTask.longitude],
        ],
        {
          color: "#2563eb",
          weight: 4,
          dashArray: "8, 8",
          opacity: 0.85,
        },
      ).addTo(map);
      polylineRef.current = line;
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) return;

      // Fix default marker icon paths
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([userLocation.lat, userLocation.lng], 13);

      const tileLayer = L.tileLayer(getTileUrl(mapStyle), {
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Zoom Control di kanan bawah
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
      renderMarkers(L, map);

      // Otomatis sesuaikan zoom agar seluruh marker dan user pas terlihat
      if (mappedTasks.length > 0) {
        const bounds = L.latLngBounds([
          [userLocation.lat, userLocation.lng],
          ...mappedTasks.map(
            (t) => [t.latitude as number, t.longitude as number] as [number, number],
          ),
        ]);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Tile Layer saat mapStyle berubah
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(getTileUrl(mapStyle));
  }, [mapStyle]);

  // Update Markers saat mappedTasks, userLocation, activeTask, atau selectedRadius berubah
  useEffect(() => {
    async function update() {
      if (!mapInstanceRef.current) return;
      const L = await import("leaflet");
      renderMarkers(L, mapInstanceRef.current);
    }
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappedTasks, userLocation, activeTask, selectedRadius]);

  // Handle Geolocation Asli Pengguna
  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: "Lokasi GPS Asli Anda",
          };
          setUserLocation(newLoc);
          setIsLocating(false);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([newLoc.lat, newLoc.lng], 14, { duration: 1 });
          }
        },
        () => {
          setIsLocating(false);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14);
          }
        },
        { timeout: 8000 },
      );
    } else {
      setIsLocating(false);
    }
  };

  // Preset switch
  const handleSelectPreset = (preset: (typeof AREA_PRESETS)[0]) => {
    const loc = { lat: preset.lat, lng: preset.lng, name: preset.name };
    setUserLocation(loc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], 14, { duration: 0.8 });
    }
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-gray-border shadow-md bg-white transition-all isolate ${
        isFullscreen
          ? "fixed inset-0 z-[100] rounded-none h-screen"
          : "h-[520px] sm:h-[650px]"
      }`}
    >
      {/* Top Map Toolbar: Lokasi, Pilihan Area & Radius Radar */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="flex flex-wrap sm:flex-row gap-2 justify-between items-start sm:items-center">
          {/* Posisi Mitra & Tombol GPS */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-md border border-slate-200 pointer-events-auto flex items-center gap-2 max-w-fit">
            <span className="w-2 h-2 rounded-full bg-[#23C8FE] animate-pulse shrink-0"></span>
            <span className="text-[11px] sm:text-xs font-black text-dark truncate max-w-[140px] sm:max-w-none">
              {userLocation.name}
            </span>
            <button
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="px-2 py-0.5 rounded-lg bg-[#23C8FE]/15 hover:bg-[#23C8FE]/25 text-[#0aaedc] font-bold transition-colors text-[10px] sm:text-[11px] flex items-center gap-1 shrink-0"
              title="Deteksi Lokasi GPS Asli"
            >
              <Navigation className={`w-3 h-3 ${isLocating ? "animate-spin" : ""}`} />
              <span>{isLocating ? "Mencari..." : "GPS Saya"}</span>
            </button>
          </div>

          {/* Quick Controls: Layer Switcher & Fullscreen */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-md border border-slate-200 pointer-events-auto flex items-center gap-1">
            <button
              onClick={() => setMapStyle("standard")}
              className={`px-2.5 py-0.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all ${
                mapStyle === "standard"
                  ? "bg-dark text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Peta Jelas
            </button>
            <button
              onClick={() => setMapStyle("satellite")}
              className={`px-2.5 py-0.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all ${
                mapStyle === "satellite"
                  ? "bg-dark text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Satelit
            </button>

            <span className="w-px h-3.5 bg-slate-200 mx-0.5"></span>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
              title={isFullscreen ? "Kecilkan Peta" : "Layar Penuh"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Pilihan Cepat Area & Radius Radar (Horizontally scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pointer-events-auto pb-1 max-w-full">
          {/* Preset Area Jakarta */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-md border border-slate-200 flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-extrabold text-slate-400 px-1.5">
              Area:
            </span>
            {AREA_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleSelectPreset(p)}
                className={`px-2 py-0.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all shrink-0 ${
                  userLocation.name.includes(p.name.split(" /")[0])
                    ? "bg-primary text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p.name.split(" /")[0]}
              </button>
            ))}
          </div>

          {/* Filter Radius */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-md border border-slate-200 flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-extrabold text-slate-400 px-1.5">
              Jangkauan:
            </span>
            {[
              { label: "1 km", val: 1 },
              { label: "3 km", val: 3 },
              { label: "5 km", val: 5 },
              { label: "10 km", val: 10 },
              { label: "Semua", val: null },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setSelectedRadius(item.val)}
                className={`px-2 py-0.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all shrink-0 ${
                  selectedRadius === item.val
                    ? "bg-[#1867F8] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actual Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Task Preview Card (Opens when a marker is clicked) */}
      {activeTask && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:max-w-md z-30 animate-slide-up pointer-events-auto">
          <div className="bg-white rounded-3xl p-5 shadow-2xl border-2 border-primary/30 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {getSubMenuInfo(activeTask.category, activeTask.title).subMenu}
                  </Badge>
                  <span className="text-[11px] font-black text-[#1867F8] bg-[#1867F8]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-[#1867F8]" />
                    <span>{activeTask.distance} km dari Anda</span>
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-dark leading-snug break-words">
                  {activeTask.title}
                </h4>
              </div>
              <button
                onClick={() => setActiveTask(null)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-500 hover:text-dark flex items-center justify-center transition-colors shrink-0"
                aria-label="Tutup popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rincian Deskripsi Tugas Lengkap */}
            {activeTask.description && (
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Rincian Tugas
                </p>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {activeTask.description}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 border-y border-slate-100 py-2 gap-2">
              <span className="flex items-center gap-1 min-w-0 flex-1">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{activeTask.location}</span>
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{activeTask.scheduleDate}</span>
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black">
                  Upah Bersih Mitra
                </p>
                <p className="text-lg font-black text-[#1867F8]">
                  Rp {Math.round(activeTask.budget * 0.9).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/tasks/${activeTask.id}`}>
                  <Button variant="outline" size="sm" className="text-xs font-bold">
                    Detail <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
                {onApplyClick && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs font-bold shadow-md shadow-primary/20"
                    onClick={() => onApplyClick(activeTask)}
                  >
                    Ambil Tugas Ini
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Legend & Status Counter */}
      {!activeTask && (
        <div className="absolute bottom-4 left-4 z-[390] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-lg border border-slate-200 pointer-events-auto flex items-center gap-3 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#1867F8] border border-white shadow-xs"></span>
              <span>Posisi Mitra</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#23C8FE] border border-white shadow-xs"></span>
              <span>Titik Order ({mappedTasks.length})</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[#1867F8] font-black">
              Radar Aktif {selectedRadius ? `${selectedRadius} km` : "Semua"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
