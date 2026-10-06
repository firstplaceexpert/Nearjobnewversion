"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, X, ShieldCheck, CheckCheck, MessageSquare } from "lucide-react";
import type { ChatMessage } from "@/features/tasks/types";

interface ChatDrawerProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  taskTitle?: string;
  taskBudget?: number;
  otherPartyName?: string;
}

export function ChatDrawer({
  taskId,
  isOpen,
  onClose,
  taskTitle = "Tugas Aktif",
  taskBudget,
  otherPartyName,
}: ChatDrawerProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Polling active user info
  const { data: activeUserData } = useQuery({
    queryKey: ["activeUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/active-user");
      if (!res.ok) return null;
      const json = await res.json();
      return json.currentUser;
    },
  });

  // Polling chat messages
  const { data: chatData, isLoading } = useQuery<{
    messages: (ChatMessage & { isMe?: boolean })[];
    currentUserId?: string;
  }>({
    queryKey: ["chat", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/chat/${taskId}`);
      if (!res.ok) throw new Error("Gagal memuat pesan chat");
      const json = await res.json();
      if (Array.isArray(json)) {
        return { messages: json, currentUserId: undefined };
      }
      return {
        messages: (json.messages || []) as (ChatMessage & { isMe?: boolean })[],
        currentUserId: json.currentUser?.id,
      };
    },
    enabled: isOpen && !!taskId,
    refetchInterval: 3000, // Poll every 3 seconds for live chat feel
  });

  const messages = useMemo(() => chatData?.messages || [], [chatData?.messages]);
  const currentUserId = chatData?.currentUserId || activeUserData?.id;

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`/api/chat/${taskId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengirim pesan");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData<
        | { messages: (ChatMessage & { isMe?: boolean })[]; currentUserId?: string }
        | (ChatMessage & { isMe?: boolean })[]
      >(["chat", taskId], (old) => {
        const newMsg = data.message ? { ...data.message, isMe: true } : data;
        if (!old) return { messages: [newMsg], currentUserId };
        if (Array.isArray(old)) return [...old, newMsg];
        return {
          ...old,
          messages: [...(old.messages || []), newMsg],
        };
      });
      setInputText("");
    },
  });

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (text: string) => {
    if (!text.trim() || sendMutation.isPending) return;
    sendMutation.mutate(text);
  };

  const quickReplies = [
    "Saya sudah di lokasi",
    "Pekerjaan sudah selesai, mohon dicek",
    "Bisa tolong bagikan patokan alamat?",
    "Siap, saya sedang menuju ke sana",
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-end bg-dark/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-gray-border animate-slide-up sm:animate-fade-in">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-border flex items-center justify-between bg-light/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-dark truncate max-w-[210px]">
                {taskTitle}
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] text-success font-semibold">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                <span>{otherPartyName || "Terhubung"} • Koordinasi Langsung</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-border/30 flex items-center justify-center text-gray hover:text-dark transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Summary Banner */}
        <div className="bg-primary-light/50 px-4 py-2 border-b border-primary/20 flex items-center justify-between text-xs">
          <span className="text-dark font-medium truncate max-w-[230px]">
            {taskTitle}
          </span>
          {taskBudget && (
            <span className="font-bold text-primary">
              Rp {taskBudget.toLocaleString("id-ID")}
            </span>
          )}
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-light/30">
          <div className="text-center my-2">
            <span className="text-[10px] bg-white px-3 py-1 rounded-full text-gray border border-gray-border/60 shadow-xs inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-primary" />
              Obrolan resmi NEAR JOB. Jaga etika & privasi.
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-xs text-gray">Memuat percakapan...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray space-y-1">
              <p className="font-medium text-dark">Belum ada percakapan</p>
              <p>Mulai sapa mitra atau pemberi tugas di bawah ini.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe =
                msg.isMe ??
                (currentUserId
                  ? msg.senderId === currentUserId
                  : activeUserData?.role
                    ? msg.senderRole === activeUserData.role
                    : false);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`flex items-center gap-1.5 mb-1 px-1 text-[10px] ${
                      isMe ? "flex-row-reverse text-right" : "flex-row text-left"
                    }`}
                  >
                    <span className="font-bold text-dark">
                      {isMe ? "Anda" : msg.senderName}
                    </span>
                    <span className="text-gray text-[9px]">
                      ({msg.senderRole === "POSTER" ? "Pemberi Tugas" : "Mitra Kerja"})
                    </span>
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                      isMe
                        ? "bg-primary text-white rounded-tr-xs"
                        : "bg-white text-dark border border-gray-border/80 rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    <div
                      className={`text-[9px] mt-1.5 flex items-center gap-1 ${
                        isMe ? "justify-end text-white/80" : "justify-start text-gray"
                      }`}
                    >
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMe && <CheckCheck className="w-3 h-3 text-white/90" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Pills */}
        <div className="px-3 pt-2 pb-1 bg-white border-t border-gray-border/50 flex items-center gap-1.5 overflow-x-auto">
          {quickReplies.map((pill) => (
            <button
              key={pill}
              onClick={() => handleSend(pill)}
              disabled={sendMutation.isPending}
              className="text-[11px] font-medium text-dark-soft bg-light hover:bg-primary-light hover:text-primary px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border border-gray-border/60 shrink-0"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="p-3 bg-white border-t border-gray-border flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={
              activeUserData?.role === "WORKER"
                ? "Tulis pesan ke pemesan tugas..."
                : "Tulis pesan ke mitra kerja..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs rounded-full border border-gray-border focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sendMutation.isPending}
            className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
