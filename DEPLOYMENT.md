# Panduan Deployment & Hardening Produksi NEAR JOB

Dokumen ini memuat panduan komprehensif untuk men-deploy platform **NEAR JOB** ke lingkungan produksi, mencakup konfigurasi environment, migrasi database tanpa downtime (_zero-downtime_), kontainerisasi dengan Docker, serta strategi pemulihan bencana (_rollback_).

---

## 1. Spesifikasi Environment Variables

Setiap environment (Development, Staging, Production) harus mengonfigurasi variabel-variabel berikut:

| Variabel              | Wajib di Prod | Contoh Nilai                                                                 | Deskripsi                                                                      |
| --------------------- | ------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `DATABASE_URL`        | **Ya**        | `postgresql://nearjob_user:SECURE_PASS@db-host:5432/nearjob?sslmode=require` | Connection string PostgreSQL 16 dengan parameter pooling yang sesuai.          |
| `NEXTAUTH_SECRET`     | **Ya**        | `openssl rand -base64 32`                                                    | Kunci enkripsi untuk session cookie JWT NextAuth.js. Minimal 32 karakter acak. |
| `NEXTAUTH_URL`        | **Ya**        | `https://nearjob.id`                                                         | FQDN domain produksi tempat aplikasi diakses publik.                           |
| `NEXT_PUBLIC_APP_URL` | **Ya**        | `https://nearjob.id`                                                         | URL publik yang dikonsumsi sisi klien untuk callback dan absolute URL.         |
| `NODE_ENV`            | **Ya**        | `production`                                                                 | Mengaktifkan optimasi internal Next.js, minifikasi, dan SSR cache.             |
| `PORT`                | Opsional      | `3000`                                                                       | Port listen aplikasi (default: `3000`).                                        |

> **PERINGATAN KEAMANAN**: Jangan pernah commit file `.env` atau `.env.production` ke repositori Git. Gunakan secret manager penyedia cloud (e.g. AWS Secrets Manager, Doppler, Vault, atau GitHub Actions Secrets).

---

## 2. Pilihan Deployment

### Opsi A: Menggunakan Docker Compose (Rekomendasi untuk VPS / Self-Hosted)

Stack sudah dilengkapi file multi-stage `Dockerfile` (menggunakan non-root user `nextjs:nodejs` dan Next.js standalone server) serta `docker-compose.yml` lengkap dengan PostgreSQL 16 dan health check.

1. **Siapkan file environment produksi**:

   ```bash
   cp .env.example .env.production
   # Buka .env.production dan sesuaikan password database dan NEXTAUTH_SECRET
   ```

2. **Jalankan cluster container**:

   ```bash
   docker compose --env-file .env.production up -d --build
   ```

3. **Verifikasi status container**:

   ```bash
   docker compose ps
   ```

4. **Jalankan migrasi database di dalam container**:

   ```bash
   docker compose exec app npx prisma db update
   ```

5. **Cek log server**:
   ```bash
   docker compose logs -f app
   ```

---

### Opsi B: Deployment Manual / Bare-Metal / Platform PaaS

1. **Instal dependensi**:

   ```bash
   npm ci
   ```

2. **Validasi dan migrasi database**:

   ```bash
   npx prisma db update
   ```

3. **Build aplikasi untuk produksi**:

   ```bash
   npm run build
   ```

   _Proses ini menghasilkan bundle teroptimasi di `.next/standalone`._

4. **Jalankan standalone server**:
   ```bash
   PORT=3000 NODE_ENV=production node .next/standalone/server.js
   ```
   _(Atau gunakan process manager seperti PM2 atau systemd)_:
   ```bash
   pm2 start .next/standalone/server.js --name nearjob -i max
   ```

---

## 3. Strategi Migrasi Database Tanpa Downtime (_Zero-Downtime_)

Untuk mencegah lock tabel dan error query saat aplikasi versi baru di-rolling out, tim NEAR JOB menerapkan pola **Expand and Contract (Parallel Run)**:

