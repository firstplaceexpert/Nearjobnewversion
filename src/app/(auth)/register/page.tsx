"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo, Button, Input, Card, CardContent } from "@/components/ui";
import { Wrench, Building2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"POSTER" | "WORKER">("WORKER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Semua kolom formulir wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In demo mode, register active user directly
      const res = await fetch("/api/auth/active-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: role === "POSTER" ? "usr-poster-budi" : "usr-worker-siti",
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push(role === "POSTER" ? "/post-task" : "/browse");
      }
    } catch {
      setError("Gagal mendaftarkan akun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <Logo size="lg" className="justify-center" />
        <h1 className="text-2xl font-extrabold text-dark tracking-tight">
          Buat Akun NEAR JOB Baru
        </h1>
        <p className="text-xs text-gray">
          Daftar gratis dan mulai cari tugas atau pekerjakan orang terdekat
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-error-light text-error text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector Tabs */}
            <div>
              <label className="text-xs font-semibold text-dark block mb-1.5">
                Daftar Sebagai Peran Apa?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("WORKER")}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                    role === "WORKER"
                      ? "border-success bg-success-light/20 text-success font-bold"
                      : "border-gray-border bg-light text-gray hover:text-dark"
                  }`}
                >
                  <Wrench className="w-5 h-5 mb-1" />
                  <span className="text-xs block">Pekerja (Worker)</span>
                  <span className="text-[10px] text-gray block mt-0.5">
                    Cari Penghasilan
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("POSTER")}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                    role === "POSTER"
                      ? "border-primary bg-primary-light/30 text-primary font-bold"
                      : "border-gray-border bg-light text-gray hover:text-dark"
                  }`}
                >
                  <Building2 className="w-5 h-5 mb-1" />
                  <span className="text-xs block">Pemberi Tugas</span>
                  <span className="text-[10px] text-gray block mt-0.5">
                    Pasang Pekerjaan
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-dark block mb-1">
                Nama Lengkap
              </label>
              <Input
                type="text"
                placeholder="Contoh: Rian Pratama"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-dark block mb-1">
                Alamat Email
              </label>
              <Input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-dark block mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-bold shadow-md"
              loading={loading}
              disabled={loading}
            >
              Daftar Sekarang
            </Button>
          </form>

          <p className="text-center text-xs text-gray pt-2">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
