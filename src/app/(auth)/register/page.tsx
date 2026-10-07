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
  Camera,
  UploadCloud,
  FileCheck,
  X,
  AlertCircle,
  Eye,
} from "lucide-react";

type RoleType = "POSTER" | "WORKER";
type StepType = "INPUT_PHONE" | "INPUT_OTP" | "SUCCESS";

export default function RegisterPage() {
  const router = useRouter();

  // Unified Registration Form State
  const [role, setRole] = useState<RoleType>("POSTER");
  const [name, setName] = useState("Rois hadi");
  const [phone, setPhone] = useState("081327446342");
  const [step, setStep] = useState<StepType>("INPUT_PHONE");

  // Mitra KTP Selfie Verification State
  const [ktpImage, setKtpImage] = useState<string | null>(null);
  const [ktpFileName, setKtpFileName] = useState<string>("");
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle File Upload for KTP Selfie
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Format file harus berupa gambar (JPG, PNG, atau WEBP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage("Ukuran foto maksimal 8 MB.");
      return;
    }

    setKtpFileName(file.name);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = () => {
      setKtpImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Quick Demo KTP Picture for instant reviewer testing
  const handleUseDemoKtp = () => {
    setKtpImage(
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",
    );
    setKtpFileName("selfie_ktp_rois_terverifikasi.jpg");
    setErrorMessage(null);
  };

  // Remove uploaded KTP photo
  const handleRemoveKtp = () => {
    setKtpImage(null);
    setKtpFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

    // MANDATORY KTP VALIDATION FOR MITRA WORKERS
    if (role === "WORKER" && !ktpImage) {
      setErrorMessage(
        "Khusus pendaftaran Mitra Kerja, Anda wajib mengunggah foto selfie memegang KTP untuk verifikasi identitas resmi.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          role,
          ktpImage: role === "WORKER" ? ktpImage : null,
        }),
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
          ktpImage: role === "WORKER" ? ktpImage : null,
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
      }, 1300);
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
        {/* STEP 1: UNIFIED REGISTRATION (KONSUMEN VS MITRA + KTP SELFIE) */}
        {step === "INPUT_PHONE" && (
          <div className="space-y-5">
            {/* Logo & Header */}
            <div className="text-center space-y-1.5">
              <div className="flex justify-center mb-1">
                <Logo size="md" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Pendaftaran Akun
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Satu pendaftaran praktis dengan verifikasi kode OTP WhatsApp
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Daftar Sebagai Apa?
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Option 1: Konsumen */}
                <button
                  type="button"
                  onClick={() => {
                    setRole("POSTER");
                    setErrorMessage(null);
                  }}
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

                {/* Option 2: Mitra Kerja (+ Wajib KTP) */}
                <button
                  type="button"
                  onClick={() => {
                    setRole("WORKER");
                    setErrorMessage(null);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative ${
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
                    <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                      Wajib KTP
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-black block text-slate-900 leading-tight">
                      Mitra Kerja
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      Ambil tugas & cari penghasilan
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rois hadi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00880D] focus:ring-2 focus:ring-[#00880D]/20 transition-all placeholder:text-slate-400"
                />
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
              </div>

              {/* SPECIAL SECTION FOR MITRA: UPLOAD FOTO DIRI BESERTA KTP */}
              {role === "WORKER" && (
                <div className="pt-2 border-t border-slate-100 space-y-2.5 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#1867F8]" />
                      <span>Upload Foto Diri Bersama KTP</span>
                    </label>
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Wajib untuk Mitra
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug">
                    Pegang KTP di samping wajah. Pastikan wajah dan tulisan NIK / nama
                    pada KTP terlihat jelas serta tidak buram.
                  </p>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Upload Box or Preview */}
                  {!ktpImage ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#1867F8] bg-slate-50/50 hover:bg-slate-100/50 transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-[#1867F8]/10 text-[#1867F8] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            Pilih Foto / Ambil Kamera
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            JPG, PNG, atau WEBP (Maksimal 8 MB)
                          </span>
                        </div>
                      </button>

                      {/* Instant Testing Helper Button */}
                      <button
                        type="button"
                        onClick={handleUseDemoKtp}
                        className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Gunakan Foto Contoh Demo KTP (1-Klik)</span>
                      </button>
                    </div>
                  ) : (
                    /* Uploaded Preview State */
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Image thumbnail */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={ktpImage}
                            alt="Selfie KTP"
                            className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shadow-xs shrink-0 cursor-pointer"
                            onClick={() => setShowPreviewModal(true)}
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-extrabold text-emerald-900 block truncate">
                              Foto KTP Siap Diverifikasi
                            </span>
                            <span className="text-[10px] text-emerald-700 truncate block">
                              {ktpFileName || "selfie_ktp_terlampir.jpg"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowPreviewModal(true)}
                            className="w-7 h-7 rounded-lg hover:bg-emerald-100 text-emerald-800 flex items-center justify-center cursor-pointer"
                            title="Lihat Foto Penuh"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveKtp}
                            className="w-7 h-7 rounded-lg hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer"
                            title="Hapus / Ganti Foto"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 pt-0.5">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Identitas KTP lengkap dan siap diverifikasi.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-black text-xs text-white bg-[#00880D] hover:bg-[#00700B] active:scale-98 transition-all shadow-md shadow-[#00880D]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
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
                <span>Ubah Nomor HP / Data</span>
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
              Selamat datang, <strong>{name}</strong>!
            </p>
            {role === "WORKER" && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Foto KTP Terverifikasi Resmi</span>
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#00880D] pt-2">
              <Sparkles className="w-4 h-4" />
              <span>
                Mengalihkan ke {role === "WORKER" ? "Radar Mitra" : "Halaman Utama"}...
              </span>
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

      {/* Full Photo Modal Preview Dialog */}
      {showPreviewModal && ktpImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h4 className="text-xs font-extrabold text-slate-900">
                Pratinjau Foto Selfie KTP
              </h4>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ktpImage}
                alt="Foto Selfie KTP Penuh"
                className="w-full h-auto max-h-80 object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
