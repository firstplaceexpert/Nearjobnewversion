"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation, User, CheckCircle2, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MitraIncomingOrder } from "@/features/tasks/types";

interface IncomingOrderModalProps {
  order: MitraIncomingOrder | null;
  onAccept: (taskId: string) => void;
  onDismiss: () => void;
  isAccepting?: boolean;
}

export function IncomingOrderModal({
  order,
  onAccept,
  onDismiss,
  isAccepting = false,
}: IncomingOrderModalProps) {
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (!order) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order, onDismiss]);

  if (!order) return null;

  const progressPercentage = (timeLeft / 20) * 100;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-[#2F2B4F]/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-primary overflow-hidden relative animate-scale-in my-auto max-h-[92vh] flex flex-col">
        {/* Countdown Progress Bar */}
        <div className="w-full bg-light h-2 shrink-0">
          <div
            className="bg-primary h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Radar Ring Header */}
        <div className="p-4 sm:p-5 pb-3 bg-gradient-to-b from-primary/10 to-transparent flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-primary/20 animate-ping"></span>
              <div className="w-9 h-9 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md">
                <Navigation className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-[11px] font-extrabold text-primary uppercase tracking-wider block">
                Orderan Masuk ({timeLeft}s)
              </span>
              <h3 className="text-base font-extrabold text-dark line-clamp-1">
                {order.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-gray hover:text-dark p-1.5 rounded-full hover:bg-light transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Details (Scrollable if height exceeds mobile viewport) */}
        <div className="p-4 sm:p-5 pt-2 space-y-3.5 overflow-y-auto flex-1">
          {/* Earnings Highlight Box */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-primary-light/50 border border-primary/20 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray block">
                Penghasilan Bersih (Net)
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-primary">
                Rp {order.netEarnings.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray uppercase block">
                Jarak Jemput
              </span>
              <span className="text-sm font-bold text-dark flex items-center justify-end gap-1">
                <Navigation className="w-3.5 h-3.5 text-primary" />
                {order.distanceKm} km
              </span>
            </div>
          </div>

          {/* Customer & Route Details */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                Pemesan: <strong className="text-dark">{order.customerName}</strong>
              </span>
              <span className="font-semibold text-amber-500 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#FEE49A] text-amber-400" />
                <span>{order.customerRating}</span>
              </span>
            </div>

            <div className="p-3 bg-light rounded-xl space-y-1 border border-gray-border/60">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-gray uppercase font-bold block">
                    Lokasi Penjemputan / Kerja
                  </span>
                  <p className="font-bold text-dark text-xs">{order.pickupLocation}</p>
                </div>
              </div>
            </div>

            {order.notes && (
              <p className="text-[11px] text-gray italic bg-light/50 p-2.5 rounded-lg border border-gray-border/40">
                &ldquo;{order.notes}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons (Sticky at bottom of modal) */}
        <div className="p-4 pt-2 bg-white border-t border-light/60 space-y-2 shrink-0">
          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center font-extrabold text-sm py-3.5 shadow-lg shadow-primary/25 flex items-center gap-2"
            onClick={() => onAccept(order.taskId)}
            loading={isAccepting}
            disabled={isAccepting}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>TERIMA ORDER INI ({timeLeft}s)</span>
          </Button>
          <button
            onClick={onDismiss}
            disabled={isAccepting}
            className="w-full text-center py-2 text-xs font-semibold text-gray hover:text-dark transition-colors"
          >
            Lewati Orderan Ini
          </button>
        </div>
      </div>
    </div>
  );
}
