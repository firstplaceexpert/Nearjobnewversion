"use client";

import { useQuery } from "@tanstack/react-query";
import {
  User,
  Star,
  ShieldCheck,
  Bike,
  Phone,
  Mail,
  CheckCircle,
  FileCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleSwitcherBanner } from "@/components/ui/role-switcher-banner";
import type { MitraProfile } from "@/features/tasks/types";

export default function MitraProfilePage() {
  const { data } = useQuery({
    queryKey: ["mitraDashboard"],
    queryFn: async () => {
      const res = await fetch("/api/mitra/dashboard");
      const json = await res.json();
      return json.data;
    },
  });

  const profile: MitraProfile = data?.profile || {
    id: "usr-worker-siti",
    name: "Siti Rahma",
    email: "siti@nearjob.id",
    phone: "0812-9988-7722",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    vehicle: "Honda Beat eSP 110cc",
    plateNumber: "B 3819 TZG",
    rating: 4.98,
    totalTrips: 184,
    acceptanceRate: 98,
    completionRate: 100,
    isOnline: true,
    todayEarnings: 245000,
    todayTrips: 4,
    dailyGoalTrips: 6,
    points: 80,
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 0. Role Switcher: Mitra <-> Konsumen */}
      <RoleSwitcherBanner currentRole="WORKER" />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-dark tracking-tight">
          Profil & Performa Mitra
        </h1>
        <p className="text-xs text-gray mt-1">
          Identitas kemitraan resmi, reputasi rating, dan informasi kendaraan kerja.
        </p>
      </div>

      {/* Main Profile Card */}

      <Card className="p-6 rounded-3xl border border-gray-border/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 rounded-3xl bg-primary/10 border-2 border-primary text-primary flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0">
              <User className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-dark">{profile.name}</h2>
                <Badge variant="primary" size="sm" className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Mitra Terverifikasi</span>
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  {profile.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-success" />
                  {profile.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-light">
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-[#FEE49A] text-[#ad8318]" />
              <span className="text-2xl font-black text-dark">{profile.rating}</span>
            </div>
            <span className="text-xs text-gray">{profile.totalTrips} Tugas Selesai</span>
          </div>
        </div>
      </Card>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl border border-gray-border/80">
          <span className="text-xs font-bold text-gray uppercase block">
            Tingkat Penerimaan
          </span>
          <p className="text-2xl font-black text-primary mt-1">
            {profile.acceptanceRate}%
          </p>
          <span className="text-[11px] text-success block mt-1 font-medium">
            Sangat Responsif
          </span>
        </Card>

        <Card className="p-5 rounded-2xl border border-gray-border/80">
          <span className="text-xs font-bold text-gray uppercase block">
            Tingkat Penyelesaian
          </span>
          <p className="text-2xl font-black text-success mt-1">
            {profile.completionRate}%
          </p>
          <span className="text-[11px] text-gray block mt-1">
            Tanpa Pembatalan Sepihak
          </span>
        </Card>

        <Card className="p-5 rounded-2xl border border-gray-border/80">
          <span className="text-xs font-bold text-gray uppercase block">
            Poin Performa Harian
          </span>
          <p className="text-2xl font-black text-[#ad8318] mt-1">
            {profile.points} / 100
          </p>
          <span className="text-[11px] text-primary block mt-1 font-medium">
            Prioritas Orderan
          </span>
        </Card>
      </div>

      {/* Vehicle and Verification details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Vehicle */}
        <Card className="p-5 rounded-2xl border border-gray-border/80 space-y-3">
          <div className="flex items-center gap-2">
            <Bike className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-dark text-sm">Kendaraan Operasional</h3>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-light">
              <span className="text-gray">Tipe Kendaraan:</span>
              <span className="font-bold text-dark">{profile.vehicle}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-light">
              <span className="text-gray">Plat Nomor:</span>
              <span className="font-mono font-bold text-primary">
                {profile.plateNumber}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray">Status Dokumen STNK:</span>
              <span className="font-semibold text-success">Aktif & Sesuai</span>
            </div>
          </div>
        </Card>

        {/* Verification Checklist */}
        <Card className="p-5 rounded-2xl border border-gray-border/80 space-y-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-success" />
            <h3 className="font-bold text-dark text-sm">Verifikasi Keamanan Akun</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-dark font-medium">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>KTP Terverifikasi Dukcapil</span>
            </div>
            <div className="flex items-center gap-2 text-dark font-medium">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>SIM C Terdaftar Aktif</span>
            </div>
            <div className="flex items-center gap-2 text-dark font-medium">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Rekening Bank Sesuai KTP (NearPay Ready)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
