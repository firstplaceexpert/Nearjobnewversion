"use client";

import { useState, useMemo } from "react";
import { Tag, Check, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { AVAILABLE_VOUCHERS, applyVoucher } from "@/lib/vouchers";

interface VoucherSelectorProps {
  budget: number;
  appliedCode?: string;
  onApply: (voucher: {
    code: string;
    discountAmount: number;
    finalPaidAmount: number;
  }) => void;
  onRemove: () => void;
  className?: string;
}

export function VoucherSelector({
  budget,
  appliedCode = "",
  onApply,
  onRemove,
  className = "",
}: VoucherSelectorProps) {
  const [inputCode, setInputCode] = useState(appliedCode);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const activeVoucher = useMemo(() => {
    if (!appliedCode) return null;
    return (
      AVAILABLE_VOUCHERS.find(
        (v) => v.code.toUpperCase() === appliedCode.toUpperCase(),
      ) || null
    );
  }, [appliedCode]);

  const handleApply = (codeToApply: string) => {
    setErrorMsg("");
    if (!codeToApply.trim()) {
      setErrorMsg("Ketik kode voucher terlebih dahulu.");
      return;
    }

    const res = applyVoucher(codeToApply, budget);
    if (!res.isValid || !res.voucher) {
      setErrorMsg(res.error || "Kode voucher tidak valid.");
      return;
    }

    setInputCode(res.voucher.code);
    setErrorMsg("");
    setIsOpen(false);
    onApply({
      code: res.voucher.code,
      discountAmount: res.discountAmount,
      finalPaidAmount: res.finalPaidAmount,
    });
  };

  const handleRemove = () => {
    setInputCode("");
    setErrorMsg("");
    onRemove();
  };

  // If a voucher is applied
  if (appliedCode && activeVoucher) {
    const res = applyVoucher(appliedCode, budget);
    return (
      <div
        className={`p-3 rounded-2xl bg-secondary-light border border-secondary/30 flex items-center justify-between gap-3 text-xs ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-secondary-hover text-white flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-secondary-deep truncate">
                {activeVoucher.title}
              </span>
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-secondary-light text-secondary-deep border border-secondary/30">
                {activeVoucher.code}
              </span>
            </div>
            <p className="text-[11px] text-secondary-deep font-semibold mt-0.5">
              Hemat Rp {res.discountAmount.toLocaleString("id-ID")} berhasil dipotong dari
              total bayar!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRemove}
          className="text-[11px] font-bold text-slate-500 hover:text-error-hover bg-white hover:bg-error-light px-2.5 py-1 rounded-lg border border-slate-200 transition-all shrink-0"
        >
          Hapus
        </button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-gray-border bg-white overflow-hidden transition-all ${className}`}
    >
      {/* Header Accordion Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-dark block">
              Punya Voucher Diskon?
            </span>
            <span className="text-[10px] text-slate-400">
              Gunakan kupon promo untuk hemat biaya layanan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
          <span className="text-[11px]">Klaim / Pasang</span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-3 pt-1 border-t border-slate-100 space-y-3 bg-slate-50/50">
          {/* Custom Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.toUpperCase());
                setErrorMsg("");
              }}
              placeholder="Ketik kode promo (misal: NEARBARU)..."
              className="flex-1 px-3 py-2 bg-white rounded-xl border border-gray-border text-xs font-mono font-bold uppercase placeholder:font-sans placeholder:normal-case focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => handleApply(inputCode)}
              className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors shrink-0 shadow-xs"
            >
              Terapkan
            </button>
          </div>

          {errorMsg && <p className="text-[11px] font-semibold text-error">{errorMsg}</p>}

          {/* Quick Select Voucher Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-warning" />
              Voucher Tersedia untuk Kamu:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_VOUCHERS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleApply(v.code)}
                  className="p-2.5 rounded-xl bg-white hover:bg-primary-light/40 border border-gray-border hover:border-primary text-left transition-all group flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {v.code}
                      </span>
                    </div>
                    <h5 className="text-[11px] font-black text-dark group-hover:text-primary transition-colors truncate mt-1">
                      {v.title}
                    </h5>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {v.desc}
                    </p>
                  </div>

                  <span className="text-[10px] font-bold text-primary shrink-0 self-center group-hover:translate-x-0.5 transition-transform">
                    Pakai &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
