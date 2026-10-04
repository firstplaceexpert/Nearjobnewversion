"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRupiah } from "@/lib/utils";
import { APPLICATION_STATUS_CONFIG, TASK_STATUS_CONFIG } from "@/lib/constants";
import { DashboardStatsSkeleton, TaskCardSkeleton } from "@/components/ui/skeleton";
import { ChatDrawer } from "@/features/chat/components/chat-drawer";
import { MapPin, Calendar, MessageSquare } from "lucide-react";
import type { ApplicationItem, TransactionItem } from "@/features/tasks/types";

export function WorkerDashboard() {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [chatTask, setChatTask] = useState<{
    id: string;
    title: string;
    budget?: number;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["workerDashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/worker");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardStatsSkeleton />
        <div className="space-y-4 pt-4">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      </div>
    );
  }

  const applications: ApplicationItem[] = data?.applications || [];
  const earnings = data?.earnings || {
    totalCompletedTasks: 0,
    totalEarned: 0,
    pendingEarnings: 0,
    transactions: [],
  };

  const filteredApps = applications.filter((app) => {
    if (filterStatus === "ALL") return true;
    return app.status === filterStatus;
  });

  return (
    <div className="space-y-8">
      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Earned Net */}
        <Card className="border-2 border-success/30 bg-success-light/10">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-gray">
              Total Penghasilan Bersih (Cair)
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-success mt-1">
              {formatRupiah(earnings.totalEarned)}
            </p>
            <span className="text-[11px] text-gray mt-1 block">
              Setelah potongan komisi dinamis 9% - 10%
            </span>
          </CardContent>
        </Card>

        {/* Pending In-Progress Earnings */}
        <Card className="border-2 border-warning/30 bg-warning-light/10">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-gray">
              Penghasilan Tertahan (Tugas Berjalan)
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-warning mt-1">
              {formatRupiah(earnings.pendingEarnings)}
            </p>
            <span className="text-[11px] text-gray mt-1 block">
              Diterima saat poster menyelesaikan tugas
            </span>
          </CardContent>
        </Card>

        {/* Total Tasks Done */}
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-gray">Pekerjaan Selesai</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-dark mt-1">
              {earnings.totalCompletedTasks} Tugas
            </p>
            <span className="text-[11px] text-primary mt-1 block font-medium">
              Reputasi Pekerja Aktif
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Applied Tasks Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-dark">
            Status Lamaran Pekerjaan Anda
          </h2>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterStatus === "ALL"
                  ? "bg-dark text-white"
                  : "bg-light text-gray hover:text-dark"
              }`}
            >
              Semua ({applications.length})
            </button>
            <button
              onClick={() => setFilterStatus("PENDING")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterStatus === "PENDING"
                  ? "bg-warning text-white"
                  : "bg-light text-gray hover:text-dark"
              }`}
            >
              Menunggu ({applications.filter((a) => a.status === "PENDING").length})
            </button>
            <button
              onClick={() => setFilterStatus("ACCEPTED")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterStatus === "ACCEPTED"
                  ? "bg-success text-white"
                  : "bg-light text-gray hover:text-dark"
              }`}
            >
              Diterima ({applications.filter((a) => a.status === "ACCEPTED").length})
            </button>
            <button
              onClick={() => setFilterStatus("REJECTED")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterStatus === "REJECTED"
                  ? "bg-error text-white"
                  : "bg-light text-gray hover:text-dark"
              }`}
            >
              Ditolak ({applications.filter((a) => a.status === "REJECTED").length})
            </button>
          </div>
        </div>

        {filteredApps.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <EmptyState
                title="Belum Ada Lamaran Tugas"
                description="Anda belum memiliki lamaran pada kategori ini. Temukan lowongan pekerjaan terdekat di halaman pencarian."
                action={{
                  label: "Cari Tugas Sekarang",
                  href: "/browse",
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredApps.map((app) => {
              const statusConfig =
                APPLICATION_STATUS_CONFIG[app.status] ||
                APPLICATION_STATUS_CONFIG.PENDING;
              const taskStatusConfig = app.task
                ? TASK_STATUS_CONFIG[app.task.status]
                : undefined;

              return (
                <Card
                  key={app.id}
                  className="p-5 sm:p-6 transition-all hover:border-gray"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={statusConfig.variant} size="sm">
                          Lamaran: {statusConfig.label}
                        </Badge>
                        {taskStatusConfig && (
                          <Badge variant={taskStatusConfig.variant} size="sm">
                            Tugas: {taskStatusConfig.label}
                          </Badge>
                        )}
                        <span className="text-xs text-gray">
                          Diajukan pada{" "}
                          {new Date(app.appliedAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>

                      {app.task ? (
                        <Link href={`/tasks/${app.task.id}`}>
                          <h3 className="font-bold text-dark text-base sm:text-lg hover:text-primary transition-colors">
                            {app.task.title}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="font-bold text-dark text-base">Tugas Terkait</h3>
                      )}

                      {app.task && (
                        <div className="text-xs sm:text-sm text-gray space-y-1">
                          <p className="flex items-center gap-1.5 flex-wrap">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{app.task.location}</span>
                            <span>•</span>
                            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>
                              {app.task.scheduleDate} ({app.task.scheduleTime})
                            </span>
                          </p>
                          <p>
                            Pemberi Tugas:{" "}
                            <span className="font-semibold text-dark">
                              {app.task.poster?.name || "Poster"}
                            </span>
                          </p>
                        </div>
                      )}

                      {app.note && (
                        <p className="text-xs text-dark-soft bg-light/70 p-2.5 rounded-lg mt-2 italic">
                          Catatan Anda: &ldquo;{app.note}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Right Budget & View Detail */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-light shrink-0">
                      {app.task && (
                        <div className="text-left lg:text-right">
                          <span className="text-[11px] text-gray block">
                            Estimasi Upah
                          </span>
                          <span className="font-bold text-dark text-base sm:text-lg">
                            {formatRupiah(app.task.budget)}
                          </span>
                        </div>
                      )}

                      {app.task && (
                        <div className="flex items-center gap-2">
                          {app.status === "ACCEPTED" && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                setChatTask({
                                  id: app.taskId,
                                  title: app.task?.title || "Tugas",
                                  budget: app.task?.budget,
                                })
                              }
                              className="flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Chat Poster</span>
                            </Button>
                          )}
                          <Link href={`/tasks/${app.task.id}`}>
                            <Button variant="outline" size="sm">
                              Lihat Detail
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction History Section */}
      {earnings.transactions && earnings.transactions.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-border/60">
          <h2 className="text-lg sm:text-xl font-bold text-dark">
            Riwayat Pencatatan Transaksi & Komisi
          </h2>

          <div className="bg-white rounded-2xl border border-gray-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-light/80 text-gray uppercase text-[10px] tracking-wider border-b border-light">
                  <tr>
                    <th className="py-3 px-4">ID Transaksi</th>
                    <th className="py-3 px-4">Tugas</th>
                    <th className="py-3 px-4">Budget Asli</th>
                    <th className="py-3 px-4">Komisi Platform</th>
                    <th className="py-3 px-4">Penghasilan Bersih</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light">
                  {earnings.transactions.map((tx: TransactionItem) => (
                    <tr key={tx.id} className="hover:bg-light/40">
                      <td className="py-3 px-4 font-mono text-gray">{tx.id}</td>
                      <td className="py-3 px-4 font-medium text-dark">
                        {tx.task?.title || "Tugas"}
                      </td>
                      <td className="py-3 px-4">{formatRupiah(tx.amount)}</td>
                      <td className="py-3 px-4 text-error font-medium">
                        - {formatRupiah(tx.commissionAmount)} (
                        {Math.round(tx.commissionRate * 100)}%)
                      </td>
                      <td className="py-3 px-4 font-bold text-success">
                        {formatRupiah(tx.netAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={tx.status === "PAID" ? "success" : "warning"}
                          size="sm"
                        >
                          {tx.status === "PAID" ? "Cair" : "Tertahan"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Chat Drawer */}
      {chatTask && (
        <ChatDrawer
          taskId={chatTask.id}
          taskTitle={chatTask.title}
          taskBudget={chatTask.budget}
          isOpen={!!chatTask}
          onClose={() => setChatTask(null)}
        />
      )}
    </div>
  );
}
