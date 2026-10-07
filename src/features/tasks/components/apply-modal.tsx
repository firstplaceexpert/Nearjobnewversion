"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { calculateCommission } from "@/features/payments/services/calculateCommission";
import { X } from "lucide-react";
import type { TaskItem } from "@/features/tasks/types";

interface ApplyModalProps {
  task: TaskItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApplyModal({ task, isOpen, onClose, onSuccess }: ApplyModalProps) {
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const commission = calculateCommission(task.budget);

  const applyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks/${task.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Gagal mengirim lamaran");
      }
      return data;
    },
    onMutate: async () => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: ["task", task.id] });
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Optimistically update
      queryClient.setQueryData(["task", task.id], (old: TaskItem | undefined) => {
        if (!old) return old;
        return {
          ...old,
          hasApplied: true,
          applicationsCount: (old.applicationsCount || 0) + 1,
        };
      });
    },
    onError: (err: Error) => {
      setErrorMsg(err.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", task.id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["workerDashboard"] });
      if (onSuccess) onSuccess();
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-light">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
              Konfirmasi Lamaran Pekerjaan
            </span>
            <h3 className="font-bold text-dark text-base sm:text-lg line-clamp-1 mt-0.5">
              {task.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray hover:text-dark rounded-lg hover:bg-light transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-error-light text-error text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Quick Details */}
          <div className="bg-light/60 p-3.5 rounded-xl space-y-1.5 text-xs text-gray">
            <div className="flex justify-between">
              <span>Lokasi:</span>
              <span className="font-medium text-dark">{task.location}</span>
            </div>
            <div className="flex justify-between">
              <span>Jadwal:</span>
              <span className="font-medium text-dark">
                {task.scheduleDate} ({task.scheduleTime})
              </span>
            </div>
          </div>

          {/* Transparent Commission Breakdown Box */}
          <div className="border border-primary-light bg-primary-light/15 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray">Imbalan yang Ditawarkan Poster:</span>
              <span className="font-semibold text-dark">
                {formatRupiah(commission.budget)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray flex items-center gap-1">
                Komisi Platform ({Math.round(commission.commissionRate * 100)}%):
                <Badge variant="primary" size="sm">
                  Tarif Flat 10%
                </Badge>
              </span>
              <span className="font-medium text-error">
                - {formatRupiah(commission.commissionAmount)}
              </span>
            </div>

            <div className="pt-2 border-t border-primary-light/60 flex items-center justify-between">
              <span className="font-bold text-xs text-dark">
                Estimasi Penghasilan Bersih Worker:
              </span>
              <span className="font-extrabold text-base text-success">
                {formatRupiah(commission.netAmount)}
              </span>
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-dark">
              Catatan / Pengantar Singkat (Opsional):
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Perkenalkan dirimu singkat, pengalaman relevan, atau konfirmasi ketersediaan..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-dark bg-light border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all placeholder:text-gray-light"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-light/40 border-t border-light flex items-center justify-end gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={applyMutation.isPending}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => applyMutation.mutate()}
            loading={applyMutation.isPending}
            disabled={applyMutation.isPending}
          >
            {applyMutation.isPending ? "Mengirim..." : "Kirim Lamaran Sekarang"}
          </Button>
        </div>
      </div>
    </div>
  );
}
