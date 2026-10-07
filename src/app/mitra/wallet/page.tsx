"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WalletSummary } from "@/features/tasks/types";

export default function MitraWalletPage() {
  const queryClient = useQueryClient();
  const [withdrawAmount, setWithdrawAmount] = useState("100000");
  const [bank, setBank] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("123-456-7890");
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);
  const [withdrawErrorMsg, setWithdrawErrorMsg] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["mitraDashboard"],
    queryFn: async () => {
      const res = await fetch("/api/mitra/dashboard");
      const json = await res.json();
      return json.data;
    },
  });

  const wallet: WalletSummary = data?.wallet || {
    balance: 820000,
    pendingBalance: 0,
    transactions: [],
  };

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const numAmount = Number(withdrawAmount);
      const res = await fetch("/api/mitra/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          bank,
          accountNumber,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      setWithdrawSuccessMsg(
        `Penarikan dana Rp ${Number(withdrawAmount).toLocaleString(
          "id-ID",
        )} ke rekening ${bank} (${accountNumber}) berhasil diproses!`,
      );
      setWithdrawErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ["mitraDashboard"] });
    },
    onError: (err: Error) => {
      setWithdrawErrorMsg(err.message);
      setWithdrawSuccessMsg(null);
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-dark tracking-tight">
          Dompet & Penghasilan Mitra
        </h1>
        <p className="text-xs text-gray mt-1">
          Kelola saldo penghasilan bersih dari pekerjaan yang telah Anda selesaikan.
        </p>
      </div>

      {/* Balance Big Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 bg-gradient-to-br from-primary to-primary-hover text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-primary/20">
          <div className="flex flex-col justify-between h-full space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary-light" />
                <span className="text-xs font-bold text-primary-light uppercase tracking-wider">
                  Saldo Siap Ditarik (NearPay Mitra)
                </span>
              </div>
              <Badge variant="success" size="sm">
                Aktif & Terverifikasi
              </Badge>
            </div>

            <div>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                Rp {wallet.balance.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-primary-light mt-1">
                Bebas biaya admin penarikan ke semua bank & e-wallet terdaftar.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs pt-2 border-t border-white/20">
              <div>
                <span className="text-primary-light block text-[11px]">
                  Penghasilan Tertahan
                </span>
                <span className="font-bold text-sm">
                  Rp {wallet.pendingBalance?.toLocaleString("id-ID") || "0"}
                </span>
              </div>
              <div className="border-l border-white/20 pl-4">
                <span className="text-primary-light block text-[11px]">
                  Metode Pencairan Utama
                </span>
                <span className="font-bold text-sm">BCA ••••• 7890</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Withdrawal Quick Form Card */}
        <Card className="p-6 rounded-3xl border border-gray-border/80 shadow-xs flex flex-col justify-between">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              withdrawMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-primary" />
              <h3 className="font-extrabold text-dark text-base">Tarik Saldo</h3>
            </div>

            {withdrawSuccessMsg && (
              <div className="p-3 rounded-xl bg-success-light text-success text-xs font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{withdrawSuccessMsg}</span>
              </div>
            )}

            {withdrawErrorMsg && (
              <div className="p-3 rounded-xl bg-error-light text-error text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{withdrawErrorMsg}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-dark block mb-1">
                Nominal Penarikan (Rp)
              </label>
              <input
                type="number"
                min="2000"
                step="1"
                max={wallet.balance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-border text-sm font-bold text-dark focus:outline-none focus:border-primary"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Minimal penarikan Rp 2.000. Bebas nominal (tidak harus kelipatan).
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-dark block mb-1">
                Bank / E-Wallet
              </label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-border text-xs font-semibold focus:outline-none focus:border-primary"
              >
                <option value="BCA">BCA (Bank Central Asia)</option>
                <option value="Mandiri">Bank Mandiri</option>
                <option value="BRI">Bank BRI</option>
                <option value="GoPay">GoPay (Instan)</option>
                <option value="OVO">OVO Cash</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-dark block mb-1">
                Nomor Rekening / No. HP
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="123-456-7890"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-border text-xs font-mono font-bold text-dark focus:outline-none focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center font-bold text-xs shadow-md shadow-primary/20"
              loading={withdrawMutation.isPending}
              disabled={withdrawMutation.isPending || wallet.balance < 2000}
            >
              Kirim ke Rekening &rarr;
            </Button>
          </form>
        </Card>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-4 pt-2">
        <h3 className="font-extrabold text-dark text-lg">Mutasi Saldo Dompet</h3>

        {wallet.transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-gray border border-gray-border">
            Belum ada mutasi transaksi di dompet ini.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-border overflow-hidden divide-y divide-light shadow-xs">
            {wallet.transactions.map((tx) => {
              const isIncome = tx.type === "RECEIVE" || tx.type === "TOPUP";
              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-light/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                        isIncome
                          ? "bg-success-light text-success"
                          : "bg-error-light text-error"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-dark">
                        {tx.description}
                      </p>
                      <span className="text-[11px] text-gray">
                        {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-extrabold ${
                        isIncome ? "text-success" : "text-error"
                      }`}
                    >
                      {isIncome ? "+" : "-"} Rp {tx.amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
