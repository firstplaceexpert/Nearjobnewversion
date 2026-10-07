"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import {
  ArrowLeft,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  User,
  Bike,
  Sparkles,
  MessageSquare,
  Copy,
} from "lucide-react";

type RoleType = "POSTER" | "WORKER";
type StepType = "INPUT_PHONE" | "INPUT_OTP" | "SUCCESS";

export default function RegisterPage() {
  const router = useRouter();

  // Form State
  const [role, setRole] = useState<RoleType>("POSTER");
  const [name, setName] = useState("Rois hadi");
  const [phone, setPhone] = useState("081327446342");
  const [step, setStep] = useState<StepType>("INPUT_PHONE");

  // OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [normalizedPhone, setNormalizedPhone] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(60);
  const canResend = countdown === 0;

  // Status State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [whatsappToast, setWhatsappToast] = useState<string | null>(null);

  // Input Refs for 4-digit auto-focus
  const inputRef0 = useRef<HTMLInputElement>(null);
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const inputRef3 = useRef<HTMLInputElement>(null);
  const inputRefs = [inputRef0, inputRef1, inputRef2, inputRef3];

  // Resend Countdown Timer
  useEffect(() => {
    if (step !== "INPUT_OTP" || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Auto focus first OTP input when reaching step 2
  useEffect(() => {
    if (step === "INPUT_OTP") {
      const timer = setTimeout(() => inputRef0.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Handle Step 1: Send OTP via WhatsApp
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phone.replace(/\D/g, "");
    if (!name.trim()) {
      setErrorMessage("Silakan isi nama lengkap Anda.");
      return;
    }
    if (cleanPhone.length < 9) {
      setErrorMessage("Nomor WhatsApp tidak valid. Masukkan minimal 9 digit angka.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone, role }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Gagal mengirimkan kode OTP.");
      }

      setGeneratedOtp(data.debugOtp);
      setNormalizedPhone(data.phone);
      setCountdown(60);
      setOtpDigits(["", "", "", ""]);
      setStep("INPUT_OTP");

      // Simulated WhatsApp push notification banner
      setWhatsappToast(
        `💬 WhatsApp • Pesan dari NEAR JOB: Kode OTP Anda adalah [ ${data.debugOtp} ]. Berlaku 5 menit.`,
      );
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Digit Change with auto-advance
  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setErrorMessage(null);

    // Auto-focus next input
    if (char && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit if all 4 digits entered
    if (char && index === 3 && newDigits.every((d) => d !== "")) {
      verifyCode(newDigits.join(""));
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Handle Paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;

    const newDigits = ["", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);

    if (pasted.length === 4) {
      inputRefs[3].current?.focus();
      verifyCode(pasted);
    } else {
      inputRefs[Math.min(pasted.length, 3)].current?.focus();
    }
  };

  // One-click Auto-Fill simulated OTP
  const handleQuickFill = () => {
    if (!generatedOtp) return;
    const digits = generatedOtp.split("").slice(0, 4);
    setOtpDigits(digits);
    verifyCode(generatedOtp);
  };

  // Verify OTP Code
  const verifyCode = async (codeToVerify: string) => {
    if (codeToVerify.length < 4) {
      setErrorMessage("Masukkan 4 digit kode OTP secara lengkap.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizedPhone || phone,
          code: codeToVerify,
          name,
          role,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Verifikasi kode OTP gagal.");
      }

      setStep("SUCCESS");

      // Redirect after pleasant success animation
      setTimeout(() => {
        router.push(data.redirectTo || (role === "POSTER" ? "/" : "/mitra"));
      }, 1200);
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5 px-4 py-6 sm:py-10">
      {/* WhatsApp Simulated Toast Banner */}
      {whatsappToast && step === "INPUT_OTP" && (
        <div className="bg-[#25D366]/10 border border-[#25D366]/30 text-slate-800 p-3.5 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2 space-y-2">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>Notifikasi WhatsApp</span>
                <span className="text-[10px] font-normal text-slate-500">Baru saja</span>
              </p>
              <p className="text-slate-700 font-medium mt-0.5 leading-snug">
                {whatsappToast}
              </p>
            </div>
          </div>

          {generatedOtp && (
            <div className="pt-1 flex items-center justify-end">
              <button
                type="button"
                onClick={handleQuickFill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Isi Otomatis ({generatedOtp})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Card Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-7 space-y-5">
        {/* STEP 1: INPUT PHONE & NAME */}
        {step === "INPUT_PHONE" && (
          <div className="space-y-5">
            {/* Logo & Header */}
            <div className="text-center space-y-1.5">
              <div className="flex justify-center mb-1">
                <Logo size="md" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Daftar Akun Baru
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Verifikasi cepat via kode OTP WhatsApp tanpa ribet password
              </p>
            </div>

            {/* Role Selector Tabs (Gojek / Consumer vs Worker) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Pilih Tipe Akun Anda
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole("POSTER")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    role === "POSTER"
                      ? "border-[#00880D] bg-[#00880D]/5 ring-2 ring-[#00880D]/20 shadow-xs"
                      : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/60 text-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                        role === "POSTER"
                          ? "bg-[#00880D] text-white shadow-xs"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      <User className="w-4 h-4" />
                    </div>
                    {role === "POSTER" && (
                      <span className="w-2 h-2 rounded-full bg-[#00880D]"></span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-black block text-slate-900 leading-tight">
                      Konsumen
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      Pesan bantuan & cari pekerja
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("WORKER")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    role === "WORKER"
                      ? "border-[#1867F8] bg-[#1867F8]/5 ring-2 ring-[#1867F8]/20 shadow-xs"
                      : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/60 text-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                        role === "WORKER"
                          ? "bg-[#1867F8] text-white shadow-xs"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                    </div>
                    {role === "WORKER" && (
                      <span className="w-2 h-2 rounded-full bg-[#1867F8]"></span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-black block text-slate-900 leading-tight">
                      Mitra Kerja
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      Lamar tugas & cari penghasilan
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-bold">
                {errorMessage}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rois hadi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00880D] focus:ring-2 focus:ring-[#00880D]/20 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* WhatsApp Phone Number */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nomor WhatsApp / HP
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:border-[#00880D] focus-within:ring-2 focus-within:ring-[#00880D]/20 transition-all">
                  <div className="bg-slate-100 px-3 py-2.5 border-r border-slate-200 flex items-center gap-1.5 select-none shrink-0">
                    <span className="text-sm">🇮🇩</span>
                    <span className="text-xs font-bold text-slate-700">+62</span>
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="813-2744-6342"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00880D]" />
                  <span>Kode 4-digit OTP akan dikirim via WhatsApp</span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-black text-xs text-white bg-[#00880D] hover:bg-[#00700B] active:scale-98 transition-all shadow-md shadow-[#00880D]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengirim Kode OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Lanjut & Kirim Kode OTP</span>
                    <span>&rarr;</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: INPUT 4-DIGIT OTP */}
        {step === "INPUT_OTP" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-3">
            {/* Top Back Navigation */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => {
                  setStep("INPUT_PHONE");
                  setErrorMessage(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ubah Nomor HP</span>
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00880D] bg-[#00880D]/10 px-2 py-0.5 rounded-full">
                Langkah 2 / 2
              </span>
            </div>

            {/* Instruction Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#00880D]/10 text-[#00880D] flex items-center justify-center mx-auto mb-2">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Masukkan Kode OTP
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Kode 4-digit telah dikirimkan ke WhatsApp:
              </p>
              <p className="text-xs font-extrabold text-slate-900 font-mono">
                {normalizedPhone || phone}
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-bold text-center">
                {errorMessage}
              </div>
            )}

            {/* 4-Digit Input Boxes */}
            <div className="flex items-center justify-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otpDigits[idx]}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  className={`w-14 h-16 text-center text-2xl font-black rounded-2xl border-2 text-slate-900 focus:outline-none transition-all shadow-xs ${
                    otpDigits[idx]
                      ? "border-[#00880D] bg-white ring-2 ring-[#00880D]/20"
                      : "border-slate-200 bg-slate-50 focus:border-[#00880D]"
                  }`}
                />
              ))}
            </div>

            {/* Resend OTP Timer & Button */}
            <div className="text-center text-xs space-y-2 pt-1">
              {canResend ? (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={isLoading}
                  className="font-bold text-[#00880D] hover:underline cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Kirim Ulang Kode OTP via WhatsApp</span>
                </button>
              ) : (
                <p className="text-slate-500 font-medium">
                  Kirim ulang kode dalam{" "}
                  <strong className="text-slate-800 font-mono">
                    00:{countdown.toString().padStart(2, "0")}
                  </strong>
                </p>
              )}
            </div>

            {/* Manual Submit Button */}
            <button
              type="button"
              disabled={isLoading || otpDigits.some((d) => d === "")}
              onClick={() => verifyCode(otpDigits.join(""))}
              className="w-full py-3 px-4 rounded-xl font-black text-xs text-white bg-[#00880D] hover:bg-[#00700B] active:scale-98 transition-all shadow-md shadow-[#00880D]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Kode...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verifikasi & Aktifkan Akun</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 3: SUCCESS ANIMATION */}
        {step === "SUCCESS" && (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#00880D] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#00880D]/30">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Verifikasi Berhasil!
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Selamat datang, <strong>{name}</strong>! Akun Anda telah aktif dan siap
              digunakan.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#00880D] pt-2">
              <Sparkles className="w-4 h-4" />
              <span>Mengalihkan ke aplikasi...</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Switch to Login */}
      {step !== "SUCCESS" && (
        <p className="text-center text-xs text-slate-500 font-medium">
          Sudah memiliki akun?{" "}
          <Link href="/login" className="font-bold text-[#00880D] hover:underline">
            Masuk di sini
          </Link>
        </p>
      )}
    </div>
  );
}
