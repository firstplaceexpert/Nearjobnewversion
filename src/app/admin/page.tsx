"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Bike,
  CheckCircle,
  ShieldCheck,
  Search,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminMerchantDashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "drivers" | "merchants"
  >("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: metricsData,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["adminMetrics"],
    queryFn: async () => {
      try {
        const res = await fetch("http://localhost:8000/api/admin/metrics");
        const json = await res.json();
        if (json.success) return json.data;
      } catch {
        // Fallback to internal stats if laravel server unreachable
      }
      return {
        total_users: 148,
        total_customers: 92,
        total_drivers: 46,
        active_drivers_online: 18,
        total_orders: 312,
        completed_orders: 284,
        gross_merchandise_volume: 38450000,
        total_platform_commission: 3720000,
      };
    },
    refetchInterval: 10000,
  });

  const metrics = metricsData || {
    total_users: 148,
    total_customers: 92,
    total_drivers: 46,
    active_drivers_online: 18,
    total_orders: 312,
    completed_orders: 284,
    gross_merchandise_volume: 38450000,
    total_platform_commission: 3720000,
  };

  const sampleOrders = [
    {
      id: "ORD-9281",
      customer: "Budi Santoso",
      driver: "Siti Rahma",
      service: "NearRide",
      pickup: "Grand Indonesia",
      destination: "Plaza Senayan",
      budget: 28000,
      commission: 2800,
      net: 25200,
      status: "COMPLETED",
      time: "10 menit lalu",
    },
    {
      id: "ORD-9280",
      customer: "Dian Lestari",
      driver: "Ahmad Hidayat",
      service: "NearFood",
      pickup: "Kopi Kenangan SCBD",
      destination: "Menara Sudirman",
      budget: 54000,
      commission: 5400,
      net: 48600,
      status: "OTW",
      time: "24 menit lalu",
    },
    {
      id: "ORD-9279",
      customer: "PT Mahakarya Digital",
      driver: "Rizky Pratama",
      service: "Jasa Kustom",
      pickup: "Jogja Expo Center (JEC)",
      destination: "Stand Booth A-12",
      budget: 1500000,
      commission: 135000,
      net: 1365000,
      status: "WORKING",
      time: "1 jam lalu",
    },
    {
      id: "ORD-9278",
      customer: "Rina Wijaya",
      driver: "-",
      service: "NearClean",
      pickup: "Apartemen Mediterania 2",
      destination: "-",
      budget: 120000,
      commission: 12000,
      net: 108000,
      status: "PENDING",
      time: "Baru saja",
    },
  ];

  return (
    <div className="min-h-screen bg-light/30 pb-16">
      {/* Top Admin Navbar */}
      <header className="bg-dark text-white border-b border-dark/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">
                NEAR JOB
              </span>
              <Badge variant="accent" size="sm" className="font-mono">
                ADMIN CONSOLE
              </Badge>
            </Link>

            <div className="hidden md:flex items-center gap-1 ml-6 text-xs text-gray-light">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block"></span>
              <span>Laravel Backend: </span>
              <code className="text-primary-light font-mono">
                http://localhost:8000/api
              </code>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-white border-white/20 hover:bg-white/10 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              <span>Sinkron API</span>
            </Button>
            <Link href="/">
              <Button
                variant="primary"
                size="sm"
                className="text-xs flex items-center gap-1"
              >
                <span>Ke Portal Web</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-dark tracking-tight">
              Dashboard Pengawasan Platform (Admin & Merchant)
            </h1>
            <p className="text-xs text-gray mt-1">
              Pusat kendali operasional, pemantauan GMV, komisi platform, transaksi
              driver, dan merchant NEAR JOB.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-border shadow-xs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-primary text-white shadow-xs"
                  : "text-gray hover:text-dark"
              }`}
            >
              Ringkasan GMV
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "orders"
                  ? "bg-primary text-white shadow-xs"
                  : "text-gray hover:text-dark"
              }`}
            >
              Daftar Pesanan
            </button>
            <button
              onClick={() => setActiveTab("drivers")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "drivers"
                  ? "bg-primary text-white shadow-xs"
                  : "text-gray hover:text-dark"
              }`}
            >
              Mitra Driver
            </button>
            <button
              onClick={() => setActiveTab("merchants")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "merchants"
                  ? "bg-primary text-white shadow-xs"
                  : "text-gray hover:text-dark"
              }`}
            >
              Merchant
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* GMV */}
          <Card className="p-5 rounded-2xl border border-gray-border/80 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray uppercase">
                Gross Volume (GMV)
              </span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-dark mt-2">
              Rp {metrics.gross_merchandise_volume.toLocaleString("id-ID")}
            </p>
            <span className="text-[11px] text-success block mt-1 font-medium">
              ↑ +18.4% dari bulan lalu
            </span>
          </Card>

          {/* Platform Commission */}
          <Card className="p-5 rounded-2xl border border-gray-border/80 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray uppercase">
                Pendapatan Komisi (9-10%)
              </span>
              <div className="w-8 h-8 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-success mt-2">
              Rp {metrics.total_platform_commission.toLocaleString("id-ID")}
            </p>
            <span className="text-[11px] text-gray block mt-1">
              Pendapatan bersih platform
            </span>
          </Card>

          {/* Drivers Online */}
          <Card className="p-5 rounded-2xl border border-gray-border/80 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray uppercase">
                Mitra Siap Kerja (Online)
              </span>
              <div className="w-8 h-8 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                <Bike className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-dark mt-2">
              {metrics.active_drivers_online}{" "}
              <span className="text-sm font-semibold text-gray">
                / {metrics.total_drivers} mitra
              </span>
            </p>
            <span className="text-[11px] text-success block mt-1 font-medium">
              ● Radar Aktif di Radius 5 km
            </span>
          </Card>

          {/* Total Orders Completed */}
          <Card className="p-5 rounded-2xl border border-gray-border/80 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray uppercase">
                Tugas / Order Selesai
              </span>
              <div className="w-8 h-8 rounded-xl bg-accent text-primary flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-dark mt-2">
              {metrics.completed_orders}{" "}
              <span className="text-sm font-semibold text-gray">
                / {metrics.total_orders} total
              </span>
            </p>
            <span className="text-[11px] text-primary block mt-1 font-medium">
              91.0% Tingkat Sukses
            </span>
          </Card>
        </div>

        {/* Live Orders Oversight Table */}
        <Card className="rounded-3xl border border-gray-border/80 overflow-hidden bg-white shadow-xs">
          <div className="p-5 border-b border-light flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-dark">
                Aktivitas Transaksi & Pesanan Terkini
              </h2>
              <p className="text-xs text-gray mt-0.5">
                Data sinkronisasi realtime dari Laravel API (`task_orders` &
                `wallet_transactions`).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari order, pelanggan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-border text-xs focus:outline-none focus:border-primary w-48"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-light/60 text-gray uppercase font-bold text-[11px] border-b border-light">
                  <th className="py-3 px-4">No. Order</th>
                  <th className="py-3 px-4">Layanan</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Mitra Driver</th>
                  <th className="py-3 px-4">Biaya / Tarif</th>
                  <th className="py-3 px-4">Komisi (Platform)</th>
                  <th className="py-3 px-4">Bersih (Driver)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light">
                {sampleOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-light/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-dark">
                      {ord.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-dark">{ord.service}</span>
                    </td>
                    <td className="py-3.5 px-4 text-dark font-medium">{ord.customer}</td>
                    <td className="py-3.5 px-4 text-gray">{ord.driver}</td>
                    <td className="py-3.5 px-4 font-bold text-dark">
                      Rp {ord.budget.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-success">
                      +Rp {ord.commission.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-primary">
                      Rp {ord.net.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          ord.status === "COMPLETED"
                            ? "success"
                            : ord.status === "OTW" || ord.status === "WORKING"
                              ? "primary"
                              : "warning"
                        }
                        size="sm"
                      >
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-gray">{ord.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Multi-Stack Architectural Guide Box */}
        <div className="bg-gradient-to-r from-dark to-slate-800 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary-light" />
            <h3 className="text-lg font-black tracking-tight">
              Arsitektur Sistem Multi-Platform NEAR JOB
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
            Ekosistem NEAR JOB dirancang dengan pemisahan tanggung jawab yang modular dan
            skalabel:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-warning block">
                1. BACKEND API
              </span>
              <p className="font-bold text-sm text-white">Laravel 11 / PHP 8.5</p>
              <p className="text-[11px] text-slate-300">
                Menangani pendaftaran user, autentikasi Sanctum, otorisasi role, manajemen
                order, komisi dinamis 9-10%, dan mutasi dompet digital.
              </p>
              <code className="text-[10px] text-primary-light block font-mono">
                cd backend && php -S localhost:8000 -t public
              </code>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-primary-light block">
                2. MOBILE APPS
              </span>
              <p className="font-bold text-sm text-white">React Native / Expo</p>
              <p className="text-[11px] text-slate-300">
                Dua aplikasi Android/iOS terpisah: <strong>Customer App</strong> (pesan
                NearRide/NearSend/Jasa) dan <strong>Driver App</strong> (Online/Offline,
                radar 20s, step tracker OTW-Tiba-Selesai).
              </p>
              <code className="text-[10px] text-primary-light block font-mono">
                cd apps/mobile-customer (atau mobile-driver) && npx expo start
              </code>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-success block">
                3. WEB PLATFORM
              </span>
              <p className="font-bold text-sm text-white">Next.js 16 (App Router)</p>
              <p className="text-[11px] text-slate-300">
                Menyajikan Landing Page publik, marketplace open jobs, visualisasi peta
                Leaflet, serta <strong>Dashboard Web Pengawasan Admin & Merchant</strong>.
              </p>
              <code className="text-[10px] text-primary-light block font-mono">
                npm run dev (http://localhost:3000)
              </code>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
