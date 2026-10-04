/**
 * Application-wide constants — brand copy, config values, enums, badge mappings.
 */

export const BRAND = {
  name: "NEAR JOB",
  tagline: "Pekerjaan dekat, peluang nyata.",
  description:
    "Platform marketplace tugas dan pekerjaan terbuka. Temukan pekerjaan di sekitarmu atau posting tugas untuk dikerjakan oleh pekerja terdekat.",
} as const;

/**
 * User roles — mirrored from Prisma enum.
 */
export const USER_ROLES = {
  POSTER: "POSTER",
  WORKER: "WORKER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Task Categories
 */
export const TASK_CATEGORIES = [
  "Semua Kategori",
  "Jasa Harian",
  "Angkut Barang",
  "Jaga Booth",
  "Proyek Singkat",
  "IT & Desain",
  "Kasir & Ritel",
  "Pertukangan & Servis",
  "Fotografi & Event",
] as const;

/**
 * Job Types & Badge Variants
 */
export const JOB_TYPE_BADGE = {
  FULL_TIME: { label: "Full Time", variant: "success" as const },
  PART_TIME: { label: "Part Time", variant: "accent" as const },
  FREELANCE: { label: "Freelance", variant: "warning" as const },
  DAILY: { label: "Harian", variant: "primary" as const },
} as const;

export type JobType = keyof typeof JOB_TYPE_BADGE;

/**
 * Task Statuses
 */
export const TASK_STATUS_CONFIG = {
  OPEN: { label: "Terbuka", variant: "primary" as const },
  IN_PROGRESS: { label: "Berjalan", variant: "warning" as const },
  COMPLETED: { label: "Selesai", variant: "success" as const },
  CANCELLED: { label: "Dibatalkan", variant: "error" as const },
} as const;

export type TaskStatus = keyof typeof TASK_STATUS_CONFIG;

/**
 * Application Statuses
 */
export const APPLICATION_STATUS_CONFIG = {
  PENDING: { label: "Menunggu Kurasi", variant: "warning" as const },
  ACCEPTED: { label: "Diterima", variant: "success" as const },
  REJECTED: { label: "Ditolak", variant: "error" as const },
} as const;

export type ApplicationStatus = keyof typeof APPLICATION_STATUS_CONFIG;

/**
 * Transaction Statuses
 */
export const TRANSACTION_STATUS_CONFIG = {
  PENDING: { label: "Tertahan", variant: "warning" as const },
  PAID: { label: "Dibayar", variant: "success" as const },
} as const;

export type TransactionStatus = keyof typeof TRANSACTION_STATUS_CONFIG;
