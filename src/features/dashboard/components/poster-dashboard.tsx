"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRupiah } from "@/lib/utils";
import { TASK_STATUS_CONFIG, APPLICATION_STATUS_CONFIG } from "@/lib/constants";
import { DashboardStatsSkeleton, TaskCardSkeleton } from "@/components/ui/skeleton";
import { ChatDrawer } from "@/features/chat/components/chat-drawer";
import { MapPin, Users, Check, MessageSquare, ClipboardList, X } from "lucide-react";
import type { TaskItem, ApplicationItem } from "@/features/tasks/types";

export function PosterDashboard() {
  const queryClient = useQueryClient();
  const [selectedTaskIdForCuration, setSelectedTaskIdForCuration] = useState<
    string | null
  >(null);
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
  });

  // Fetch Applicants for selected task
  const {
    data: applicantsData,
    isLoading: isApplicantsLoading,
    error: applicantsError,
  } = useQuery({
    queryKey: ["applicants", selectedTaskIdForCuration],
    queryFn: async () => {
      if (!selectedTaskIdForCuration) return null;
      const res = await fetch(`/api/tasks/${selectedTaskIdForCuration}/applicants`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: !!selectedTaskIdForCuration,
  });

  // Curate Mutation (Accept / Reject)
  const curateMutation = useMutation({
    mutationFn: async ({
      taskId,
      applicationId,
      status,
    }: {
      taskId: string;
      applicationId: string;
      status: "ACCEPTED" | "REJECTED";
    }) => {
      const res = await fetch(`/api/tasks/${taskId}/curate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posterDashboard"] });
      queryClient.invalidateQueries({
        queryKey: ["applicants", selectedTaskIdForCuration],
      });
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

  const tasks: TaskItem[] = data?.tasks || [];
  const stats = data?.stats || {
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalApplicants: 0,
  };

  const applicants: ApplicationItem[] = applicantsData?.applicants || [];

  return (
    <div className="space-y-8">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs font-semibold text-gray">Total Tugas Dibuat</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-dark mt-1">
              {stats.totalTasks}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs font-semibold text-gray">Tugas Aktif</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-primary mt-1">
              {stats.activeTasks}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs font-semibold text-gray">Total Pelamar Masuk</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-warning mt-1">
              {stats.totalApplicants}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs font-semibold text-gray">Tugas Selesai</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-success mt-1">
              {stats.completedTasks}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Task List Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-dark">
            Daftar Pekerjaan yang Anda Posting
          </h2>
          <Link href="/post-task">
            <Button size="sm" variant="primary">
              + Buat Tugas Baru
            </Button>
          </Link>
        </div>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <EmptyState
                title="Belum Ada Tugas yang Diposting"
                description="Anda belum memiliki tugas yang sedang berjalan atau dibuka. Pasang tugas pertama Anda sekarang untuk menemukan pekerja terdekat."
                action={{
                  label: "+ Pasang Tugas Baru",
                  href: "/post-task",
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task) => {
              const statusConfig =
                TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.OPEN;
              return (
                <Card
                  key={task.id}
                  className="p-5 sm:p-6 transition-all hover:border-gray"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="primary" size="sm">
                          {task.category}
                        </Badge>
                        <Badge variant={statusConfig.variant} size="sm">
                          {statusConfig.label}
                        </Badge>
                        <span className="text-xs text-gray font-medium">
                          {task.scheduleDate} ({task.scheduleTime})
                        </span>
                      </div>

                      <Link href={`/tasks/${task.id}`}>
                        <h3 className="font-bold text-dark text-base sm:text-lg hover:text-primary transition-colors">
                          {task.title}
                        </h3>
                      </Link>

                      <p className="text-xs sm:text-sm text-gray line-clamp-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{task.location}</span>
                        <span>•</span>
                        <span>Budget:</span>
                        <span className="font-bold text-dark">
                          {formatRupiah(task.budget)}
                        </span>
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-2.5 flex-wrap pt-2 lg:pt-0 border-t lg:border-t-0 border-light">
                      <Button
                        variant={
                          selectedTaskIdForCuration === task.id ? "primary" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setSelectedTaskIdForCuration(
                            selectedTaskIdForCuration === task.id ? null : task.id,
                          )
                        }
                        className="relative flex items-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Kurasi Pelamar ({task.applicationsCount || 0})</span>
                      </Button>

                      {task.status === "IN_PROGRESS" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(
                                `Selesaikan tugas "${task.title}" dan konfirmasi pembayaran?`,
                              )
                            ) {
                              completeTaskMutation.mutate(task.id);
                            }
                          }}
                          loading={completeTaskMutation.isPending}
                          className="flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Tandai Selesai</span>
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setChatTask({
                            id: task.id,
                            title: task.title,
                            budget: task.budget,
                          })
                        }
                        className="flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </Button>

                      <Link href={`/tasks/${task.id}`}>
                        <Button variant="ghost" size="sm">
                          Lihat
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Inline Curation Drawer / Panel */}
                  {selectedTaskIdForCuration === task.id && (
                    <div className="mt-6 pt-6 border-t border-gray-border/60 bg-light/30 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-5 sm:p-6 rounded-b-2xl animate-in fade-in duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-dark text-sm sm:text-base flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-primary" />
                            <span>Kurasi Pelamar untuk &ldquo;{task.title}&rdquo;</span>
                          </h4>
                          <p className="text-xs text-gray mt-0.5">
                            Pilih pekerja yang paling sesuai. Menerima pelamar akan
                            mengubah status tugas menjadi &ldquo;Berjalan&rdquo; dan
                            mencatat transaksi komisi dinamis.
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedTaskIdForCuration(null)}
                          className="text-xs text-gray hover:text-dark p-1.5 flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tutup</span>
                        </button>
                      </div>

                      {isApplicantsLoading ? (
                        <div className="p-8 text-center text-xs text-gray">
                          Memuat data pelamar...
                        </div>
                      ) : applicantsError ? (
                        <div className="p-4 bg-error-light text-error text-xs rounded-xl font-medium">
                          {(applicantsError as Error).message}
                        </div>
                      ) : applicants.length === 0 ? (
                        <div className="p-8 text-center bg-white rounded-xl border border-gray-border/50">
                          <p className="text-xs text-gray">
                            Belum ada pelamar yang mengajukan diri untuk tugas ini.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {applicants.map((app) => {
                            const appStatusConfig =
                              APPLICATION_STATUS_CONFIG[app.status] ||
                              APPLICATION_STATUS_CONFIG.PENDING;

                            return (
                              <div
                                key={app.id}
                                className="p-4 rounded-xl bg-white border border-gray-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary-light text-primary font-bold text-xs flex items-center justify-center">
                                      {app.worker?.name?.charAt(0) || "W"}
                                    </div>
                                    <div>
                                      <p className="font-bold text-dark text-xs sm:text-sm">
                                        {app.worker?.name}
                                      </p>
                                      <p className="text-[11px] text-gray">
                                        {app.worker?.email} • Melamar pada{" "}
                                        {new Date(app.appliedAt).toLocaleDateString(
                                          "id-ID",
                                        )}
                                      </p>
                                    </div>
                                    <Badge variant={appStatusConfig.variant} size="sm">
                                      {appStatusConfig.label}
                                    </Badge>
                                  </div>

                                  {app.note && (
                                    <p className="text-xs text-dark-soft bg-light/70 p-2.5 rounded-lg mt-2 italic leading-relaxed">
                                      &ldquo;{app.note}&rdquo;
                                    </p>
                                  )}
                                </div>

                                {/* Decision Buttons */}
                                {app.status === "PENDING" && task.status === "OPEN" ? (
                                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                                    <Button
                                      size="sm"
                                      variant="success"
                                      onClick={() =>
                                        curateMutation.mutate({
                                          taskId: task.id,
                                          applicationId: app.id,
                                          status: "ACCEPTED",
                                        })
                                      }
                                      loading={curateMutation.isPending}
                                      className="flex items-center gap-1"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Terima</span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        curateMutation.mutate({
                                          taskId: task.id,
                                          applicationId: app.id,
                                          status: "REJECTED",
                                        })
                                      }
                                      loading={curateMutation.isPending}
                                      className="flex items-center gap-1"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Tolak</span>
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-xs font-semibold text-gray shrink-0">
                                    Keputusan Selesai
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

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
