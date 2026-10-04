"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo, Button, Input, Card, CardContent } from "@/components/ui";

import { Building2, Wrench } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickLogin = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/active-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/dashboard");
      }
    } catch {
      setError("Gagal melakukan login demo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    setError(null);

    // Try finding matching demo user or standard login
    const targetUserId = email.includes("budi")
      ? "usr-poster-budi"
      : email.includes("hendra")
        ? "usr-poster-hendra"
        : email.includes("reza")
          ? "usr-worker-reza"
          : "usr-worker-siti";

    await handleQuickLogin(targetUserId);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <Logo size="lg" className="justify-center" />
        <h1 className="text-2xl font-extrabold text-dark tracking-tight">
          Masuk ke NEAR JOB
        </h1>
        <p className="text-xs text-gray">Temukan tugas atau pantau pelamar pekerjaanmu</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-error-light text-error text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Quick Demo Login Buttons */}
          <div className="p-3.5 bg-light/70 rounded-xl border border-gray-border/60 space-y-2">
            <span className="text-[11px] font-bold text-gray uppercase tracking-wider block text-center">
              Akses Cepat Mode Demo:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin("usr-poster-budi")}
                disabled={loading}
                className="text-xs flex items-center justify-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>Budi (Poster)</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin("usr-worker-siti")}
                disabled={loading}
                className="text-xs flex items-center justify-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5 text-success" />
                <span>Siti (Worker)</span>
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              Masuk Sekarang
            </Button>
          </form>

          <p className="text-center text-xs text-gray pt-2">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Daftar di sini
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
