"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  MessageSquare,
  Navigation,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatDrawer } from "@/features/chat/components/chat-drawer";
import type { MitraActiveOrder } from "@/features/tasks/types";

interface ActiveJobTrackerProps {
  order: MitraActiveOrder;
  onUpdateStatus: (step: "OTW" | "ARRIVED" | "WORKING" | "COMPLETED") => void;
  isUpdating?: boolean;
}

export function ActiveJobTracker({
  order,
  onUpdateStatus,
  isUpdating = false,
}: ActiveJobTrackerProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const getStepConfig = () => {
    switch (order.step) {
      case "OTW":
        return {
          title: "Menuju ke Lokasi Pelanggan",
          description:
            "Segera arahkan kendaraan / perjalanan Anda ke alamat penjemputan.",
          nextStep: "ARRIVED" as const,
          actionLabel: "Saya Sudah Tiba di Lokasi",
          progressIndex: 1,
        };
      case "ARRIVED":
        return {
          title: "Sudah Tiba di Lokasi",
          description: "Temui pelanggan atau ambil barang / mulai instruksi kerja.",
          nextStep: "WORKING" as const,
          actionLabel: "Mulai Kerjakan Tugas",
          progressIndex: 2,
        };
      case "WORKING":
        return {
          title: "Sedang Mengerjakan Tugas",
          description:
            "Kerjakan sesuai jobdesk. Setelah tuntas, konfirmasi penyelesaian.",
          nextStep: "COMPLETED" as const,
          actionLabel: "Selesaikan Tugas & Ambil Saldo",
          progressIndex: 3,
        };
      default:
        return {
          title: "Tugas Selesai",
          description: "Penghasilan telah masuk ke dompet Mitra Anda.",
          nextStep: "COMPLETED" as const,
          actionLabel: "Selesai",
          progressIndex: 4,
        };
    }
  };

  const stepConfig = getStepConfig();

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-primary/40 shadow-lg space-y-5">
      {/* Header status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-light">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/20">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-primary uppercase tracking-wider block">
              Tugas Aktif Berjalan
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-dark">
              {order.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-gray">Upah Bersih:</span>
          <span className="text-lg font-black text-success">
            Rp {order.netEarnings.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Step Progress Bar (Ala Gojek Driver) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className={stepConfig.progressIndex >= 1 ? "text-primary" : "text-gray"}>
            1. Menuju Lokasi
          </span>
          <span className={stepConfig.progressIndex >= 2 ? "text-primary" : "text-gray"}>
            2. Tiba
          </span>
          <span className={stepConfig.progressIndex >= 3 ? "text-primary" : "text-gray"}>
            3. Dikerjakan
          </span>
          <span className={stepConfig.progressIndex >= 4 ? "text-primary" : "text-gray"}>
            4. Selesai
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 h-2">
          <div
            className={`rounded-full ${
              stepConfig.progressIndex >= 1 ? "bg-primary" : "bg-light"
            }`}
          />
          <div
            className={`rounded-full ${
              stepConfig.progressIndex >= 2 ? "bg-primary" : "bg-light"
            }`}
          />
          <div
            className={`rounded-full ${
              stepConfig.progressIndex >= 3 ? "bg-primary" : "bg-light"
            }`}
          />
        </div>
      </div>

      {/* Current Step Instruction Banner */}
      <div className="p-4 rounded-2xl bg-primary-light/40 border border-primary/20 flex items-start gap-3">
        <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs sm:text-sm font-extrabold text-dark">
            {stepConfig.title}
          </h4>
          <p className="text-xs text-gray mt-0.5">{stepConfig.description}</p>
        </div>
      </div>

      {/* Customer Contact Card */}
      <div className="p-4 rounded-2xl bg-light border border-gray-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] text-gray uppercase font-bold block">
            Pemesan Tugas
          </span>
          <p className="font-extrabold text-sm text-dark">{order.customerName}</p>
          <div className="flex items-center gap-1.5 text-xs text-gray">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium text-dark-soft truncate max-w-xs">
              {order.location}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold"
          >
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            <span>Chat Pemesan</span>
          </Button>
          <a
            href={`tel:${order.customerPhone}`}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-gray-border hover:bg-light text-xs font-bold text-dark transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-success" />
            <span>Telepon</span>
          </a>
        </div>
      </div>

      {/* Primary Action to advance status */}
      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          className="w-full justify-center font-extrabold text-sm py-3.5 shadow-md shadow-primary/20 flex items-center gap-2"
          onClick={() => onUpdateStatus(stepConfig.nextStep)}
          loading={isUpdating}
          disabled={isUpdating}
        >
          <span>{stepConfig.actionLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Slide-over Chat Drawer */}
      {isChatOpen && (
        <ChatDrawer
          taskId={order.taskId}
          taskTitle={order.title}
          taskBudget={order.budget}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}
