/**
 * Zod validation schemas — centralised input validation.
 *
 * All API & form inputs MUST be validated server-side with these schemas.
 * Client-side validation is a UX convenience only — never trust it alone.
 */
import { z } from "zod";

/* ── Auth Schemas ────────────────────────────────────────── */

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password terlalu panjang"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama terlalu panjang"),
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .max(100, "Password terlalu panjang")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password harus mengandung huruf besar, huruf kecil, dan angka",
      ),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    role: z.enum(["POSTER", "WORKER"], {
      error: "Pilih peran: Pemberi Tugas (Poster) atau Pekerja (Worker)",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

/* ── Task Schemas ────────────────────────────────────────── */

export const postTaskSchema = z.object({
  title: z
    .string()
    .min(5, "Judul tugas minimal 5 karakter")
    .max(100, "Judul tugas maksimal 100 karakter"),
  category: z.string().min(1, "Pilih kategori tugas"),
  type: z.enum(["DAILY", "PART_TIME", "FREELANCE", "FULL_TIME"]).default("DAILY"),
  description: z.string().min(20, "Deskripsi dan jobdesk minimal 20 karakter"),
  location: z.string().min(3, "Lokasi tugas wajib diisi"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  budget: z
    .number({
      error: "Budget harus berupa angka",
    })
    .int("Budget harus berupa bilangan bulat")
    .min(2000, "Budget minimal Rp2.000")
    .max(100000000, "Budget maksimal Rp100.000.000"),
  scheduleDate: z.string().min(1, "Tanggal pelaksanaan wajib diisi"),
  scheduleTime: z.string().min(1, "Jam pelaksanaan wajib diisi"),
  voucherCode: z.string().optional().nullable(),
  discountAmount: z.number().optional().nullable(),
  finalPaidAmount: z.number().optional().nullable(),
});

export const filterTaskSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
  minBudget: z.number().optional(),
  maxBudget: z.number().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
});

/* ── Application Schemas ─────────────────────────────────── */

export const applyTaskSchema = z.object({
  taskId: z.string().min(1, "ID tugas wajib disertakan"),
  note: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export const curateApplicationSchema = z.object({
  taskId: z.string().min(1, "ID tugas wajib disertakan"),
  applicationId: z.string().min(1, "ID lamaran wajib disertakan"),
  status: z.enum(["ACCEPTED", "REJECTED"], {
    error: "Status kurasi harus ACCEPTED atau REJECTED",
  }),
});

export const completeTaskSchema = z.object({
  taskId: z.string().min(1, "ID tugas wajib disertakan"),
});

/* ── Type Exports ────────────────────────────────────────── */

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PostTaskInput = z.infer<typeof postTaskSchema>;
export type FilterTaskInput = z.infer<typeof filterTaskSchema>;
export type ApplyTaskInput = z.infer<typeof applyTaskSchema>;
export type CurateApplicationInput = z.infer<typeof curateApplicationSchema>;
