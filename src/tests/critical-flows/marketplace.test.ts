import { describe, it, expect } from "vitest";
import { marketplaceStore } from "@/lib/marketplace-store";
import { postTaskSchema, applyTaskSchema } from "@/lib/validations";

describe("Critical Marketplace Flow — End-to-End Business Logic", () => {
  const posterId = "usr-poster-budi";
  const worker1Id = "usr-worker-siti";
  const worker2Id = "usr-worker-reza";
  const otherPosterId = "usr-poster-hendra";

  let createdTaskId: string;

  describe("1. Alur Posting Tugas (Post Task)", () => {
    it("berhasil membuat tugas baru dengan data valid dan akun Poster", () => {
      const taskInput = {
        title: "Bantu Bersihkan Gudang Kantor",
        category: "Jasa Harian",
        type: "DAILY" as const,
        description: "Dibutuhkan bantuan angkat kardus dan merapikan arsip kantor 4 jam.",
        location: "Kuningan, Jakarta Selatan",
        budget: 120_000,
        scheduleDate: "2026-10-10",
        scheduleTime: "09:00 - 13:00 WIB",
      };

      // Validasi Zod
      const parsed = postTaskSchema.safeParse(taskInput);
      expect(parsed.success).toBe(true);

      const newTask = marketplaceStore.createTask(posterId, taskInput);
      expect(newTask).toBeDefined();
      expect(newTask.id).toMatch(/^tsk-/);
      expect(newTask.status).toBe("OPEN");
      expect(newTask.budget).toBe(120_000);
      expect(newTask.posterId).toBe(posterId);

      createdTaskId = newTask.id;
    });

    it("menolak posting tugas jika akun bukan peran POSTER", () => {
      expect(() =>
        marketplaceStore.createTask(worker1Id, {
          title: "Tugas Ilegal dari Worker",
          category: "Jasa Harian",
          description: "Deskripsi tugas yang tidak boleh dibuat oleh worker.",
          location: "Jakarta",
          budget: 50_000,
          scheduleDate: "2026-10-10",
          scheduleTime: "10:00",
        }),
      ).toThrow("Hanya akun Pemberi Tugas (Poster) yang dapat memposting pekerjaan");
    });

    it("menolak posting tugas jika budget di bawah batas minimal Rp2.000", () => {
      const invalidInput = {
        title: "Tugas Terlalu Murah",
        category: "Jasa Harian",
        type: "DAILY" as const,
        description:
          "Deskripsi tugas dengan budget tidak manusiawi di bawah dua ribu rupiah.",
        location: "Jakarta",
        budget: 1_000,
        scheduleDate: "2026-10-10",
        scheduleTime: "10:00",
      };

      const parsed = postTaskSchema.safeParse(invalidInput);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.flatten().fieldErrors.budget?.[0]).toContain(
          "minimal Rp2.000",
        );
      }
    });
  });

  describe("2. Alur Pelamaran Tugas (Apply Task)", () => {
    it("berhasil melamar tugas jika akun Worker dan tugas berstatus OPEN", () => {
      const applyInput = {
        taskId: createdTaskId,
        note: "Saya berpengalaman dan siap bekerja tepat waktu.",
      };

      const parsed = applyTaskSchema.safeParse(applyInput);
      expect(parsed.success).toBe(true);

      const application = marketplaceStore.applyForTask(
        worker1Id,
        createdTaskId,
        applyInput.note,
      );

      expect(application).toBeDefined();
      expect(application.status).toBe("PENDING");
      expect(application.workerId).toBe(worker1Id);
      expect(application.taskId).toBe(createdTaskId);
    });

    it("menolak jika poster mencoba melamar tugas buatannya sendiri (Anti Self-Apply)", () => {
      expect(() =>
        marketplaceStore.applyForTask(
          posterId,
          createdTaskId,
          "Saya lamar tugas sendiri",
        ),
      ).toThrow("Pemberi tugas tidak dapat melamar tugas miliknya sendiri");
    });

    it("menolak jika worker mencoba melamar dua kali pada tugas yang sama (Anti Duplicate)", () => {
      expect(() =>
        marketplaceStore.applyForTask(worker1Id, createdTaskId, "Lamaran kedua"),
      ).toThrow("Anda sudah melamar pekerjaan ini sebelumnya");
    });

    it("memungkinkan worker kedua melamar tugas yang sama", () => {
      const application2 = marketplaceStore.applyForTask(
        worker2Id,
        createdTaskId,
        "Saya juga berminat.",
      );
      expect(application2.status).toBe("PENDING");
      expect(application2.workerId).toBe(worker2Id);
    });
  });

  describe("3. Alur Kurasi & Kepemilikan (Curation & Ownership Check)", () => {
    it("menolak akses kurasi jika user bukan pembuat tugas (Broken Access Control Mitigation)", () => {
      expect(() =>
        marketplaceStore.getApplicationsByTaskId(createdTaskId, otherPosterId),
      ).toThrow("Akses ditolak: Anda bukan pemilik tugas ini");
    });

    it("menolak keputusan kurasi jika dilakukan oleh user yang bukan poster tugas", () => {
      const apps = marketplaceStore.getApplicationsByTaskId(createdTaskId, posterId);
      const targetApp = apps[0];

      expect(() =>
        marketplaceStore.curateApplication(
          otherPosterId,
          createdTaskId,
          targetApp.id,
          "ACCEPTED",
        ),
      ).toThrow("Akses ditolak: Hanya pemilik tugas yang berhak mengkurasi pelamar");
    });

    it("berhasil menerima pelamar, mengubah status tugas jadi IN_PROGRESS, dan mencatat transaksi komisi dinamis", () => {
      const apps = marketplaceStore.getApplicationsByTaskId(createdTaskId, posterId);
      const appWorker1 = apps.find((a) => a.workerId === worker1Id)!;

      const result = marketplaceStore.curateApplication(
        posterId,
        createdTaskId,
        appWorker1.id,
        "ACCEPTED",
      );

      expect(result.application.status).toBe("ACCEPTED");

      // Periksa status tugas
      const task = marketplaceStore.getTaskById(createdTaskId);
      expect(task?.status).toBe("IN_PROGRESS");

      // Periksa kalkulasi komisi platform pada transaksi
      // Budget: Rp120.000 (Komisi flat 10%)
      expect(result.transaction).toBeDefined();
      expect(result.transaction?.amount).toBe(120_000);
      expect(result.transaction?.commissionRate).toBe(0.1);
      expect(result.transaction?.commissionAmount).toBe(12_000); // 120.000 * 0.10
      expect(result.transaction?.netAmount).toBe(108_000); // 120.000 - 12.000
      expect(result.transaction?.status).toBe("PENDING");
    });

    it("berhasil menolak pelamar kedua dan memperbarui status lamaran menjadi REJECTED", () => {
      const apps = marketplaceStore.getApplicationsByTaskId(createdTaskId, posterId);
      const appWorker2 = apps.find((a) => a.workerId === worker2Id)!;

      const result = marketplaceStore.curateApplication(
        posterId,
        createdTaskId,
        appWorker2.id,
        "REJECTED",
      );

      expect(result.application.status).toBe("REJECTED");
    });
  });

  describe("4. Alur Penyelesaian Tugas & Pencairan Komisi (Completion)", () => {
    it("menolak penyelesaian tugas jika dilakukan oleh bukan pemilik tugas", () => {
      expect(() => marketplaceStore.completeTask(otherPosterId, createdTaskId)).toThrow(
        "Akses ditolak",
      );
    });

    it("berhasil menyelesaikan tugas dan mengubah status transaksi menjadi PAID", () => {
      const { task, transaction } = marketplaceStore.completeTask(
        posterId,
        createdTaskId,
      );

      expect(task.status).toBe("COMPLETED");
      expect(transaction?.status).toBe("PAID");

      // Periksa ringkasan penghasilan worker1
      const earnings = marketplaceStore.getWorkerEarningsSummary(worker1Id);
      expect(earnings.totalEarned).toBeGreaterThanOrEqual(108_000);
      expect(earnings.totalCompletedTasks).toBeGreaterThanOrEqual(1);
    });
  });
});
