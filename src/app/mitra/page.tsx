"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Compass,
  TrendingUp,
  Award,
  MapPin,
  Clock,
  Power,
  Star,
  AlertCircle,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { IncomingOrderModal } from "@/components/mitra/incoming-order-modal";
import { ActiveJobTracker } from "@/components/mitra/active-job-tracker";
import type { TaskItem } from "@/features/tasks/types";

// Dynamically import Leaflet TaskMap for SSR safety
const TaskMap = dynamic(
  () => import("@/features/tasks/components/task-map").then((mod) => mod.TaskMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 rounded-3xl bg-light flex flex-col items-center justify-center text-gray gap-2 animate-pulse">
        <Compass className="w-8 h-8 text-primary animate-spin" />
        <span className="text-xs font-semibold">Memuat Radar Pekerjaan Terdekat...</span>
      </div>
    ),
  },
);

export default function MitraDashboardPage() {
  const queryClient = useQueryClient();
  const [dismissedOrderId, setDismissedOrderId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["mitraDashboard"],
    queryFn: async () => {
      const res = await fetch("/api/mitra/dashboard");
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 3500, // poll every 3.5s for realistic instant radar feeling
  });

  const profile = data?.profile;
  const isOnline = profile?.isOnline ?? true;
  const activeOrder = data?.activeOrder;
  const incomingOrder =
    data?.incomingOrder && data.incomingOrder.id !== dismissedOrderId
      ? data.incomingOrder
      : null;
  const nearbyTasks: TaskItem[] = data?.nearbyTasks || [];

  const [acceptingTaskId, setAcceptingTaskId] = useState<string | null>(null);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

  // Mutations
  const acceptOrderMutation = useMutation({
    mutationFn: async (taskId: string) => {
      setAcceptingTaskId(taskId);
      const res = await fetch("/api/mitra/order/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Gagal mengambil orderan");
      }
      return json.data;
    },
    onSuccess: (respData) => {
      const orderTitle = respData?.activeOrder?.title || "Tugas";
      setOrderSuccessMessage(
        `Pesanan "${orderTitle}" berhasil Anda ambil! Sistem memprioritaskan tugas ini dan mengunci orderan lain agar Anda dapat fokus menyelesaikan pesanan.`,
      );
      queryClient.invalidateQueries({ queryKey: ["mitraDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["workerDashboard"] });
    },
    onSettled: () => {
      setAcceptingTaskId(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (step: "OTW" | "ARRIVED" | "WORKING" | "COMPLETED") => {
      if (!activeOrder) return;
      const res = await fetch("/api/mitra/order/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: activeOrder.taskId, step }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mitraDashboard"] });
    },
  });

  const toggleOnlineMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/mitra/toggle-online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: !isOnline }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mitraDashboard"] });
    },
  });

  if (isLoading && !data) {
    return (
      <div className="py-20 text-center text-xs text-gray space-y-3">
        <Compass className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="font-semibold">Menghubungkan ke Server Radar NEAR MITRA...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BANNER NOTIFIKASI SUKSES MENGAMBIL ORDERAN */}
      {orderSuccessMessage && (
        <div className="p-4 rounded-2xl bg-secondary-light border border-secondary/30 text-secondary-deep text-xs font-semibold flex items-center justify-between gap-3 shadow-xs animate-slide-up">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-secondary-hover shrink-0" />
            <span>{orderSuccessMessage}</span>
          </div>
          <button
            onClick={() => setOrderSuccessMessage(null)}
            className="text-xs font-bold text-secondary-deep underline shrink-0 hover:text-secondary-deep"
          >
            Tutup
          </button>
        </div>
      )}

      {/* SECTION 1: ACTIVE ORDER TRACKER (IF CURRENTLY ON A JOB) */}
      {activeOrder && (
        <div className="animate-slide-up">
          <ActiveJobTracker
            order={activeOrder}
            onUpdateStatus={(step) => updateStatusMutation.mutate(step)}
            isUpdating={updateStatusMutation.isPending}
          />
        </div>
      )}

      {/* SECTION 2: TOP RADAR STATUS BANNER (ONLINE / OFFLINE) */}
      {!activeOrder && (
        <div
          className={`rounded-3xl p-5 sm:p-6 border transition-all ${
            isOnline
              ? "bg-gradient-to-r from-primary/10 via-primary-light/30 to-white border-primary/30 shadow-sm"
              : "bg-light/80 border-gray-border"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center">
                {isOnline && (
                  <span className="absolute w-12 h-12 rounded-full bg-success/20 animate-ping"></span>
                )}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-md ${
                    isOnline ? "bg-success" : "bg-gray"
                  }`}
                >
                  <Power className="w-6 h-6" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-dark">
                    {isOnline
                      ? "Status: SIAP KERJA (ONLINE)"
                      : "Status: ISTIRAHAT (OFFLINE)"}
                  </h2>
                  <Badge variant={isOnline ? "success" : "neutral"} size="sm">
                    {isOnline ? "Mencari Order" : "Offline"}
                  </Badge>
                </div>
                <p className="text-xs text-gray mt-0.5">
                  {isOnline
                    ? "Radar aktif dalam radius 5 km. Pesanan masuk akan otomatis ditampilkan ke layar Anda."
                    : "Anda tidak akan menerima pesanan baru. Aktifkan tombol untuk mulai bekerja."}
                </p>
              </div>
            </div>

            <Button
              variant={isOnline ? "outline" : "primary"}
              size="md"
              onClick={() => toggleOnlineMutation.mutate()}
              loading={toggleOnlineMutation.isPending}
              className="font-bold self-start sm:self-auto text-xs"
            >
              {isOnline ? "Istirahat Sekarang" : "Nyalakan Siap Kerja"}
            </Button>
          </div>
        </div>
      )}

      {/* SECTION 3: MITRA STATS & PERFORMANCE CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Net Earnings */}
        <Card className="border border-gray-border/80">
          <CardContent className="p-4 sm:p-5 space-y-1">
            <span className="text-[11px] font-bold text-gray uppercase tracking-wider block">
              Pendapatan Hari Ini
            </span>
            <p className="text-xl sm:text-2xl font-black text-primary">
              Rp {profile?.todayEarnings?.toLocaleString("id-ID") || "0"}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-success font-semibold pt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Bersih 100% milik Anda</span>
            </div>
          </CardContent>
        </Card>

        {/* Daily Completed Trips */}
        <Card className="border border-gray-border/80">
          <CardContent className="p-4 sm:p-5 space-y-1">
            <span className="text-[11px] font-bold text-gray uppercase tracking-wider block">
              Order Selesai
            </span>
            <p className="text-xl sm:text-2xl font-black text-dark">
              {profile?.todayTrips || 0} / {profile?.dailyGoalTrips || 6}
            </p>
            <div className="w-full bg-light h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-primary h-full rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    ((profile?.todayTrips || 0) / (profile?.dailyGoalTrips || 6)) * 100,
                  )}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Rating & Performance */}
        <Card className="border border-gray-border/80">
          <CardContent className="p-4 sm:p-5 space-y-1">
            <span className="text-[11px] font-bold text-gray uppercase tracking-wider block">
              Rating Kepuasan
            </span>
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-warning text-warning" />
              <span className="text-xl sm:text-2xl font-black text-dark">
                {profile?.rating || 4.98}
              </span>
            </div>
            <span className="text-[11px] text-gray block">
              Tingkat Selesai: <strong className="text-dark">100%</strong>
            </span>
          </CardContent>
        </Card>

        {/* Partner Points / Tier */}
        <Card className="border border-gray-border/80">
          <CardContent className="p-4 sm:p-5 space-y-1">
            <span className="text-[11px] font-bold text-gray uppercase tracking-wider block">
              Poin Mitra Harian
            </span>
            <p className="text-xl sm:text-2xl font-black text-primary">
              {profile?.points || 80} Poin
            </p>
            <div className="flex items-center gap-1 text-[11px] text-primary font-semibold pt-1">
              <Award className="w-3.5 h-3.5" />
              <span>Mitra Pro Prioritas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 4: LIVE RADAR MAP & NEARBY AVAILABLE JOBS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-dark flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              Radar Pekerjaan Terdekat di Peta
            </h3>
            <p className="text-xs text-gray">
              Pekerjaan yang sedang dibuka oleh pemesan di sekitarmu yang siap Anda ambil.
            </p>
          </div>
          <Link
            href="/mitra/orders"
            className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 self-start sm:self-auto"
          >
            Lihat Semua Riwayat Order &rarr;
          </Link>
        </div>

        {/* Live Map Box */}
        <div className="rounded-3xl overflow-hidden border border-gray-border shadow-sm">
          <TaskMap
            tasks={nearbyTasks}
            onApplyClick={(task) => {
              if (activeOrder) {
                alert(
                  `Anda sedang memiliki tugas aktif yang berjalan ("${activeOrder.title}"). Selesaikan tugas tersebut terlebih dahulu sebelum mengambil tugas baru.`,
                );
                return;
              }
              acceptOrderMutation.mutate(task.id);
            }}
          />
        </div>
      </div>

      {/* Error Banner jika gagal mengambil order */}
      {acceptOrderMutation.isError && (
        <div className="p-3.5 rounded-2xl bg-error-light text-error text-xs font-bold border border-error/20 flex items-center justify-between">
          <span>
            {(acceptOrderMutation.error as Error)?.message || "Gagal mengambil order"}
          </span>
          <button
            onClick={() => acceptOrderMutation.reset()}
            className="text-xs underline ml-2 hover:opacity-80"
          >
            Tutup
          </button>
        </div>
      )}

      {/* SECTION 5: QUICK ORDER FEED (CARDS) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-dark">
            {activeOrder
              ? `Lowongan Lain di Sekitar (${nearbyTasks.length})`
              : `Lowongan Tugas Instan Tersedia (${nearbyTasks.length})`}
          </h4>
          <span className="text-xs text-gray">
            {activeOrder
              ? "Tersedia untuk dilihat atau diambil setelah tugas aktif selesai"
              : "Terupdate realtime"}
          </span>
        </div>

        {/* Banner Penjelasan jika sedang ada tugas aktif yang berjalan */}
        {activeOrder && (
          <div className="p-3.5 rounded-2xl bg-warning-light border border-warning/80 text-warning-deep text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-warning-deep shrink-0" />
              <span>
                Anda sedang menjalankan 1 tugas aktif:{" "}
                <strong>{activeOrder.title}</strong>. Lowongan lain di bawah tetap
                berstatus terbuka di radar dan tidak ikut terambil.
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {nearbyTasks.slice(0, 4).map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-border/80 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm">
                    {task.category}
                  </Badge>
                  <span className="text-xs font-extrabold text-success">
                    Rp {task.budget.toLocaleString("id-ID")}
                  </span>
                </div>

                <h5 className="font-bold text-sm text-dark leading-snug line-clamp-2 break-words">
                  {task.title}
                </h5>

                <div className="text-xs text-gray space-y-1.5 pt-0.5">
                  <p className="flex items-start gap-1.5 leading-snug">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="break-words line-clamp-2">{task.location}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray shrink-0" />
                    <span>
                      {task.scheduleDate} ({task.scheduleTime})
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-light flex items-center justify-between">
                <span className="text-[11px] text-gray">
                  Pemesan: <strong className="text-dark">{task.poster.name}</strong>
                </span>

                {activeOrder ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      Tersedia di Radar
                    </span>
                    <Link href={`/tasks/${task.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs font-semibold text-dark hover:bg-light"
                      >
                        <Eye className="w-3 h-3 mr-1 text-gray" />
                        Rincian
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    className="text-xs font-bold"
                    onClick={() => acceptOrderMutation.mutate(task.id)}
                    loading={acceptingTaskId === task.id}
                    disabled={!!acceptingTaskId}
                  >
                    Ambil Orderan
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POPUP RADAR MODAL WHEN NEW INCOMING ORDER ARRIVES (GOPARTNER STYLE) */}
      {incomingOrder && isOnline && !activeOrder && (
        <IncomingOrderModal
          order={incomingOrder}
          onAccept={(taskId) => acceptOrderMutation.mutate(taskId)}
          onDismiss={() => setDismissedOrderId(incomingOrder.id)}
          isAccepting={acceptOrderMutation.isPending}
        />
      )}
    </div>
  );
}
