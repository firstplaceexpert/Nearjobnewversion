/**
 * /design-system — Storybook-lite component showcase
 *
 * This route is for DEVELOPMENT ONLY — it displays all base UI
 * components in one page so designers & developers can verify
 * visual consistency without spinning up Storybook.
 *
 * In production, this route should be removed or guarded.
 */
"use client";

import {
  Logo,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  SearchBar,
  Dropdown,
  EmptyState,
} from "@/components/ui";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white border-b border-gray-border/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <span className="text-xs font-medium text-gray bg-warning-light text-amber-700 px-3 py-1 rounded-[var(--radius-pill)]">
            DEV ONLY
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-16">
        {/* ── Page Title ─────────────────────────────────── */}
        <section>
          <h1 className="text-3xl font-bold text-dark mb-2">Design System</h1>
          <p className="text-gray text-base max-w-2xl">
            Komponen dasar reusable NEAR JOB. Semua komponen mengikuti design token brand
            — warna, tipografi, radius, dan shadow TIDAK di-hardcode di komponen.
          </p>
        </section>

        {/* ── Color Palette ──────────────────────────────── */}
        <Section
          title="Color Palette"
          description="Token warna brand yang didefinisikan di globals.css"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <ColorSwatch name="Primary (Blue)" value="#1867F8" className="bg-primary" />
            <ColorSwatch name="Dark (Midnight)" value="#2F2B4F" className="bg-dark" />
            <ColorSwatch
              name="Secondary (Cyan)"
              value="#23C8FE"
              className="bg-secondary"
            />
            <ColorSwatch name="Error (Coral)" value="#F57373" className="bg-error" />
            <ColorSwatch name="Accent (Pink)" value="#FF9DE0" className="bg-accent" />
            <ColorSwatch
              name="Warning (Yellow)"
              value="#FEE49A"
              className="bg-warning"
              textDark
            />
          </div>
        </Section>

        {/* ── Typography ─────────────────────────────────── */}
        <Section
          title="Typography"
          description="Plus Jakarta Sans — Bold 700, Semibold 600, Medium 500, Regular 400"
        >
          <div className="space-y-3 bg-white p-6 rounded-[var(--radius-xl)] border border-gray-border/50">
            <p className="text-3xl font-bold text-dark">Heading Bold (700) — 30px</p>
            <p className="text-2xl font-semibold text-dark">
              Heading Semibold (600) — 24px
            </p>
            <p className="text-xl font-medium text-dark">Heading Medium (500) — 20px</p>
            <p className="text-base font-normal text-dark">Body Regular (400) — 16px</p>
            <p className="text-sm text-gray">Body Small — 14px</p>
            <p className="text-xs text-gray-light">Caption — 12px</p>
          </div>
        </Section>

        {/* ── Logo ───────────────────────────────────────── */}
        <Section
          title="Logo"
          description="Maskot ikon lokasi + tas kerja. Jangan ubah proporsi atau warna."
        >
          <div className="flex items-end gap-8 flex-wrap bg-white p-6 rounded-[var(--radius-xl)] border border-gray-border/50">
            <div className="text-center">
              <Logo size="sm" />
              <p className="text-xs text-gray mt-2">Small</p>
            </div>
            <div className="text-center">
              <Logo size="md" />
              <p className="text-xs text-gray mt-2">Medium</p>
            </div>
            <div className="text-center">
              <Logo size="lg" />
              <p className="text-xs text-gray mt-2">Large</p>
            </div>
            <div className="text-center">
              <Logo showText={false} size="lg" />
              <p className="text-xs text-gray mt-2">Icon only</p>
            </div>
          </div>
        </Section>

        {/* ── Buttons ────────────────────────────────────── */}
        <Section
          title="Button"
          description="Primary (CTA), Outline, Ghost, dan Danger. Tombol utama menggunakan pill shape."
        >
          <div className="space-y-6 bg-white p-6 rounded-[var(--radius-xl)] border border-gray-border/50">
            <div>
              <p className="text-xs font-semibold text-gray uppercase tracking-wider mb-3">
                Variants
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="lg">
                  Lamar Sekarang
                </Button>
                <Button variant="outline">Lihat Detail</Button>
                <Button variant="ghost">Batal</Button>
                <Button variant="danger">Hapus</Button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray uppercase tracking-wider mb-3">
                Sizes
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray uppercase tracking-wider mb-3">
                States
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button isLoading>Memproses...</Button>
                <Button disabled>Disabled</Button>
                <Button variant="outline" fullWidth>
                  Full Width
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Badge ──────────────────────────────────────── */}
        <Section
          title="Badge / Chip"
          description="Label berwarna untuk tipe pekerjaan dan status."
        >
          <div className="flex flex-wrap items-center gap-3 bg-white p-6 rounded-[var(--radius-xl)] border border-gray-border/50">
            <Badge variant="success">Full Time</Badge>
            <Badge variant="accent">Part Time</Badge>
            <Badge variant="warning">Freelance</Badge>
            <Badge variant="primary">Harian</Badge>
            <Badge variant="error">Urgent</Badge>
            <Badge variant="neutral">Draft</Badge>
          </div>
        </Section>

        {/* ── Card ───────────────────────────────────────── */}
        <Section
          title="Card"
          description="Container untuk listing tugas. Hover effect opsional."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Card hoverable>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="success">Full Time</Badge>
                  <Badge variant="primary">Harian</Badge>
                </div>
                <CardTitle>Kurir Antar Dokumen</CardTitle>
                <CardDescription>Jakarta Selatan · PT Cepat Sampai</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray">
                  Dibutuhkan kurir berpengalaman untuk antar dokumen penting. Area Jakarta
                  Selatan, motor sendiri.
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-sm font-semibold text-dark">Rp 150.000/hari</span>
                <span className="text-xs text-gray-light ml-auto">2 jam lalu</span>
              </CardFooter>
            </Card>

            <Card hoverable>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="warning">Freelance</Badge>
                </div>
                <CardTitle>Jaga Booth Pameran</CardTitle>
                <CardDescription>Tangerang · Event Organizer XYZ</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray">
                  Dicari 2 orang untuk jaga booth selama 3 hari. Komunikatif dan
                  berpenampilan rapi.
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-sm font-semibold text-dark">Rp 200.000/hari</span>
                <span className="text-xs text-gray-light ml-auto">5 jam lalu</span>
              </CardFooter>
            </Card>
          </div>
        </Section>

        {/* ── Input ──────────────────────────────────────── */}
        <Section
          title="Input"
          description="Text input dengan label, error state, dan ikon."
        >
          <div className="max-w-md space-y-4 bg-white p-6 rounded-[var(--radius-xl)] border border-gray-border/50">
            <Input label="Nama Lengkap" placeholder="Masukkan nama lengkap" />
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
            />
            <Input
              label="Password"
              type="password"
              placeholder="Minimal 8 karakter"
              error="Password harus mengandung huruf besar, huruf kecil, dan angka"
            />
            <Input
              label="Telepon"
              placeholder="08xx-xxxx-xxxx"
              hint="Nomor ini akan digunakan untuk verifikasi"
            />
          </div>
        </Section>

        {/* ── SearchBar ──────────────────────────────────── */}
        <Section
          title="SearchBar"
          description="Input pencarian utama dengan tombol Cari terintegrasi."
        >
          <div className="bg-white p-6 rounded-[var(--radius-xl)] border border-gray-border/50">
            <SearchBar onSearch={(q) => alert(`Mencari: ${q}`)} />
          </div>
        </Section>

        {/* ── Dropdown ───────────────────────────────────── */}
        <Section title="Dropdown" description="Filter dropdown berbasis native select.">
          <div className="max-w-xs space-y-4 bg-white p-6 rounded-[var(--radius-xl)] border border-gray-border/50">
            <Dropdown
              label="Lokasi"
              options={[
                { value: "", label: "Lokasi Saya" },
                { value: "jakarta", label: "Jakarta" },
                { value: "bandung", label: "Bandung" },
                { value: "surabaya", label: "Surabaya" },
              ]}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
            />
            <Dropdown
              label="Bidang"
              options={[
                { value: "", label: "Semua Bidang" },
                { value: "logistik", label: "Logistik & Kurir" },
                { value: "event", label: "Event & Pameran" },
                { value: "admin", label: "Administrasi" },
                { value: "tech", label: "Teknologi" },
              ]}
            />
          </div>
        </Section>

        {/* ── Empty State ────────────────────────────────── */}
        <Section
          title="Empty State"
          description="Tampilan ramah saat data kosong — selalu beri konteks dan langkah selanjutnya."
        >
          <Card>
            <EmptyState
              title="Belum ada tugas tersedia"
              description="Coba ubah filter pencarian atau cari dengan kata kunci yang berbeda. Kami akan terus memperbarui daftar tugas untukmu!"
              action={{
                label: "Posting Tugas Baru",
                onClick: () => alert("Navigasi ke form posting tugas"),
              }}
            />
          </Card>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-border/50 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center">
          <p className="text-sm text-gray">
            NEAR JOB Design System · Hanya untuk keperluan development
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── Helper Components ───────────────────────────────────── */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-dark mb-1">{title}</h2>
      {description && <p className="text-sm text-gray mb-4">{description}</p>}
      {children}
    </section>
  );
}

function ColorSwatch({
  name,
  value,
  className,
  textDark = false,
}: {
  name: string;
  value: string;
  className: string;
  textDark?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`h-16 rounded-[var(--radius-lg)] ${className} flex items-end justify-center pb-2`}
      >
        <span className={`text-xs font-mono ${textDark ? "text-dark" : "text-white"}`}>
          {value}
        </span>
      </div>
      <p className="text-xs font-medium text-dark mt-1.5">{name}</p>
    </div>
  );
}
