"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import type { WalletSummary } from "@/features/tasks/types";

interface WalletBarProps {
  variant?: "pill" | "gopay-card";
}

export function WalletBar({ variant = "pill" }: WalletBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: wallet, isLoading } = useQuery<WalletSummary>({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res = await fetch("/api/wallet");
      if (!res.ok) throw new Error("Gagal mengambil data saldo");
      return res.json();
    },
    refetchInterval: 15000,
  });

  const topUpMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal melakukan top up");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["wallet"], data.wallet);
      setSuccessToast("Top up saldo NearPay berhasil!");
      setCustomAmount("");
      setTimeout(() => setSuccessToast(null), 3000);
    },
  });

  const handleQuickTopUp = (amount: number) => {
    topUpMutation.mutate(amount);
  };

  const handleCustomTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(customAmount.replace(/\D/g, ""));
    if (val >= 2000) {
      topUpMutation.mutate(val);
    }
  };

  const balance = wallet?.balance ?? 500000;

  return (
    <>
      {variant === "gopay-card" ? (
        /* NearJob-style Horizontal Floating Wallet Card */
        <div className="bg-white rounded-3xl border border-gray-border/80 p-3.5 sm:p-5 shadow-xs flex items-center justify-between gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 sm:gap-3 text-left group min-w-0 flex-1 cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shrink-0 shadow-xs">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-lg font-black text-dark group-hover:text-primary transition-colors block leading-tight truncate">
                {isLoading ? "..." : `Rp ${balance.toLocaleString("id-ID")}`}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block leading-tight truncate mt-0.5">
                NearPay • Saldo Aman Escrow
              </span>
            </div>
          </button>

          <div className="flex items-start gap-1 sm:gap-5 shrink-0">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex flex-col items-center gap-1 group w-11 sm:w-14 cursor-pointer shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center group-hover:bg-primary-hover transition-all shadow-xs group-hover:scale-105">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 whitespace-nowrap text-center block leading-tight">
                Bayar
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex flex-col items-center gap-1 group w-11 sm:w-14 cursor-pointer shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center group-hover:bg-primary-hover transition-all shadow-xs group-hover:scale-105">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 whitespace-nowrap text-center block leading-tight">
                Isi Saldo
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex flex-col items-center gap-1 group w-11 sm:w-14 cursor-pointer shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center group-hover:bg-primary-hover transition-all shadow-xs group-hover:scale-105">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 whitespace-nowrap text-center block leading-tight">
                Jaminan
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Compact Pill Widget */
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-light hover:bg-gray-border/30 border border-gray-border/60 transition-all text-left group"
          title="Buka Dompet NearPay"
        >
          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray tracking-wider">
              NearPay
            </span>
            <span className="text-xs font-bold text-dark group-hover:text-primary transition-colors">
              {isLoading ? "..." : `Rp ${balance.toLocaleString("id-ID")}`}
            </span>
          </div>
          <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center ml-1 group-hover:scale-110 transition-transform">
            <Plus className="w-3 h-3" />
          </div>
        </button>
      )}

      {/* Top Up & Wallet Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-border space-y-5 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-light">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark">Dompet NearPay</h3>
                  <p className="text-xs text-gray">Sistem Pembayaran Aman Escrow</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-light flex items-center justify-center text-gray hover:text-dark transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success Toast Banner */}
            {successToast && (
              <div className="p-3 bg-success-light text-success border border-success/30 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-slide-up">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successToast}</span>
              </div>
            )}

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-1">
                <span className="text-xs font-medium text-white/80">
                  Saldo Aktif Anda
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Rp {balance.toLocaleString("id-ID")}
                </h2>
                <div className="pt-2 flex items-center gap-1.5 text-[11px] text-white/90">
                  <ShieldCheck className="w-3.5 h-3.5 text-warning" />
                  <span>Garansi dana tersimpan aman hingga tugas tuntas</span>
                </div>
              </div>
            </div>

            {/* Quick Top Up Options */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-dark">Isi Saldo Cepat</label>
              <div className="grid grid-cols-2 gap-2">
                {[50000, 100000, 250000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={topUpMutation.isPending}
                    onClick={() => handleQuickTopUp(amt)}
                    className="p-3 rounded-2xl border border-gray-border hover:border-primary hover:bg-primary-light/40 transition-all text-center font-bold text-xs text-dark disabled:opacity-50"
                  >
                    + Rp {amt.toLocaleString("id-ID")}
                  </button>
                ))}
              </div>

              {/* Custom Amount Form */}
              <form onSubmit={handleCustomTopUp} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Nominal lain (min. 2.000)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-border focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={topUpMutation.isPending}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-sm"
                >
                  {topUpMutation.isPending ? "..." : "Top Up"}
                </button>
              </form>
            </div>

            {/* Transaction History snippet */}
            {wallet?.transactions && wallet.transactions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-light">
                <span className="text-xs font-bold text-dark">Aktivitas Terakhir</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {wallet.transactions.slice(0, 4).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-light/70"
                    >
                      <div className="flex items-center gap-2">
                        {tx.type === "TOPUP" || tx.type === "RECEIVE" ? (
                          <div className="w-5 h-5 rounded-full bg-success-light text-success flex items-center justify-center">
                            <ArrowDownLeft className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-error-light text-error flex items-center justify-center">
                            <ArrowUpRight className="w-3 h-3" />
                          </div>
                        )}
                        <span className="text-[11px] font-medium text-dark truncate max-w-[190px]">
                          {tx.description}
                        </span>
                      </div>
                      <span
                        className={`font-bold text-[11px] ${
                          tx.type === "TOPUP" || tx.type === "RECEIVE"
                            ? "text-success"
                            : "text-error"
                        }`}
                      >
                        {tx.type === "TOPUP" || tx.type === "RECEIVE" ? "+" : "-"}Rp{" "}
                        {tx.amount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
