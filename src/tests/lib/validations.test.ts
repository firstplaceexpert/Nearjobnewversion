/**
 * Zod Validation Schemas — Unit Tests
 */
import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, postTaskSchema } from "@/lib/validations";

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validInput = {
    name: "Test User",
    email: "test@example.com",
    password: "Password1",
    confirmPassword: "Password1",
    role: "WORKER" as const,
  };

  it("accepts valid input", () => {
    const result = registerSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "password1",
      confirmPassword: "password1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      role: "ADMIN",
    });
    expect(result.success).toBe(false);
  });
});

describe("postTaskSchema — Biaya Minimum Rp2.000 & Bebas Kelipatan", () => {
  const validTask = {
    title: "Bantu Kasih Makan Kucing",
    category: "Jasa Harian",
    type: "DAILY" as const,
    description:
      "Kunjungan memberi makan kucing dan membersihkan litter box dengan teliti.",
    location: "Sleman, Yogyakarta",
    budget: 2000,
    scheduleDate: "2026-10-10",
    scheduleTime: "08:00",
  };

  it("menerima biaya minimum tepat Rp2.000", () => {
    const result = postTaskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
  });

  it("menerima nominal bebas yang bukan kelipatan bulat (Rp2.500, Rp7.350, Rp12.345)", () => {
    expect(postTaskSchema.safeParse({ ...validTask, budget: 2500 }).success).toBe(true);
    expect(postTaskSchema.safeParse({ ...validTask, budget: 7350 }).success).toBe(true);
    expect(postTaskSchema.safeParse({ ...validTask, budget: 12345 }).success).toBe(true);
  });

  it("menolak biaya di bawah minimum Rp2.000 (contoh Rp1.999)", () => {
    const result = postTaskSchema.safeParse({ ...validTask, budget: 1999 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("minimal Rp2.000");
    }
  });

  it("menolak biaya bernilai 0 atau negatif", () => {
    expect(postTaskSchema.safeParse({ ...validTask, budget: 0 }).success).toBe(false);
    expect(postTaskSchema.safeParse({ ...validTask, budget: -5000 }).success).toBe(false);
  });
});
