"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApplyModal } from "@/features/tasks/components/apply-modal";
import { ChatDrawer } from "@/features/chat/components/chat-drawer";
import { formatRupiah } from "@/lib/utils";
import { calculateCommission } from "@/features/payments/services/calculateCommission";
import { JOB_TYPE_BADGE, TASK_STATUS_CONFIG } from "@/lib/constants";
import {
  MapPin,
  Calendar,
  ClipboardList,
  Map,
  Check,
  Send,
  MessageSquare,
} from "lucide-react";
import type { TaskItem, UserSummary } from "@/features/tasks/types";

interface TaskDetailClientProps {
  task: TaskItem;
  currentUser: UserSummary | null;
}

export function TaskDetailClient({ task, currentUser }: TaskDetailClientProps) {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [hasAppliedLocally, setHasAppliedLocally] = useState(task.hasApplied || false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const typeConfig = JOB_TYPE_BADGE[task.type] || JOB_TYPE_BADGE.DAILY;
  const statusConfig = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.OPEN;
  const commission = calculateCommission(task.budget);

  const isOwner = currentUser?.id === task.posterId;
  const isOpen = task.status === "OPEN";

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          ← Kembali ke Daftar Tugas
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary" size="md">
                  {task.category}
                </Badge>
                <Badge variant={typeConfig.variant} size="md">
                  {typeConfig.label}
                </Badge>
                <Badge variant={statusConfig.variant} size="md">
                  Status: {statusConfig.label}
                </Badge>
                {hasAppliedLocally && (
                  <Badge variant="warning" size="md" className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Sudah Dilamar</span>
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight leading-snug">
                {task.title}
              </h1>

              {/* Schedule & Location Quick Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-light/70 border border-gray-border/60">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white text-primary shadow-xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-gray block">
                      Lokasi Tugas
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-dark mt-0.5">
                      {task.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white text-warning shadow-xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-gray block">
                      Jadwal Pelaksanaan
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-dark mt-0.5">
                      {task.scheduleDate} ({task.scheduleTime})
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Description & Responsibilities */}
              <div className="space-y-3 pt-2">
                <h3 className="text-base font-bold text-dark flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  <span>Rincian & Jobdesk Pekerjaan</span>
                </h3>
                <div className="prose prose-sm max-w-none text-gray leading-relaxed whitespace-pre-line bg-light/30 p-5 rounded-2xl border border-gray-border/50">
                  {task.description}
                </div>
              </div>

              {/* Map & Coordinates Card */}
              <div className="space-y-3 pt-2">
                <h3 className="text-base font-bold text-dark flex items-center gap-2">
                  <Map className="w-4 h-4 text-primary" />
                  <span>Peta & Lokasi Pelaksanaan</span>
                </h3>
                <div className="relative h-48 w-full rounded-2xl border border-gray-border overflow-hidden bg-light flex flex-col items-center justify-center text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-dark text-sm">{task.location}</p>
                  <p className="text-xs text-gray mt-1">
                    Koordinat: {task.latitude ?? "-6.2088"},{" "}
                    {task.longitude ?? "106.8456"}
                  </p>
                  <span className="mt-3 px-3 py-1 rounded-full bg-white text-[11px] font-semibold text-primary border border-primary/20 shadow-xs">
                    Lokasi Terverifikasi oleh Poster
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar Column (1 Col) */}
        <div className="space-y-6">
          {/* Transparent Budget & Earnings Card */}
          <Card className="border-2 border-primary/20 shadow-md">
            <CardContent className="p-6 space-y-5">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                Transparansi Pembayaran
              </span>

              <div className="space-y-1">
                <span className="text-xs text-gray">Imbalan yang Ditawarkan Poster:</span>
                <p className="text-3xl font-extrabold text-dark tracking-tight">
                  {formatRupiah(commission.budget)}
                </p>
              </div>

              {/* Commission breakdown details */}
              <div className="p-4 rounded-xl bg-light/70 border border-gray-border/60 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray">Tarif Komisi Platform:</span>
                  <Badge variant="primary" size="sm">
                    {Math.round(commission.commissionRate * 100)}% (Flat)
                  </Badge>
                </div>

                {task.voucherCode && (
                  <div className="flex items-center justify-between text-emerald-600 font-medium">
                    <span>Diskon Voucher ({task.voucherCode}):</span>
                    <span>- {formatRupiah(task.discountAmount || 0)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-error font-medium">
                  <span>Biaya Layanan:</span>
                  <span>- {formatRupiah(commission.commissionAmount)}</span>
                </div>

                <div className="pt-2 border-t border-gray-border flex items-center justify-between">
                  <span className="font-bold text-dark">Bersih Diterima Worker:</span>
                  <span className="font-extrabold text-base text-success">
                    {formatRupiah(commission.netAmount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {isOwner ? (
                  <div className="space-y-2 text-center">
                    <div className="p-3 bg-primary-light/40 rounded-xl text-xs text-primary font-medium">
                      Anda adalah pembuat tugas ini.
                    </div>
                    <Link href={`/dashboard`} className="w-full block">
                      <Button variant="primary" size="lg" className="w-full font-bold">
                        Buka Dashboard Kurasi Pelamar ({task.applicationsCount || 0})
                      </Button>
                    </Link>
                  </div>
                ) : hasAppliedLocally ? (
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      size="lg"
                      disabled
                      className="w-full font-bold flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Lamaran Sudah Terkirim</span>
                    </Button>
                    <p className="text-[11px] text-center text-gray">
                      Menunggu kurasi dan persetujuan dari pemberi tugas.
                    </p>
                  </div>
                ) : !isOpen ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled
                    className="w-full font-bold"
                  >
                    Tugas Tidak Menerima Lamaran Lagi
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    onClick={() => setIsApplyModalOpen(true)}
                  >
                    <Send className="w-4 h-4" />
                    <span>Lamar Sekarang</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="md"
                  className="w-full font-bold flex items-center justify-center gap-2"
                  onClick={() => setIsChatOpen(true)}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Obrolan Langsung</span>
                </Button>

                <p className="text-[11px] text-center text-gray-light">
                  {task.applicationsCount || 0} orang telah melamar tugas ini
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Poster Profile Card */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <span className="text-xs font-bold text-gray uppercase tracking-wider block">
                Tentang Pemberi Tugas
              </span>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-extrabold flex items-center justify-center text-base border border-primary/20">
                  {task.poster?.name?.charAt(0) || "P"}
                </div>
                <div>
                  <h4 className="font-bold text-dark text-sm">{task.poster?.name}</h4>
                  <p className="text-xs text-gray">{task.poster?.email}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-light text-xs text-gray space-y-1">
                <div className="flex justify-between">
                  <span>Peran Akun:</span>
                  <span className="font-semibold text-primary">
                    Pemberi Tugas Terverifikasi
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Diposting pada:</span>
                  <span>{new Date(task.createdAt).toLocaleDateString("id-ID")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        task={task}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => setHasAppliedLocally(true)}
      />

      {/* Chat Drawer */}
      <ChatDrawer
        taskId={task.id}
        taskTitle={task.title}
        taskBudget={task.budget}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
