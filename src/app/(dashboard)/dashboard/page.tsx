"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Clock,
  CheckCircle2,
  MessageSquare,
  Search,
  Wrench,
  Check,
  X,
  Plus,
  ChevronRight,
  Calendar,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRupiah } from "@/lib/utils";

import { ChatDrawer } from "@/features/chat/components/chat-drawer";
import type { TaskItem, ApplicationItem } from "@/features/tasks/types";

export type FilterStatus = "ALL" | "SEARCHING" | "WORKING" | "COMPLETED";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");

  // Selected task to open live progress tracker
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Chat Drawer State
  const [chatTask, setChatTask] = useState<{
    id: string;
    title: string;
    budget?: number;
  } | null>(null);

  // Fetch Poster Dashboard Data
  const { data, isLoading } = useQuery({
    queryKey: ["posterDashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/poster");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    refetchInterval: 5000, // Poll every 5s for live status
  });

  const tasks: TaskItem[] = data?.tasks || [];

  // Update selectedTask if tasks refetch so modal reflects current state
  const activeSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || selectedTask
    : null;

  // Fetch Applicants for selected task if it's still searching
  const isSearching =
    activeSelectedTask?.status === "OPEN" ||
    (activeSelectedTask?.status as string) === "PENDING";

  const { data: applicantsData, isLoading: isApplicantsLoading } = useQuery({
    queryKey: ["applicants", activeSelectedTask?.id],
    queryFn: async () => {
      if (!activeSelectedTask?.id) return null;
      const res = await fetch(`/api/tasks/${activeSelectedTask.id}/applicants`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: !!activeSelectedTask?.id && isSearching,
  });

  const applicants: ApplicationItem[] = applicantsData?.applicants || [];

  // Curate Mutation (Accept applicant)
  const curateMutation = useMutation({
    mutationFn: async ({
      taskId,
      applicationId,
    }: {
      taskId: string;
      applicationId: string;
    }) => {
      const res = await fetch(`/api/tasks/${taskId}/curate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status: "ACCEPTED" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posterDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Complete Task Mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posterDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Helper to determine stage number (1: SEARCHING, 2: WORKING, 3: COMPLETED)
  const getStageNumber = (status: string) => {
    if (status === "COMPLETED" || status === "PAID") return 3;
    if (
      status === "IN_PROGRESS" ||
      status === "ACCEPTED" ||
      status === "OTW" ||
      status === "WORKING"
    )
      return 2;
    return 1;
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === "ALL") return true;
    const stage = getStageNumber(t.status);
    if (filterStatus === "SEARCHING") return stage === 1;
    if (filterStatus === "WORKING") return stage === 2;
    if (filterStatus === "COMPLETED") return stage === 3;
    return true;
  });

  const searchingCount = tasks.filter((t) => getStageNumber(t.status) === 1).length;
  const workingCount = tasks.filter((t) => getStageNumber(t.status) === 2).length;
  const completedCount = tasks.filter((t) => getStageNumber(t.status) === 3).length;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray font-medium">Memuat riwayat pekerjaan Anda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* 1. Header Aktivitas */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-border/60 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-dark tracking-tight">
            Aktivitas Pekerjaan Saya
          </h1>
          <p className="text-xs text-gray mt-0.5">
            Daftar tugas yang telah Anda kirimkan. Klik pekerjaan untuk melihat progress
            pengerjaannya secara langsung.
          </p>
        </div>
        <Link href="/">
          <Button
            size="sm"
            variant="primary"
            className="text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Kirim Tugas Baru</span>
          </Button>
        </Link>
      </div>

      {/* 2. Filter Status Cepat (Semua, Mencari Mitra, Sedang Dikerjakan, Selesai) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setFilterStatus("ALL")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            filterStatus === "ALL"
              ? "bg-dark text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Semua ({tasks.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus("SEARCHING")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            filterStatus === "SEARCHING"
              ? "bg-primary text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Mencari Mitra ({searchingCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus("WORKING")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            filterStatus === "WORKING"
              ? "bg-warning-deep text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Sedang Dikerjakan ({workingCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus("COMPLETED")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            filterStatus === "COMPLETED"
              ? "bg-secondary-deep text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Selesai ({completedCount})</span>
        </button>
      </div>

      {/* 3. Daftar Pekerjaan yang Dikirimkan (Klik untuk Munculkan Progress) */}
      {filteredTasks.length === 0 ? (
        <Card className="rounded-3xl border border-gray-border/80 p-8 sm:p-12 text-center bg-white shadow-xs">
          <CardContent className="p-0">
            <EmptyState
              title="Belum Ada Pekerjaan di Kategori Ini"
              description="Anda belum memiliki pesanan pekerjaan pada status ini. Buat tugas baru dengan mudah sekarang."
              action={{
                label: "Kirim Tugas Sekarang",
                href: "/",
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const currentStage = getStageNumber(task.status);
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="p-4 sm:p-5 rounded-3xl border border-gray-border/80 bg-white hover:border-primary/60 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Info Pekerjaan */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {task.category}
                    </span>

                    {/* Badge Status Ringkas */}
                    {currentStage === 1 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black border border-primary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                        <span>Mencari Mitra</span>
                      </span>
                    )}

                    {currentStage === 2 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-warning-light text-warning-deep text-[10px] font-black border border-warning">
                        <Clock className="w-3 h-3 text-warning-deep animate-spin" />
                        <span>Sedang Dikerjakan</span>
                      </span>
                    )}

                    {currentStage === 3 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-light text-secondary-deep text-[10px] font-black border border-secondary/30">
                        <CheckCircle2 className="w-3 h-3 text-secondary-hover" />
                        <span>Selesai & Lunas</span>
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400">
                      {task.scheduleDate} {task.scheduleTime && `(${task.scheduleTime})`}
                    </span>
                  </div>

                  <h3 className="font-black text-dark text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                    {task.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{task.location}</span>
                    </span>
                    <span>•</span>
                    <span className="font-extrabold text-dark shrink-0">
                      {formatRupiah(task.budget)}
                    </span>
                  </div>
                </div>

                {/* Tombol Lihat Progress */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary self-end sm:self-center shrink-0 group-hover:translate-x-1 transition-transform">
                  <span>Lihat Progress</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL / DRAWER LIVE PROGRESS TRACKER (MUNCUL KETIKA PEKERJAAN DI-KLIK) */}
      {activeSelectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-border overflow-hidden relative animate-scale-in max-h-[92vh] overflow-y-auto space-y-6">
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-border/70">
              <div className="space-y-1 pr-6">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {activeSelectedTask.category}
                </span>
                <h3 className="text-base sm:text-lg font-black text-dark leading-snug">
                  {activeSelectedTask.title}
                </h3>
                <p className="text-xs text-slate-400">
                  ID: #{activeSelectedTask.id} • Dibuat pada{" "}
                  {activeSelectedTask.scheduleDate}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-dark transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* VISUAL 3-STEP PROGRESS STEPPER (Mencari Mitra -> Sedang Dikerjakan -> Selesai) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                Status Alur Pengerjaan:
              </span>

              {(() => {
                const stage = getStageNumber(activeSelectedTask.status);
                return (
                  <div className="grid grid-cols-3 gap-2 text-center relative">
                    {/* Step 1: Mencari Mitra */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          stage >= 1
                            ? stage === 1
                              ? "bg-primary text-white ring-4 ring-primary/20 shadow-xs"
                              : "bg-secondary-hover text-white"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {stage > 1 ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Search className="w-4 h-4 animate-pulse" />
                        )}
                      </div>
                      <span className="text-[11px] font-black mt-2 text-dark">
                        1. Mencari Mitra
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {stage > 1 ? "Ditemukan" : "Sedang Mencari"}
                      </span>
                    </div>

                    {/* Step 2: Sedang Dikerjakan */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          stage >= 2
                            ? stage === 2
                              ? "bg-warning text-dark ring-4 ring-warning shadow-xs"
                              : "bg-secondary-hover text-white"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {stage > 2 ? (
                          <Check className="w-4 h-4" />
                        ) : stage === 2 ? (
                          <Wrench className="w-4 h-4 animate-spin" />
                        ) : (
                          <Wrench className="w-4 h-4" />
                        )}
                      </div>
                      <span className="text-[11px] font-black mt-2 text-dark">
                        2. Dikerjakan
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {stage > 2 ? "Selesai" : stage === 2 ? "Berlangsung" : "Menunggu"}
                      </span>
                    </div>

                    {/* Step 3: Selesai */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          stage === 3
                            ? "bg-secondary-hover text-white ring-4 ring-secondary/30 shadow-xs"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-black mt-2 text-dark">
                        3. Selesai
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {stage === 3 ? "Tuntas" : "Tahap Akhir"}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* KONTEN DETAIL SESUAI STATUS PROGRES */}
            {(() => {
              const stage = getStageNumber(activeSelectedTask.status);

              // TAHAP 1: SEDANG MENCARI MITRA
              if (stage === 1) {
                return (
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                        <Search className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-dark">
                          Radar Aktif Mencari Mitra Terdekat
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Permintaan Anda disiarkan ke mitra terdekat di sekitar lokasi.
                        </p>
                      </div>
                    </div>

                    {/* Pelamar Section jika ada */}
                    <div className="pt-2 border-t border-primary/15">
                      <span className="text-[11px] font-extrabold text-slate-700 block mb-2">
                        Mitra yang Mengajukan Lamaran ({applicants.length}):
                      </span>

                      {isApplicantsLoading ? (
                        <p className="text-xs text-slate-500 text-center py-2">
                          Memuat pelamar...
                        </p>
                      ) : applicants.length === 0 ? (
                        <p className="text-xs text-slate-500 bg-white p-3 rounded-xl border border-primary/15">
                          Belum ada pelamar yang mengajukan. Mitra biasanya merespons
                          dalam 1-5 menit.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {applicants.map((app) => (
                            <div
                              key={app.id}
                              className="p-3 bg-white rounded-xl border border-primary/20 flex items-center justify-between gap-3 shadow-2xs"
                            >
                              <div className="min-w-0">
                                <span className="font-extrabold text-xs text-dark block truncate">
                                  {app.worker?.name || "Mitra NearJob"}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {app.note || "Siap mengerjakan tugas sekarang."}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() =>
                                  curateMutation.mutate({
                                    taskId: activeSelectedTask.id,
                                    applicationId: app.id,
                                  })
                                }
                                loading={curateMutation.isPending}
                                className="text-xs font-bold px-3 py-1.5 shrink-0"
                              >
                                Pilih Mitra Ini
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // TAHAP 2: SEDANG DIKERJAKAN
              if (stage === 2) {
                return (
                  <div className="p-4 rounded-2xl bg-warning-light/70 border border-warning space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-warning text-dark flex items-center justify-center shrink-0">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-dark">
                            Mitra Sedang Mengerjakan Tugas
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Mitra telah terhubung. Anda dapat memantau dan berkomunikasi
                            langsung.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setChatTask({
                            id: activeSelectedTask.id,
                            title: activeSelectedTask.title,
                            budget: activeSelectedTask.budget,
                          })
                        }
                        className="flex-1 text-xs font-bold flex items-center justify-center gap-1.5 border-primary/30 text-primary hover:bg-primary-light/40"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Langsung dengan Mitra</span>
                      </Button>

                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              `Konfirmasi pekerjaan "${activeSelectedTask.title}" telah selesai dikerjakan?`,
                            )
                          ) {
                            completeTaskMutation.mutate(activeSelectedTask.id);
                          }
                        }}
                        loading={completeTaskMutation.isPending}
                        className="flex-1 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Konfirmasi Selesai</span>
                      </Button>
                    </div>
                  </div>
                );
              }

              // TAHAP 3: SUDAH SELESAI
              return (
                <div className="p-4 rounded-2xl bg-secondary-light/70 border border-secondary/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-secondary-hover text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-secondary-deep">
                        Pekerjaan Telah Tuntas & Selesai
                      </h4>
                      <p className="text-[11px] text-secondary-deep">
                        Pembayaran telah diteruskan kepada mitra via rekening bersama
                        aman.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-secondary-deep bg-white px-2.5 py-1 rounded-xl border border-secondary/30 shrink-0">
                    Lunas
                  </span>
                </div>
              );
            })()}

            {/* Rincian Ringkas Pekerjaan */}
            <div className="space-y-3 pt-2 text-xs">
              <span className="font-bold text-dark block">
                Rincian Informasi Pekerjaan:
              </span>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Lokasi Pengerjaan
                    </span>
                    <span className="font-bold text-dark">
                      {activeSelectedTask.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Jadwal
                    </span>
                    <span className="font-bold text-dark">
                      {activeSelectedTask.scheduleDate}{" "}
                      {activeSelectedTask.scheduleTime &&
                        `jam ${activeSelectedTask.scheduleTime} WIB`}
                    </span>
                  </div>
                </div>

                {activeSelectedTask.description && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Instruksi Tugas
                    </span>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line mt-0.5">
                      {activeSelectedTask.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Total Biaya Layanan (Bersih Tanpa Bocoran Komisi) */}
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-dark block">Total Biaya Layanan:</span>
                  <span className="text-[11px] text-slate-500">
                    Tarif resmi all-in via NearPay
                  </span>
                </div>
                <span className="font-black text-dark text-base sm:text-lg">
                  {formatRupiah(activeSelectedTask.budget)}
                </span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTask(null)}
                className="text-xs"
              >
                Tutup
              </Button>
              <Link href={`/tasks/${activeSelectedTask.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-bold text-primary"
                >
                  Lihat Halaman Penuh &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. Chat Drawer Terintegrasi */}
      {chatTask && (
        <ChatDrawer
          isOpen={!!chatTask}
          onClose={() => setChatTask(null)}
          taskId={chatTask.id}
          taskTitle={chatTask.title}
          otherPartyName="Mitra Lapangan"
        />
      )}
    </div>
  );
}
