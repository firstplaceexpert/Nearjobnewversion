"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, ShieldCheck, Truck, Store, Briefcase } from "lucide-react";
import { ChatDrawer } from "@/features/chat/components/chat-drawer";
import type { TaskItem } from "@/features/tasks/types";

export default function ChatListPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState("");
  const [selectedTaskBudget, setSelectedTaskBudget] = useState<number | undefined>(
    undefined,
  );

  const {
    data: tasks = [],
    isLoading,
    isError,
  } = useQuery<TaskItem[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Gagal mengambil data tugas");
      const json = await res.json();
      return Array.isArray(json) ? json : json.data || [];
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Kotak Pesan & Koordinasi
          </h1>
          <p className="text-xs text-gray mt-1">
            Percakapan aktif antara Pemberi Tugas dan Pekerja yang telah diterima.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-primary font-medium bg-primary-light px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span>Garansi Komunikasi Aman</span>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-sm text-gray">
          Memuat daftar percakapan...
        </div>
      ) : isError ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-border space-y-3">
          <p className="text-sm font-semibold text-error">Gagal memuat percakapan</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-light text-gray mx-auto flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-gray" />
          </div>
          <h3 className="text-base font-bold text-dark">Belum Ada Percakapan Aktif</h3>
          <p className="text-xs text-gray max-w-sm mx-auto">
            Percakapan akan otomatis aktif saat pelamar tugas diterima oleh pemberi tugas.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-border divide-y divide-light overflow-hidden shadow-xs">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => {
                setSelectedTaskId(task.id);
                setSelectedTaskTitle(task.title);
                setSelectedTaskBudget(task.budget);
              }}
              className="p-4 sm:p-5 hover:bg-light/60 transition-colors cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {task.category.includes("Angkut") ? (
                    <Truck className="w-5 h-5" />
                  ) : task.category.includes("Booth") ? (
                    <Store className="w-5 h-5" />
                  ) : (
                    <Briefcase className="w-5 h-5" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-dark hover:text-primary transition-colors">
                      {task.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-light text-dark-soft">
                      {task.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray truncate max-w-xs sm:max-w-md">
                    {task.location} • Rp {task.budget.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs">
                  Buka Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Chat Drawer */}
      {selectedTaskId && (
        <ChatDrawer
          taskId={selectedTaskId}
          taskTitle={selectedTaskTitle}
          taskBudget={selectedTaskBudget}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
