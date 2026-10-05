"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Package, CheckCircle2, MapPin, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChatDrawer } from "@/features/chat/components/chat-drawer";
import type { ApplicationItem, TransactionItem } from "@/features/tasks/types";

export default function MitraOrdersPage() {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE");
  const [chatTaskId, setChatTaskId] = useState<string | null>(null);
  const [chatTaskTitle, setChatTaskTitle] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["workerDashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/worker");
      const json = await res.json();
      return json.data;
    },
  });

  const applications: ApplicationItem[] = data?.applications || [];
  const earnings = data?.earnings || { transactions: [] };

  const activeApps = applications.filter((app) => app.status === "ACCEPTED");
  const historyTransactions: TransactionItem[] = earnings.transactions || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-dark tracking-tight">
            Orderan & Tugas Saya
          </h1>
          <p className="text-xs text-gray mt-1">
            Pantau pekerjaan yang sedang berlangsung dan riwayat pesanan yang telah
            tuntas.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center p-1 bg-white rounded-2xl border border-gray-border shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "ACTIVE"
                ? "bg-primary text-white shadow-xs"
                : "text-gray hover:text-dark"
            }`}
          >
            Sedang Berjalan ({activeApps.length})
          </button>
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "HISTORY"
                ? "bg-primary text-white shadow-xs"
                : "text-gray hover:text-dark"
            }`}
          >
            Riwayat Selesai ({historyTransactions.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-gray">
          Memuat daftar orderan...
        </div>
      ) : activeTab === "ACTIVE" ? (
        /* TAB 1: ACTIVE ORDERS */
        activeApps.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-border space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-light text-gray mx-auto flex items-center justify-center">
              <Package className="w-6 h-6 text-gray" />
            </div>
            <h3 className="text-base font-bold text-dark">
              Tidak Ada Orderan yang Sedang Berjalan
            </h3>
            <p className="text-xs text-gray max-w-sm mx-auto">
              Buka menu Radar untuk menemukan pesanan aktif di sekitar Anda.
            </p>
            <div className="pt-2">
              <Link href="/mitra">
                <Button variant="primary" size="sm" className="font-bold">
                  Buka Radar Order
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activeApps.map((app) => (
              <Card key={app.id} className="p-5 sm:p-6 border-2 border-primary/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="primary" size="sm">
                        {app.task?.category || "Tugas"}
                      </Badge>
                      <Badge variant="success" size="sm">
                        Sedang Berjalan
                      </Badge>
                      <span className="text-xs text-gray">
                        Diterima pada{" "}
                        {new Date(app.appliedAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg text-dark leading-snug break-words">
                      {app.task?.title}
                    </h3>

                    <div className="text-xs text-gray space-y-1.5 pt-0.5">
                      <p className="flex items-start gap-1.5 leading-snug">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="break-words">{app.task?.location}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray shrink-0" />
                        <span>
                          {app.task?.scheduleDate} ({app.task?.scheduleTime})
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end justify-between gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-light">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-gray uppercase font-semibold block">
                        Upah Bersih
                      </span>
                      <span className="text-xl font-black text-success">
                        Rp {app.task?.budget?.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs font-bold"
                        onClick={() => {
                          setChatTaskId(app.taskId);
                          setChatTaskTitle(app.task?.title || "Tugas");
                        }}
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1" />
                        Chat Pemesan
                      </Button>
                      <Link href={`/tasks/${app.taskId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs font-semibold"
                        >
                          Detail Tugas
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : /* TAB 2: COMPLETED HISTORY */
      historyTransactions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-light text-gray mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-gray" />
          </div>
          <h3 className="text-base font-bold text-dark">Belum Ada Riwayat Selesai</h3>
          <p className="text-xs text-gray max-w-sm mx-auto">
            Pesanan yang telah Anda selesaikan beserta pembayaran akan tercatat rapi di
            sini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {historyTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  <h4 className="font-bold text-sm text-dark">
                    {tx.task?.title || "Tugas Selesai"}
                  </h4>
                </div>
                <p className="text-xs text-gray">
                  Selesai pada {new Date(tx.createdAt).toLocaleDateString("id-ID")} •
                  Transaksi {tx.id}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-gray uppercase font-semibold block">
                  Penghasilan Diterima
                </span>
                <span className="text-base font-extrabold text-success">
                  + Rp {tx.netAmount.toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-gray block">
                  (Potongan komisi {Math.round(tx.commissionRate * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Chat Drawer */}
      {chatTaskId && (
        <ChatDrawer
          taskId={chatTaskId}
          taskTitle={chatTaskTitle}
          isOpen={!!chatTaskId}
          onClose={() => setChatTaskId(null)}
        />
      )}
    </div>
  );
}