```
[Tahap 1: Expand]
- Buat kolom/tabel baru (selalu nullable atau memiliki default value).
- Jangan menghapus atau me-rename kolom lama.
- Terapkan migrasi ke database produksi (DB Migration).

[Tahap 2: Rolling Deployment Aplikasi]
- Deploy kode aplikasi baru yang:
  * Menulis ke kolom baru (atau ke kedua kolom jika diperlukan sinkronisasi).
  * Membaca dari kolom baru, dengan fallback ke kolom lama bila null.
- Traffic dialihkan secara bertahap (Canary / Blue-Green / Rolling update).
- Kedua versi aplikasi (lama dan baru) dapat beroperasi bersamaan tanpa crash.

[Tahap 3: Backfill Data (Jika diperlukan)]
- Jalankan script background job untuk menyalin/mengisi data lampau dari kolom lama ke kolom baru.

[Tahap 4: Contract]
- Setelah seluruh instance aplikasi sudah berjalan di versi terbaru dan diverifikasi stabil.
- Buat migrasi susulan untuk menghapus kolom lama yang sudah tidak lagi digunakan.
```

### Checklist Eksekusi Migrasi di Produksi:

1. Ambil snapshot/backup database cadangan:
   ```bash
   pg_dump -h <host> -U <user> -d nearjob -Fc -f "backup-before-migration-$(date +%Y%m%d%H%M%S).dump"
   ```
2. Pastikan tidak ada script DDL yang melakukan operasi eksklusif `ACCESS EXCLUSIVE LOCK` berkepanjangan pada tabel transaksi tinggi (`tasks`, `applications`, `transactions`).
3. Jalankan `npx prisma db update` dari staging runner atau CI/CD deployment pipeline sebelum traffic dialihkan ke container baru.

---

## 4. Health Check & Uptime Monitoring

NEAR JOB menyediakan dedicated lightweight health-check endpoint:

```http
GET /api/health
```

### Respon Sukses (HTTP 200 OK):

```json
{
  "status": "healthy",
  "timestamp": "2026-09-28T07:55:00.000Z",
  "uptime": 1284.52,
  "version": "0.1.0",
  "environment": "production",
  "memory": {
    "rss": 84,
    "heapTotal": 42,
    "heapUsed": 31
  }
}
```

Endpoint ini dikonsumsi oleh:

- Docker compose container health check
- Load balancer (AWS ALB, Cloudflare, Nginx reverse proxy)
- Monitoring probe (Prometheus, Uptime Kuma, Datadog)

---

## 5. Prosedur Rollback & Disaster Recovery

Jika ditemukan regresi kritis atau anomali setelah rilis produksi:

### Langkah 1: Rollback Versi Aplikasi

1. Jika menggunakan Docker:
   ```bash
   # Ganti image tag ke release sebelumnya di docker-compose.yml, lalu:
   docker compose up -d --no-deps app
   ```
2. Jika menggunakan container registry (e.g. AWS ECR / GHCR):
   Arahkan traffic ke container image tag stabil sebelumnya (contoh: `nearjob:v0.1.0-rev1`).

### Langkah 2: Evaluasi Status Database

- Karena NEAR JOB menggunakan prinsip **Expand and Contract**, schema database versi baru dirancang kompatibel ke belakang (_backward compatible_). Aplikasi versi lama biasanya dapat langsung membaca database tanpa perlu me-rollback schema secara tergesa-gesa.
- Jika data korup dan memerlukan restore snapshot fisik:
  ```bash
  pg_restore -h <host> -U <user> -d nearjob -c "backup-before-migration-xxx.dump"
  ```

### Langkah 3: Investigasi Log Terstruktur

Server NEAR JOB memancarkan log terstruktur berformat JSON (`src/lib/logger.ts`) dengan metadata request, trace ID, dan sensor sanitasi data sensitif (password/token otomatis di-redact).
Gunakan filter log:

```bash
docker compose logs app | grep '"level":"error"'
```
