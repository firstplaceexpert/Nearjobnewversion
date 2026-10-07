"use client";

import { useState } from "react";
import {
  X,
  Shield,
  CheckCircle2,
  Repeat,
  CreditCard,
  Users,
  Bookmark,
  UserCheck,
  Star,
  Smartphone,
  Plus,
  Trash2,
  MapPin,
  Building2,
  Home,
  Gift,
  Check,
  Wallet,
  Pencil,
} from "lucide-react";

export type ProfileModalType =
  | null
  | "SECURITY"
  | "SUBSCRIPTION"
  | "PAYMENT"
  | "FAMILY"
  | "ADDRESSES"
  | "VERIFICATION"
  | "NEARPOIN"
  | "APP_ICON"
  | "EDIT_PROFILE";

interface ProfileModalsProps {
  activeModal: ProfileModalType;
  onClose: () => void;
  onSuccess: (message: string) => void;
  userData: {
    name: string;
    email: string;
    phone: string;
  };
  onUpdateUser: (updated: { name: string; phone: string }) => void;
}

export function ProfileModals({
  activeModal,
  onClose,
  onSuccess,
  userData,
  onUpdateUser,
}: ProfileModalsProps) {
  // ── State for Security Modal ──────────────────────────────
  const [is2FaEnabled, setIs2FaEnabled] = useState(true);
  const [pinCode, setPinCode] = useState("123456");
  const [isEditingPin, setIsEditingPin] = useState(false);

  // ── State for Subscription Modal ──────────────────────────
  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY" | "3MONTH" | "YEARLY">(
    "MONTHLY",
  );

  // ── State for Payment Modal ───────────────────────────────
  const [nearPayBalance, setNearPayBalance] = useState(250000);

  // ── State for Family Modal ────────────────────────────────
  const [familyMembers, setFamilyMembers] = useState([
    {
      id: "fam-1",
      name: "Dimas Pratama",
      role: "Kepala Keluarga / Admin",
      phone: "+6281298765432",
    },
    {
      id: "fam-2",
      name: "Sarah Amelia",
      role: "Anggota (Limit Rp 150rb/hari)",
      phone: "+6281234567890",
    },
  ]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [isAddingFamily, setIsAddingFamily] = useState(false);

  // ── State for Addresses Modal ─────────────────────────────
  const [addresses, setAddresses] = useState([
    {
      id: "addr-1",
      label: "Rumah",
      isPrimary: true,
      address: "Jl. Malioboro No. 12, Sosromenduran, Gedong Tengen, Kota Yogyakarta",
      note: "Pagar hitam depan pos ronda",
    },
    {
      id: "addr-2",
      label: "Kantor",
      isPrimary: false,
      address: "Gedung Graha Sarina Lt. 3, Jl. Jend. Sudirman No. 45, Kota Yogyakarta",
      note: "Masuk lobby utama resepsionis",
    },
    {
      id: "addr-3",
      label: "Kost / Titik Kumpul",
      isPrimary: false,
      address: "Pogung Dalangan No. 8, Sinduadi, Mlati, Sleman, D.I. Yogyakarta",
      note: "Kost Putri Melati blok B2",
    },
  ]);
  const [newAddrLabel, setNewAddrLabel] = useState("");
  const [newAddrText, setNewAddrText] = useState("");
  const [newAddrNote, setNewAddrNote] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // ── State for App Icon Modal ──────────────────────────────
  const [selectedIconTheme, setSelectedIconTheme] = useState<"GREEN" | "DARK" | "BLUE">(
    "GREEN",
  );

  // ── State for NearPoin Rewards Modal ──────────────────────
  const [nearPoin, setNearPoin] = useState(350);
  const redeemPoin = (cost: number, message: string) => {
    if (nearPoin < cost) {
      onSuccess(`NearPoin belum cukup. Butuh ${cost - nearPoin} poin lagi.`);
      return;
    }
    setNearPoin((prev) => prev - cost);
    onSuccess(`${message} (-${cost} NearPoin)`);
  };

  // ── State for Edit Profile Modal ──────────────────────────
  const [editName, setEditName] = useState(userData.name);
  const [editPhone, setEditPhone] = useState(userData.phone);

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-[100005] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        {/* ── 1. KEAMANAN AKUN MODAL ───────────────────────── */}
        {activeModal === "SECURITY" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-secondary-light text-secondary-deep flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    Keamanan Akun & PIN
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Skor Perlindungan: 100% Aman
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2FA WhatsApp Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Autentikasi 2 Langkah (OTP WhatsApp)
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Wajibkan kode OTP saat login dari perangkat baru
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIs2FaEnabled(!is2FaEnabled);
                  onSuccess(
                    is2FaEnabled ? "2FA OTP dinonaktifkan." : "2FA OTP WhatsApp aktif!",
                  );
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  is2FaEnabled ? "bg-primary" : "bg-slate-300"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    is2FaEnabled ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* PIN Transaksi */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    PIN Keamanan Transaksi
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Digunakan saat mencairkan saldo atau rekber
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingPin(!isEditingPin)}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  {isEditingPin ? "Batal" : "Ubah PIN"}
                </button>
              </div>

              {isEditingPin ? (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 px-3 py-2 text-center tracking-widest text-sm font-black rounded-xl border border-slate-300 focus:outline-none focus:border-primary"
                    placeholder="6 Digit PIN"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPin(false);
                      onSuccess("PIN transaksi berhasil diperbarui!");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <p className="text-xs font-mono text-slate-600 font-bold tracking-widest pt-1">
                  •••••• (Aktif)
                </p>
              )}
            </div>

            {/* Perangkat Aktif */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Perangkat Terhubung
              </span>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-secondary-hover" />
                    <div>
                      <strong className="block text-slate-800">
                        MacBook / Safari (Sesi Ini)
                      </strong>
                      <span className="text-[10px] text-secondary-hover font-bold">
                        Sedang Aktif • Yogyakarta
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    <div>
                      <strong className="block text-slate-800">
                        iPhone 13 (Aplikasi Mobile)
                      </strong>
                      <span className="text-[10px] text-slate-400">
                        Aktif 2 jam yang lalu
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSuccess("Berhasil keluar dari iPhone 13.")}
                    className="text-[10px] font-bold text-error-hover hover:underline cursor-pointer"
                  >
                    Keluar Sesi
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSuccess("Pengaturan keamanan berhasil disimpan.");
              }}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Selesai & Simpan
            </button>
          </div>
        )}

        {/* ── 2. LANGGANAN MODAL ───────────────────────────── */}
        {activeModal === "SUBSCRIPTION" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-secondary-light text-primary flex items-center justify-center">
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    Langganan NearJob Plus
                  </h3>
                  <p className="text-[11px] text-primary font-bold">
                    Promo Terbatas Diskon 50% 🔥
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Keuntungan Plus */}
            <div className="p-3.5 rounded-2xl bg-secondary-light border border-secondary/80 space-y-2 text-xs">
              <span className="font-extrabold text-secondary-deep block">
                Keuntungan Spesial Anggota:
              </span>
              <ul className="space-y-1.5 text-secondary-deep text-[11px]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary-hover shrink-0" />
                  <span>Potongan komisi platform flat hanya 5% (hemat setengah)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary-hover shrink-0" />
                  <span>Tugas Anda selalu tampil di prioritas teratas radar</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary-hover shrink-0" />
                  <span>Gratis biaya pencairan saldo instan ke rekening bank</span>
                </li>
              </ul>
            </div>

            {/* Pilihan Paket */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedPlan("MONTHLY")}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedPlan === "MONTHLY"
                    ? "border-primary bg-secondary-light/40 ring-2 ring-primary/20"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">
                    Paket 1 Bulan
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Mulai coba fleksibel
                  </span>
                </div>
                <span className="text-xs font-black text-primary">Rp 29.000 / bln</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan("3MONTH")}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedPlan === "3MONTH"
                    ? "border-primary bg-secondary-light/40 ring-2 ring-primary/20"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">
                    Paket 3 Bulan
                  </span>
                  <span className="text-[10px] font-bold text-warning-deep bg-warning-light px-1.5 py-0.5 rounded">
                    Hemat 15%
                  </span>
                </div>
                <span className="text-xs font-black text-primary">Rp 75.000</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan("YEARLY")}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedPlan === "YEARLY"
                    ? "border-primary bg-secondary-light/40 ring-2 ring-primary/20"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">
                    Paket 1 Tahun (Best Deal)
                  </span>
                  <span className="text-[10px] font-bold text-secondary-hover bg-secondary-light px-1.5 py-0.5 rounded">
                    Paling Hemat
                  </span>
                </div>
                <span className="text-xs font-black text-primary">Rp 199.000 / thn</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSuccess("Selamat! Langganan NearJob Plus Anda telah aktif.");
              }}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Aktifkan Paket Sekarang
            </button>
          </div>
        )}

        {/* ── 3. METODE PEMBAYARAN MODAL ───────────────────── */}
        {activeModal === "PAYMENT" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-light text-primary-hover flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    Metode Pembayaran & Saldo
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Rekber Resmi & Dompet Digital
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Saldo NearPay Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary to-primary text-white space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-primary-light flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" /> Saldo Dompet NearPay
                </span>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  Rekber Aktif
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                Rp {nearPayBalance.toLocaleString("id-ID")}
              </h2>
              <div className="pt-1 flex items-center gap-2">
                {[50000, 100000, 200000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setNearPayBalance((prev) => prev + amt);
                      onSuccess(
                        `Top-up Rp ${amt.toLocaleString("id-ID")} berhasil ditambahkan!`,
                      );
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    +{amt / 1000}k
                  </button>
                ))}
              </div>
            </div>

            {/* Metode Tersimpan */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Metode Tersimpan
              </span>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary-light text-primary flex items-center justify-center font-black text-[10px]">
                      BCA
                    </div>
                    <div>
                      <strong className="block text-slate-800">
                        Bank Central Asia (BCA)
                      </strong>
                      <span className="text-[10px] text-slate-500 font-mono">
                        123-456-7890 • Utama
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-secondary-hover">
                    Terhubung
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-secondary-light text-secondary-hover flex items-center justify-center font-black text-[10px]">
                      QRIS
                    </div>
                    <div>
                      <strong className="block text-slate-800">
                        QRIS & E-Wallet Instan
                      </strong>
                      <span className="text-[10px] text-slate-500">
                        Auto-debit pesanan tugas
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-secondary-hover">
                    Aktif
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onSuccess("Fitur penambahan kartu kredit/debit siap digunakan.")
              }
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-primary text-primary text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Rekening / E-Wallet Baru</span>
            </button>
          </div>
        )}

        {/* ── 4. AKUN KELUARGA MODAL ───────────────────────── */}
        {activeModal === "FAMILY" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-dark/10 text-dark flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    Akun Keluarga
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Bayar tugas bersama dalam 1 saldo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Daftar Anggota */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Anggota Keluarga Terhubung ({familyMembers.length}/5)
              </span>
              <div className="space-y-2 text-xs">
                {familyMembers.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <strong className="block text-slate-800">{m.name}</strong>
                      <span className="text-[10px] text-slate-500">
                        {m.role} • {m.phone}
                      </span>
                    </div>
                    {m.id !== "fam-1" && (
                      <button
                        type="button"
                        onClick={() => {
                          setFamilyMembers(
                            familyMembers.filter((item) => item.id !== m.id),
                          );
                          onSuccess(`Anggota ${m.name} berhasil dihapus.`);
                        }}
                        className="text-error hover:text-error-deep p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Tambah Anggota */}
            {isAddingFamily ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <span className="font-bold text-slate-800 block">
                  Undang Anggota Baru
                </span>
                <input
                  type="text"
                  placeholder="Nama Lengkap (contoh: Adik Dimas)"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-dark-soft"
                />
                <input
                  type="tel"
                  placeholder="Nomor WhatsApp (+628...)"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-dark-soft"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingFamily(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMemberName || !newMemberPhone) return;
                      setFamilyMembers([
                        ...familyMembers,
                        {
                          id: `fam-${Date.now()}`,
                          name: newMemberName,
                          role: "Anggota Baru (Pending)",
                          phone: newMemberPhone,
                        },
                      ]);
                      setNewMemberName("");
                      setNewMemberPhone("");
                      setIsAddingFamily(false);
                      onSuccess("Undangan keluarga telah dikirim via WhatsApp!");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-dark-soft text-white font-bold cursor-pointer"
                  >
                    Kirim Undangan
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingFamily(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-dark-soft text-dark text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Undang Anggota Keluarga Baru</span>
              </button>
            )}
          </div>
        )}

        {/* ── 5. ALAMAT TERSIMPAN MODAL ────────────────────── */}
        {activeModal === "ADDRESSES" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-warning-light text-warning-deep flex items-center justify-center">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    Alamat Tersimpan
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pilih titik penjemputan / lokasi tugas cepat
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List Alamat */}
            <div className="space-y-2.5 text-xs">
              {addresses.map((a) => (
                <div
                  key={a.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    a.isPrimary
                      ? "border-primary bg-secondary-light/40 ring-2 ring-primary/10"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {a.label === "Rumah" ? (
                          <Home className="w-4 h-4 text-primary" />
                        ) : a.label === "Kantor" ? (
                          <Building2 className="w-4 h-4 text-primary" />
                        ) : (
                          <MapPin className="w-4 h-4 text-warning-deep" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 font-extrabold">
                            {a.label}
                          </strong>
                          {a.isPrimary && (
                            <span className="text-[9px] font-bold bg-primary text-white px-1.5 py-0.2 rounded">
                              Utama
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                          {a.address}
                        </p>
                        <p className="text-slate-400 text-[10px] italic mt-0.5">
                          Catatan: {a.note}
                        </p>
                      </div>
                    </div>

                    {!a.isPrimary && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddresses(
                            addresses.map((item) => ({
                              ...item,
                              isPrimary: item.id === a.id,
                            })),
                          );
                          onSuccess(`Alamat ${a.label} dijadikan sebagai alamat utama.`);
                        }}
                        className="text-[10px] font-bold text-primary hover:underline shrink-0 cursor-pointer"
                      >
                        Pilih Utama
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Form Tambah Alamat */}
            {isAddingAddress ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <span className="font-bold text-slate-800 block">Tambah Alamat Baru</span>
                <input
                  type="text"
                  placeholder="Label Alamat (contoh: Toko, Kampus)"
                  value={newAddrLabel}
                  onChange={(e) => setNewAddrLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-primary"
                />
                <textarea
                  rows={2}
                  placeholder="Alamat Lengkap (Jalan, Nomor, Kelurahan, Kota)"
                  value={newAddrText}
                  onChange={(e) => setNewAddrText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Patokan lokasi (contoh: Sebelah Alfamart)"
                  value={newAddrNote}
                  onChange={(e) => setNewAddrNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-primary"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAddrLabel || !newAddrText) return;
                      setAddresses([
                        ...addresses,
                        {
                          id: `addr-${Date.now()}`,
                          label: newAddrLabel,
                          address: newAddrText,
                          note: newAddrNote || "Tanpa catatan",
                          isPrimary: false,
                        },
                      ]);
                      setNewAddrLabel("");
                      setNewAddrText("");
                      setNewAddrNote("");
                      setIsAddingAddress(false);
                      onSuccess("Alamat baru berhasil ditambahkan!");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-primary text-white font-bold cursor-pointer"
                  >
                    Simpan Alamat
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingAddress(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-primary text-primary text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Alamat Baru</span>
              </button>
            )}
          </div>
        )}

        {/* ── 6. PUSAT AKUN TERVERIFIKASI MODAL ───────────── */}
        {activeModal === "VERIFICATION" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-secondary-light text-secondary-deep flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    Pusat Akun Terverifikasi
                  </h3>
                  <p className="text-[11px] text-secondary-deep font-bold">
                    Status: Terverifikasi Penuh ✓
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-secondary to-secondary-hover text-white space-y-1.5 shadow-md">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block">
                Tingkat Kepercayaan Akun
              </span>
              <h2 className="text-xl font-black">Level 3 • Bintang Emas</h2>
              <p className="text-xs text-secondary-light">
                Akun ini telah melewati verifikasi identitas resmi KTP, nomor WhatsApp
                OTP, dan rekening bank.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="block text-slate-800">
                    KTP Elektronik Republik Indonesia
                  </strong>
                  <span className="text-[10px] text-slate-500 font-mono">
                    NIK: 347101******0001
                  </span>
                </div>
                <span className="text-[10px] font-bold text-secondary-hover bg-secondary-light px-2 py-0.5 rounded-full border border-secondary/30">
                  Terverifikasi ✓
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="block text-slate-800">Nomor WhatsApp Aktif</strong>
                  <span className="text-[10px] text-slate-500">{userData.phone}</span>
                </div>
                <span className="text-[10px] font-bold text-secondary-hover bg-secondary-light px-2 py-0.5 rounded-full border border-secondary/30">
                  Terverifikasi OTP ✓
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="block text-slate-800">Alamat Email Resmi</strong>
                  <span className="text-[10px] text-slate-500">{userData.email}</span>
                </div>
                <span className="text-[10px] font-bold text-secondary-hover bg-secondary-light px-2 py-0.5 rounded-full border border-secondary/30">
                  Terverifikasi ✓
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* ── 7. NEARPOIN REWARDS MODAL ─────────────────────────── */}
        {activeModal === "NEARPOIN" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-warning-light text-warning-deep flex items-center justify-center">
                  <Star className="w-5 h-5 fill-warning text-warning-deep" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    NearPoin Rewards
                  </h3>
                  <p className="text-[11px] text-warning-deep font-bold">
                    Reward Eksklusif Pengguna Setia
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Point Balance Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-warning via-warning to-accent/60 text-dark space-y-2 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Total NearPoin Anda
                </span>
                <span className="text-[10px] font-black bg-warning-deep text-white px-2 py-0.5 rounded-full">
                  {nearPoin >= 500 ? "Gold Member" : "Silver Member"}
                </span>
              </div>
              <h2 className="text-3xl font-black">{nearPoin} Poin</h2>
              <div className="space-y-1 pt-1">
                <div className="w-full bg-warning-deep/20 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-warning-deep h-full transition-all"
                    style={{ width: `${Math.min(100, (nearPoin / 500) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold block text-right">
                  {nearPoin >= 500
                    ? "Selamat, Anda Gold Member!"
                    : `${500 - nearPoin} poin lagi menuju Gold Member`}
                </span>
              </div>
            </div>

            {/* Reward List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Reward Siap Ditukar
              </span>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Gift className="w-4 h-4 text-warning-deep" />
                    <div>
                      <strong className="block text-slate-800">
                        Voucher Diskon Jasa Rp 10.000
                      </strong>
                      <span className="text-[10px] text-slate-500">
                        Dapat dipakai di semua tugas
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      redeemPoin(100, "Voucher Rp 10.000 berhasil diklaim ke akun Anda!")
                    }
                    disabled={nearPoin < 100}
                    className="px-3 py-1.5 rounded-lg bg-warning hover:bg-warning-deep hover:text-white text-dark font-bold text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-warning disabled:hover:text-dark"
                  >
                    Tukar (100 Poin)
                  </button>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Star className="w-4 h-4 text-warning-deep fill-warning" />
                    <div>
                      <strong className="block text-slate-800">
                        Prioritas Radar Orderan 24 Jam
                      </strong>
                      <span className="text-[10px] text-slate-500">
                        Pekerjaan muncul pertama
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      redeemPoin(200, "Prioritas radar tugas 24 jam telah diaktifkan!")
                    }
                    disabled={nearPoin < 200}
                    className="px-3 py-1.5 rounded-lg bg-warning hover:bg-warning-deep hover:text-white text-dark font-bold text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-warning disabled:hover:text-dark"
                  >
                    Tukar (200 Poin)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 8. IKON APLIKASI MODAL ───────────────────────── */}
        {activeModal === "APP_ICON" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    Tema Ikon Aplikasi
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sesuaikan tampilan ikon di layar beranda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedIconTheme("GREEN")}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedIconTheme === "GREEN"
                    ? "border-primary bg-primary-light/50 ring-2 ring-primary/20"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-sm">
                    NJ
                  </div>
                  <div>
                    <strong className="block text-slate-900">
                      Electric Blue (Standar)
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      Biru elektrik ikonik khas NearJob
                    </span>
                  </div>
                </div>
                {selectedIconTheme === "GREEN" && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedIconTheme("DARK")}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedIconTheme === "DARK"
                    ? "border-dark bg-dark/10 ring-2 ring-dark/20"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-dark text-white flex items-center justify-center font-black text-sm shadow-sm">
                    NJ
                  </div>
                  <div>
                    <strong className="block text-slate-900">
                      Midnight Violet (Mode Gelap)
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      Elegan bernuansa ungu malam
                    </span>
                  </div>
                </div>
                {selectedIconTheme === "DARK" && <Check className="w-4 h-4 text-dark" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedIconTheme("BLUE")}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedIconTheme === "BLUE"
                    ? "border-secondary bg-secondary-light/50 ring-2 ring-secondary/20"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-secondary text-white flex items-center justify-center font-black text-sm shadow-sm">
                    NJ
                  </div>
                  <div>
                    <strong className="block text-slate-900">
                      Sky Cyan (Mode Mitra)
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      Segar bernuansa biru langit
                    </span>
                  </div>
                </div>
                {selectedIconTheme === "BLUE" && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSuccess(`Tema ikon ${selectedIconTheme} berhasil diterapkan.`);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
            >
              Terapkan Ikon Aplikasi
            </button>
          </div>
        )}

        {/* ── 9. EDIT PROFIL MODAL ─────────────────────────── */}
        {activeModal === "EDIT_PROFILE" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-slate-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Edit Data Profil
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateUser({ name: editName, phone: editPhone });
                  onClose();
                  onSuccess("Data profil berhasil diperbarui!");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white shadow-xs cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
