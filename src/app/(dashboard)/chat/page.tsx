"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  ShieldCheck,
  Search,
  ChevronRight,
  User,
  Briefcase,
  CheckCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { ChatDrawer } from "@/features/chat/components/chat-drawer";
import type { ChatConversationItem } from "@/app/api/chat/route";

function formatChatTime(isoString?: string) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return "Kemarin";
    }

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

export default function ChatListPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState("");
  const [selectedPartnerName, setSelectedPartnerName] = useState("");
  const [selectedTaskBudget, setSelectedTaskBudget] = useState<number | undefined>(
    undefined,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: conversations = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<ChatConversationItem[]>({
    queryKey: ["chat-inbox"],
    queryFn: async () => {
      const res = await fetch("/api/chat");
      if (!res.ok) throw new Error("Gagal mengambil data percakapan");
      const json = await res.json();
      return json.data || [];
    },
    refetchInterval: 5000,
  });

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.taskTitle.toLowerCase().includes(q) ||
        c.partner.name.toLowerCase().includes(q) ||
        c.taskCategory.toLowerCase().includes(q) ||
        (c.lastMessage?.text && c.lastMessage.text.toLowerCase().includes(q)),
    );
  }, [conversations, searchQuery]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 sm:py-8 space-y-5">
      {/* 1. Header Minimalis & Rapi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-dark">Kotak Pesan</h1>
            </div>
            {conversations.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {conversations.length}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-11">
            Koordinasi pesanan & tugas aktif secara langsung dan aman.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full w-fit">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Komunikasi Terproteksi Rekening Bersama</span>
        </div>
      </div>

      {/* 2. Search Input */}
      {conversations.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari percakapan, nama kontak, atau tugas..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-border rounded-2xl text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:border-primary transition-all shadow-xs"
          />
        </div>
      )}

      {/* 3. Daftar Percakapan Bersih (In-App Messenger Style) */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Memuat pesan Anda...
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-border space-y-3">
          <p className="text-xs font-semibold text-rose-500">
            Gagal memuat daftar percakapan
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-gray-border space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-black text-dark">
              {searchQuery ? "Percakapan Tidak Ditemukan" : "Belum Ada Pesan Aktif"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchQuery
                ? `Tidak ada percakapan yang cocok dengan kata kunci "${searchQuery}".`
                : "Ruang obrolan akan otomatis terbuka saat ada tugas yang Anda ambil atau pesanan yang sedang dikoordinasikan."}
            </p>
          </div>
          {!searchQuery && (
            <div className="pt-2">
              <Link
                href="/browse"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Jelajahi Tugas Tersedia</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-border overflow-hidden shadow-xs divide-y divide-slate-100">
          {filteredConversations.map((conv) => {
            const isMitra = conv.partner.role === "WORKER";
            const timeStr = formatChatTime(conv.lastMessage?.createdAt);

            return (
              <div
                key={conv.id}
                onClick={() => {
                  setSelectedTaskId(conv.taskId);
                  setSelectedTaskTitle(conv.taskTitle);
                  setSelectedPartnerName(conv.partner.name);
                  setSelectedTaskBudget(conv.taskBudget);
                }}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 active:bg-slate-100/60 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                {/* Avatar dengan Indikator Online */}
                <div className="relative shrink-0">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-black ${
                      isMitra
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {conv.partner.name.charAt(0) || <User className="w-5 h-5" />}
                  </div>
                  {conv.partner.isOnline && (
                    <span
                      title="Online"
                      className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-xs"
                    />
                  )}
                </div>

                {/* Konten Utama Chat (Nama, Judul Tugas, Cuplikan Pesan) */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs sm:text-sm font-extrabold text-dark truncate group-hover:text-primary transition-colors">
                        {conv.partner.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                          isMitra
                            ? "bg-primary-light text-primary"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {conv.partner.roleLabel}
                      </span>
                    </div>

                    {/* Waktu Pesan Terakhir */}
                    {timeStr && (
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">
                        {timeStr}
                      </span>
                    )}
                  </div>

                  {/* Judul Tugas Ringkas */}
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 truncate">
                    <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{conv.taskTitle}</span>
                  </div>

                  {/* Snippet Pesan Terakhir */}
                  <div className="flex items-center gap-1 text-xs text-slate-600 truncate pt-0.5">
                    {conv.lastMessage ? (
                      <>
                        {conv.lastMessage.isMe && (
                          <CheckCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                        <span className="truncate text-[11px] sm:text-xs text-slate-500">
                          {conv.lastMessage.isMe
                            ? `Anda: ${conv.lastMessage.text}`
                            : conv.lastMessage.text}
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Belum ada pesan terkirim. Klik untuk memulai obrolan.
                      </span>
                    )}
                  </div>
                </div>

                {/* Aksi & Indikator Belum Dibaca */}
                <div className="flex items-center gap-2 shrink-0 pl-1">
                  {conv.unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Slide-over Chat Drawer saat baris diklik */}
      {selectedTaskId && (
        <ChatDrawer
          taskId={selectedTaskId}
          taskTitle={selectedTaskTitle}
          otherPartyName={selectedPartnerName}
          taskBudget={selectedTaskBudget}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
