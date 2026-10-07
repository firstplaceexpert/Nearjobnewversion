/**
 * NEAR JOB — Central Marketplace Data Layer & Repository
 *
 * Implements business operations, database access, authorization checks,
 * in-memory state preservation, and commission calculations.
 */
import { calculateCommission } from "@/features/payments/services/calculateCommission";
import type {
  TaskItem,
  ApplicationItem,
  TransactionItem,
  NotificationItem,
  UserSummary,
  ChatMessage,
  WalletSummary,
  LiveOrderTracking,
  MitraProfile,
  MitraIncomingOrder,
  MitraActiveOrder,
} from "@/features/tasks/types";
import type { JobType, TaskStatus } from "@/lib/constants";

export interface OtpRecord {
  phone: string;
  code: string;
  name: string;
  role: "POSTER" | "WORKER";
  ktpImage?: string | null;
  expiresAt: number;
}

// Global in-memory state singleton for persistence across dev reloads
declare global {
  var __NEARJOB_DATA__:
    | {
        users: Map<string, UserSummary & { hashedPassword?: string }>;
        tasks: Map<string, TaskItem>;
        applications: Map<string, ApplicationItem>;
        transactions: Map<string, TransactionItem>;
        notifications: Map<string, NotificationItem>;
        chats: Map<string, ChatMessage[]>;
        wallets: Map<string, WalletSummary>;
        trackings: Map<string, LiveOrderTracking>;
        mitraProfiles: Map<string, MitraProfile>;
        mitraActiveOrders: Map<string, MitraActiveOrder>;
        otps: Map<string, OtpRecord>;
      }
    | undefined;
}

let idCounter = 0;
function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

function initStore() {
  if (globalThis.__NEARJOB_DATA__) {
    if (!globalThis.__NEARJOB_DATA__.wallets) {
      globalThis.__NEARJOB_DATA__.wallets = new Map();
    }
    if (!globalThis.__NEARJOB_DATA__.chats) {
      globalThis.__NEARJOB_DATA__.chats = new Map();
    }
    if (!globalThis.__NEARJOB_DATA__.trackings) {
      globalThis.__NEARJOB_DATA__.trackings = new Map();
    }
    if (!globalThis.__NEARJOB_DATA__.mitraProfiles) {
      globalThis.__NEARJOB_DATA__.mitraProfiles = new Map();
    }
    if (!globalThis.__NEARJOB_DATA__.mitraActiveOrders) {
      globalThis.__NEARJOB_DATA__.mitraActiveOrders = new Map();
    }
    if (!globalThis.__NEARJOB_DATA__.otps) {
      globalThis.__NEARJOB_DATA__.otps = new Map();
    }
    return globalThis.__NEARJOB_DATA__;
  }

  const users = new Map<string, UserSummary & { hashedPassword?: string }>();
  const tasks = new Map<string, TaskItem>();
  const applications = new Map<string, ApplicationItem>();
  const transactions = new Map<string, TransactionItem>();
  const notifications = new Map<string, NotificationItem>();
  const wallets = new Map<string, WalletSummary>();
  const chats = new Map<string, ChatMessage[]>();
  const trackings = new Map<string, LiveOrderTracking>();
  const mitraProfiles = new Map<string, MitraProfile>();
  const mitraActiveOrders = new Map<string, MitraActiveOrder>();
  const otps = new Map<string, OtpRecord>();

  // ── Seed Users ───────────────────────────────────────────────
  const poster1: UserSummary = {
    id: "usr-poster-budi",
    name: "Rois hadi",
    email: "roishp01@gmail.com",
    phone: "+6281327446342",
    role: "POSTER",
  };
  const poster2: UserSummary = {
    id: "usr-poster-hendra",
    name: "Hendra Wijaya",
    email: "hendra@nearjob.id",
    role: "POSTER",
  };
  const worker1: UserSummary = {
    id: "usr-worker-siti",
    name: "Rois hadi",
    email: "roishp01@gmail.com",
    phone: "+6281327446342",
    role: "WORKER",
  };
  const worker2: UserSummary = {
    id: "usr-worker-reza",
    name: "Reza Pratama",
    email: "reza@nearjob.id",
    role: "WORKER",
  };

  users.set(poster1.id, poster1);
  users.set(poster2.id, poster2);
  users.set(worker1.id, worker1);
  users.set(worker2.id, worker2);

  // ── Seed Tasks ───────────────────────────────────────────────
  const initialTasks: TaskItem[] = [
    {
      id: "tsk-booth-senayan",
      title: "Jaga Booth Pameran UMKM di Jogja Expo Center (JEC)",
      description:
        "Dibutuhkan 1 orang staf jaga booth minuman herbal nusantara selama 1 hari penuh di JEC Banguntapan. Tugas meliputi melayani pengunjung, menjelaskan produk, dan mencatat transaksi kasir mini.",
      category: "Jaga Booth",
      type: "DAILY",
      location: "Jogja Expo Center (JEC), Bantul, Yogyakarta",
      latitude: -7.7984,
      longitude: 110.4055,
      budget: 150000,
      scheduleDate: "2026-10-02",
      scheduleTime: "09:00 - 17:00 WIB",
      status: "OPEN",
      posterId: poster1.id,
      poster: poster1,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "tsk-angkut-kost",
      title: "Bantu Angkut Barang Pindahan Kost Pogung",
      description:
        "Butuh bantuan tenaga angkut barang (kardus baju, rak lipat, kasur busa) dari lantai 2 kos ke mobil pickup. Jarak dekat area Pogung UGM, estimasi pengerjaan 2 jam.",
      category: "Angkut Barang",
      type: "DAILY",
      location: "Pogung Dalangan, Sinduadi, Mlati, Sleman",
      latitude: -7.761,
      longitude: 110.373,
      budget: 85000,
      scheduleDate: "2026-10-01",
      scheduleTime: "13:00 - 16:00 WIB",
      status: "OPEN",
      posterId: poster1.id,
      poster: poster1,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: "tsk-desain-menu",
      title: "Desain Menu & Banner Promosi Coffee Shop Gejayan",
      description:
        "Membuat revisi 2 lembar desain menu minuman kekinian dan 1 banner sosial media format Instagram Feed. Bahan teks dan foto produk sudah disiapkan dalam Google Drive.",
      category: "IT & Desain",
      type: "FREELANCE",
      location: "Jl. Affandi (Gejayan), Caturtunggal, Sleman",
      latitude: -7.768,
      longitude: 110.3895,
      budget: 250000,
      scheduleDate: "2026-10-05",
      scheduleTime: "Fleksibel (Deadline 3 hari)",
      status: "OPEN",
      posterId: poster2.id,
      poster: poster2,
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
    {
      id: "tsk-kucing-kuningan",
      title: "Kasih Makan Kucing & Bersih Pasir (NearPet)",
      description:
        "Kunjungan 1 jam untuk kasih makan 2 ekor kucing persia, ganti air minum bersih, bersihkan pasir pup litterbox, dan kirimkan update video singkat.",
      category: "Jasa Harian",
      type: "DAILY",
      location: "Apartemen Student Park, Seturan, Sleman",
      latitude: -7.7788,
      longitude: 110.4079,
      budget: 45000,
      scheduleDate: "2026-10-01",
      scheduleTime: "11:00 WIB",
      status: "OPEN",
      posterId: poster1.id,
      poster: poster1,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "tsk-bersih-sudirman",
      title: "Beres-Beres Kamar Kosan & Kamar Mandi (NearClean)",
      description:
        "Sapu lantai, pel menyeluruh, sikat kerak lantai kamar mandi, ganti sprei kasur dan buang tumpukan sampah kosan.",
      category: "Pertukangan & Servis",
      type: "DAILY",
      location: "Kaliurang Km 5.2, Caturtunggal, Sleman",
      latitude: -7.7565,
      longitude: 110.382,
      budget: 70000,
      scheduleDate: "2026-10-01",
      scheduleTime: "14:00 WIB",
      status: "OPEN",
      posterId: poster2.id,
      poster: poster2,
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    {
      id: "tsk-servis-listrik",
      title: "Perbaikan Stop Kontak & Pasang Lampu Gantung",
      description:
        "Pemasangan 2 unit lampu gantung ruang makan dan perbaikan 1 stop kontak konslet di rumah. Diutamakan yang berpengalaman dasar kelistrikan rumah tangga.",
      category: "Pertukangan & Servis",
      type: "DAILY",
      location: "Kotagede, Kota Yogyakarta",
      latitude: -7.8285,
      longitude: 110.3995,
      budget: 95000,
      scheduleDate: "2026-10-03",
      scheduleTime: "10:00 - 12:00 WIB",
      status: "OPEN",
      posterId: poster2.id,
      poster: poster2,
      createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    },
    {
      id: "tsk-foto-lamaran",
      title: "Dokumentasi Foto Acara Lamaran Keluarga",
      description:
        "Fotografer santai untuk mendokumentasikan acara lamaran keluarga durasi 3 jam. Menggunakan kamera mirrorless/DSLR sendiri, penyerahan file foto mentah + 20 foto edit ringan.",
      category: "Fotografi & Event",
      type: "PART_TIME",
      location: "Alun-Alun Kidul, Kraton, Kota Yogyakarta",
      latitude: -7.8118,
      longitude: 110.3632,
      budget: 450000,
      scheduleDate: "2026-10-06",
      scheduleTime: "08:30 - 11:30 WIB",
      status: "OPEN",
      posterId: poster1.id,
      poster: poster1,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: "tsk-kasir-weekend",
      title: "Staf Kasir Pengganti Weekend Cafe Malioboro",
      description:
        "Membutuhkan 1 kasir pengganti untuk hari Sabtu & Minggu menggunakan sistem POS berbasis iPad. Training singkat 30 menit akan diberikan sebelum shift dimulai.",
      category: "Kasir & Ritel",
      type: "PART_TIME",
      location: "Jl. Malioboro, Sosromenduran, Kota Yogyakarta",
      latitude: -7.7925,
      longitude: 110.3658,
      budget: 200000,
      scheduleDate: "2026-10-04",
      scheduleTime: "12:00 - 20:00 WIB",
      status: "OPEN",
      posterId: poster2.id,
      poster: poster2,
      createdAt: new Date(Date.now() - 3600000 * 50).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 50).toISOString(),
    },
  ];

  for (const t of initialTasks) {
    tasks.set(t.id, t);
  }

  // ── Seed Sample Applications ──────────────────────────────────
  const app1: ApplicationItem = {
    id: "app-siti-booth",
    taskId: "tsk-booth-senayan",
    workerId: worker1.id,
    worker: worker1,
    status: "PENDING",
    appliedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    note: "Halo Pak Budi, saya pernah berpengalaman menjaga booth kopi di ICE BSD. Siap bekerja ramah dan jujur!",
  };
  const app2: ApplicationItem = {
    id: "app-reza-booth",
    taskId: "tsk-booth-senayan",
    workerId: worker2.id,
    worker: worker2,
    status: "PENDING",
    appliedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    note: "Saya tinggal dekat Senayan dan terbiasa dengan sistem kasir mini. Sangat antusias!",
  };
  const app3: ApplicationItem = {
    id: "app-siti-angkut",
    taskId: "tsk-angkut-kost",
    workerId: worker1.id,
    worker: worker1,
    status: "PENDING",
    appliedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    note: "Siap membantu angkat barang, fisik bugar dan tepat waktu.",
  };

  applications.set(app1.id, app1);
  applications.set(app2.id, app2);
  applications.set(app3.id, app3);

  // ── Seed Notifications ────────────────────────────────────────
  const notif1: NotificationItem = {
    id: "notif-1",
    userId: poster1.id,
    title: "Pelamar Baru",
    message: "Siti Rahma telah melamar pekerjaan 'Jaga Booth Pameran UMKM di Senayan'.",
    type: "NEW_APPLICATION",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  };
  const notif2: NotificationItem = {
    id: "notif-2",
    userId: poster1.id,
    title: "Pelamar Baru",
    message: "Reza Pratama telah melamar pekerjaan 'Jaga Booth Pameran UMKM di Senayan'.",
    type: "NEW_APPLICATION",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  };

  notifications.set(notif1.id, notif1);
  notifications.set(notif2.id, notif2);

  // ── Seed Wallets ─────────────────────────────────────────────
  wallets.set(poster1.id, {
    userId: poster1.id,
    balance: 1450000,
    pendingBalance: 65000,
    transactions: [
      {
        id: "wtx-1",
        userId: poster1.id,
        type: "TOPUP",
        amount: 1500000,
        description: "Top Up NearPay via BCA Virtual Account",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "wtx-2",
        userId: poster1.id,
        type: "PAYMENT",
        amount: 50000,
        description: "Deposit Tugas 'Antar Dokumen Kontrak Cepat'",
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ],
  });

  wallets.set(worker1.id, {
    userId: worker1.id,
    balance: 820000,
    pendingBalance: 135000,
    transactions: [
      {
        id: "wtx-3",
        userId: worker1.id,
        type: "RECEIVE",
        amount: 450000,
        description: "Pencairan Tugas 'Dokumentasi Foto Acara'",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: "wtx-4",
        userId: worker1.id,
        type: "RECEIVE",
        amount: 370000,
        description: "Pencairan Tugas 'Jaga Booth Senayan'",
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
  });

  // ── Seed Chat Messages ───────────────────────────────────────
  chats.set("tsk-booth-senayan", [
    {
      id: "msg-1",
      taskId: "tsk-booth-senayan",
      senderId: poster1.id,
      senderName: poster1.name,
      senderRole: "POSTER",
      text: "Halo kak Siti, terima kasih sudah mengajukan diri ya! Mau tanya, apakah besok bisa stand by dari jam 08:30 WIB?",
      createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    },
    {
      id: "msg-2",
      taskId: "tsk-booth-senayan",
      senderId: worker1.id,
      senderName: worker1.name,
      senderRole: "WORKER",
      text: "Halo Pak Budi! Bisa sekali pak, saya usahakan tiba jam 08:15 WIB di lobi utama JCC Senayan.",
      createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    },
    {
      id: "msg-3",
      taskId: "tsk-booth-senayan",
      senderId: poster1.id,
      senderName: poster1.name,
      senderRole: "POSTER",
      text: "Mantap! Seragam booth bebas rapi ya kak, pakai celana gelap.",
      createdAt: new Date(Date.now() - 3600000 * 1.0).toISOString(),
    },
  ]);

  // ── Seed Live Dispatch Tracking ──────────────────────────────
  trackings.set("tsk-angkut-kost", {
    id: "trk-angkut-1",
    taskId: "tsk-angkut-kost",
    status: "ON_THE_WAY",
    workerName: "Reza Pratama",
    workerPhone: "0812-3344-5566",
    workerRating: 4.9,
    workerVehicle: "Pickup Suzuki Carry (B 9142 TXL)",
    workerAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    workerLat: -7.765,
    workerLng: 110.375,
    etaMinutes: 8,
    distanceKm: 1.4,
    destinationLocation: "Pogung Dalangan, Sinduadi, Mlati, Sleman",
    budget: 85000,
    updatedAt: new Date().toISOString(),
  });

  // ── Seed Mitra Partner Profile ───────────────────────────────
  mitraProfiles.set(worker1.id, {
    id: worker1.id,
    name: worker1.name,
    email: worker1.email,
    phone: "0812-9988-7722",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    vehicle: "Honda Beat eSP 110cc",
    plateNumber: "AB 3819 YZ",
    rating: 4.98,
    totalTrips: 184,
    acceptanceRate: 98,
    completionRate: 100,
    isOnline: true,
    todayEarnings: 245000,
    todayTrips: 4,
    dailyGoalTrips: 6,
    points: 80,
  });

  const store = {
    users,
    tasks,
    applications,
    transactions,
    notifications,
    chats,
    wallets,
    trackings,
    mitraProfiles,
    mitraActiveOrders,
    otps,
  };
  globalThis.__NEARJOB_DATA__ = store;
  return store;
}

export const marketplaceStore = {
  // ── Users ───────────────────────────────────────────────────
  getUser(userId: string): UserSummary | undefined {
    const store = initStore();
    return store.users.get(userId);
  },

  getAllUsers(): UserSummary[] {
    const store = initStore();
    return Array.from(store.users.values());
  },

  findUserByPhone(phone: string): UserSummary | undefined {
    const store = initStore();
    const cleanPhone = phone.replace(/\D/g, "");
    return Array.from(store.users.values()).find(
      (u) => u.phone && u.phone.replace(/\D/g, "") === cleanPhone,
    );
  },

  registerUserWithPhone(input: {
    name: string;
    phone: string;
    role: "POSTER" | "WORKER";
    ktpImage?: string | null;
  }): UserSummary {
    const store = initStore();
    const cleanPhone = input.phone.replace(/\D/g, "");

    // Check if user with phone already exists
    const existingUser = Array.from(store.users.values()).find(
      (u) => u.phone && u.phone.replace(/\D/g, "") === cleanPhone,
    );

    if (existingUser) {
      existingUser.name = input.name;
      existingUser.role = input.role;
      if (input.ktpImage) {
        existingUser.ktpImage = input.ktpImage;
        existingUser.isKtpVerified = true;
      }
      store.users.set(existingUser.id, existingUser);
      return existingUser;
    }

    const userId = generateId("usr");
    const newUser: UserSummary = {
      id: userId,
      name: input.name,
      phone: input.phone,
      email: `${cleanPhone}@nearjob.id`,
      role: input.role,
      ktpImage: input.ktpImage || null,
      isKtpVerified: input.role === "WORKER" ? !!input.ktpImage : false,
    };

    store.users.set(userId, newUser);

    // If worker, also ensure mitra profile exists
    if (input.role === "WORKER" && !store.mitraProfiles.has(userId)) {
      store.mitraProfiles.set(userId, {
        id: userId,
        name: input.name,
        email: `${cleanPhone}@nearjob.id`,
        phone: input.phone,
        avatar:
          input.ktpImage ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        vehicle: "Honda Vario 160cc",
        plateNumber: "AB 4812 XX",
        rating: 5.0,
        totalTrips: 0,
        acceptanceRate: 100,
        completionRate: 100,
        isOnline: true,
        todayEarnings: 0,
        todayTrips: 0,
        dailyGoalTrips: 5,
        points: 50,
        ktpImage: input.ktpImage || null,
        isKtpVerified: !!input.ktpImage,
      });
    }

    return newUser;
  },

  // ── OTP Management ──────────────────────────────────────────
  saveOtp(record: OtpRecord) {
    const store = initStore();
    if (!store.otps) store.otps = new Map();
    const cleanPhone = record.phone.replace(/\D/g, "");
    store.otps.set(cleanPhone, record);
  },

  getOtp(phone: string): OtpRecord | undefined {
    const store = initStore();
    if (!store.otps) store.otps = new Map();
    const cleanPhone = phone.replace(/\D/g, "");
    return store.otps.get(cleanPhone);
  },

  deleteOtp(phone: string) {
    const store = initStore();
    if (!store.otps) store.otps = new Map();
    const cleanPhone = phone.replace(/\D/g, "");
    store.otps.delete(cleanPhone);
  },

  // ── Tasks ───────────────────────────────────────────────────
  getTasks(filter?: {
    search?: string;
    category?: string;
    type?: string;
    location?: string;
    status?: TaskStatus;
    posterId?: string;
    currentUserId?: string;
  }): TaskItem[] {
    const store = initStore();
    let result = Array.from(store.tasks.values());

    if (filter?.status) {
      result = result.filter((t) => t.status === filter.status);
    }

    if (filter?.posterId) {
      result = result.filter((t) => t.posterId === filter.posterId);
    }

    if (filter?.category && filter.category !== "Semua Kategori") {
      result = result.filter(
        (t) => t.category.toLowerCase() === filter.category!.toLowerCase(),
      );
    }

    if (filter?.type && filter.type !== "ALL") {
      result = result.filter((t) => t.type === filter.type);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      );
    }

    if (filter?.location) {
      const loc = filter.location.toLowerCase();
      result = result.filter((t) => t.location.toLowerCase().includes(loc));
    }

    // Attach applications count and hasApplied flag
    return result
      .map((t) => {
        const taskApps = Array.from(store.applications.values()).filter(
          (a) => a.taskId === t.id,
        );
        const hasApplied = filter?.currentUserId
          ? taskApps.some((a) => a.workerId === filter.currentUserId)
          : false;

        return {
          ...t,
          applicationsCount: taskApps.length,
          hasApplied,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getTaskById(taskId: string, currentUserId?: string): TaskItem | undefined {
    const store = initStore();
    const task = store.tasks.get(taskId);
    if (!task) return undefined;

    const taskApps = Array.from(store.applications.values()).filter(
      (a) => a.taskId === task.id,
    );
    const hasApplied = currentUserId
      ? taskApps.some((a) => a.workerId === currentUserId)
      : false;

    return {
      ...task,
      applicationsCount: taskApps.length,
      hasApplied,
    };
  },

  createTask(
    posterId: string,
    data: {
      title: string;
      category: string;
      type?: JobType;
      description: string;
      location: string;
      latitude?: number | null;
      longitude?: number | null;
      budget: number;
      scheduleDate: string;
      scheduleTime: string;
      voucherCode?: string | null;
      discountAmount?: number | null;
    },
  ): TaskItem {
    const store = initStore();
    const poster = store.users.get(posterId);
    if (!poster) {
      throw new Error("Pengguna tidak ditemukan");
    }

    if (poster.role !== "POSTER") {
      throw new Error(
        "Hanya akun Pemberi Tugas (Poster) yang dapat memposting pekerjaan",
      );
    }

    const discountAmount = data.discountAmount || 0;
    const finalPaidAmount = Math.max(2000, data.budget - discountAmount);

    const taskId = generateId("tsk");
    const newTask: TaskItem = {
      id: taskId,
      title: data.title,
      description: data.description,
      category: data.category,
      type: data.type || "DAILY",
      location: data.location,
      latitude:
        data.latitude ?? Number((-6.22 + (Math.random() - 0.5) * 0.04).toFixed(4)),
      longitude:
        data.longitude ?? Number((106.825 + (Math.random() - 0.5) * 0.04).toFixed(4)),
      budget: data.budget,
      scheduleDate: data.scheduleDate,
      scheduleTime: data.scheduleTime,
      status: "OPEN",
      posterId: poster.id,
      poster,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      applicationsCount: 0,
      hasApplied: false,
      voucherCode: data.voucherCode || null,
      discountAmount: data.discountAmount || null,
      finalPaidAmount,
    };

    store.tasks.set(taskId, newTask);
    return newTask;
  },

  // ── Applications ────────────────────────────────────────────
  getApplicationsByTaskId(taskId: string, requestedByUserId: string): ApplicationItem[] {
    const store = initStore();
    const task = store.tasks.get(taskId);
    if (!task) {
      throw new Error("Tugas tidak ditemukan");
    }

    // Authorization: Only the poster of this task can view its applicants
    if (task.posterId !== requestedByUserId) {
      throw new Error("Akses ditolak: Anda bukan pemilik tugas ini");
    }

    return Array.from(store.applications.values())
      .filter((a) => a.taskId === taskId)
      .map((a) => ({
        ...a,
        task,
      }))
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  },

  getApplicationsByWorker(workerId: string): ApplicationItem[] {
    const store = initStore();
    return Array.from(store.applications.values())
      .filter((a) => a.workerId === workerId)
      .map((a) => ({
        ...a,
        task: store.tasks.get(a.taskId),
      }))
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  },

  applyForTask(workerId: string, taskId: string, note?: string): ApplicationItem {
    const store = initStore();
    const worker = store.users.get(workerId);
    if (!worker) {
      throw new Error("Pengguna tidak ditemukan");
    }

    const task = store.tasks.get(taskId);
    if (!task) {
      throw new Error("Tugas tidak ditemukan");
    }

    if (task.posterId === workerId) {
      throw new Error("Pemberi tugas tidak dapat melamar tugas miliknya sendiri");
    }

    if (task.status !== "OPEN") {
      throw new Error("Tugas ini sudah tidak menerima lamaran baru");
    }

    // Check if already applied
    const alreadyApplied = Array.from(store.applications.values()).some(
      (a) => a.taskId === taskId && a.workerId === workerId,
    );
    if (alreadyApplied) {
      throw new Error("Anda sudah melamar pekerjaan ini sebelumnya");
    }

    const appId = generateId("app");
    const newApp: ApplicationItem = {
      id: appId,
      taskId,
      task,
      workerId,
      worker,
      status: "PENDING",
      appliedAt: new Date().toISOString(),
      note,
    };

    store.applications.set(appId, newApp);

    // Notify Poster
    const notifId = generateId("notif");
    store.notifications.set(notifId, {
      id: notifId,
      userId: task.posterId,
      title: "Pelamar Baru!",
      message: `${worker.name} telah melamar tugas "${task.title}".`,
      type: "NEW_APPLICATION",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return newApp;
  },

  curateApplication(
    posterId: string,
    taskId: string,
    applicationId: string,
    status: "ACCEPTED" | "REJECTED",
  ): { application: ApplicationItem; transaction?: TransactionItem } {
    const store = initStore();
    const task = store.tasks.get(taskId);
    if (!task) {
      throw new Error("Tugas tidak ditemukan");
    }

    // Server-side ownership check: Must be the task's poster!
    if (task.posterId !== posterId) {
      throw new Error(
        "Akses ditolak: Hanya pemilik tugas yang berhak mengkurasi pelamar",
      );
    }

    const app = store.applications.get(applicationId);
    if (!app || app.taskId !== taskId) {
      throw new Error("Lamaran tidak ditemukan pada tugas ini");
    }

    app.status = status;
    store.applications.set(applicationId, app);

    let transaction: TransactionItem | undefined;

    if (status === "ACCEPTED") {
      // Update task status to IN_PROGRESS
      task.status = "IN_PROGRESS";
      task.updatedAt = new Date().toISOString();
      store.tasks.set(taskId, task);

      // Automatically calculate dynamic commission
      const commission = calculateCommission(task.budget);
      const txId = generateId("tx");
      transaction = {
        id: txId,
        taskId: task.id,
        task,
        amount: commission.budget,
        commissionRate: commission.commissionRate,
        commissionAmount: commission.commissionAmount,
        netAmount: commission.netAmount,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
      store.transactions.set(txId, transaction);

      // Notify Worker
      const notifId = generateId("notif");
      store.notifications.set(notifId, {
        id: notifId,
        userId: app.workerId,
        title: "Lamaran Diterima!",
        message: `Selamat! Lamaran Anda untuk "${task.title}" telah diterima oleh ${task.poster.name}.`,
        type: "APPLICATION_ACCEPTED",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } else if (status === "REJECTED") {
      // Notify Worker of rejection
      const notifId = generateId("notif");
      store.notifications.set(notifId, {
        id: notifId,
        userId: app.workerId,
        title: "Pembaruan Lamaran",
        message: `Mohon maaf, lamaran Anda untuk "${task.title}" belum dapat diterima kali ini.`,
        type: "APPLICATION_REJECTED",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return { application: app, transaction };
  },

  completeTask(
    posterId: string,
    taskId: string,
  ): { task: TaskItem; transaction?: TransactionItem } {
    const store = initStore();
    const task = store.tasks.get(taskId);
    if (!task) {
      throw new Error("Tugas tidak ditemukan");
    }

    if (task.posterId !== posterId) {
      throw new Error(
        "Akses ditolak: Hanya pemilik tugas yang dapat menyelesaikan tugas ini",
      );
    }

    task.status = "COMPLETED";
    task.updatedAt = new Date().toISOString();
    store.tasks.set(taskId, task);

    // Update transaction to PAID if exists
    let tx = Array.from(store.transactions.values()).find((t) => t.taskId === taskId);
    if (tx) {
      tx.status = "PAID";
      store.transactions.set(tx.id, tx);
    } else {
      const commission = calculateCommission(task.budget);
      const txId = generateId("tx");
      tx = {
        id: txId,
        taskId: task.id,
        task,
        amount: commission.budget,
        commissionRate: commission.commissionRate,
        commissionAmount: commission.commissionAmount,
        netAmount: commission.netAmount,
        status: "PAID",
        createdAt: new Date().toISOString(),
      };
      store.transactions.set(txId, tx);
    }

    // Find accepted worker to notify
    const acceptedApp = Array.from(store.applications.values()).find(
      (a) => a.taskId === taskId && a.status === "ACCEPTED",
    );

    if (acceptedApp) {
      const notifId = generateId("notif");
      store.notifications.set(notifId, {
        id: notifId,
        userId: acceptedApp.workerId,
        title: "Tugas Selesai & Pembayaran Berhasil!",
        message: `Tugas "${task.title}" telah diselesaikan. Penghasilan bersih Rp${tx.netAmount.toLocaleString("id-ID")} telah dikonfirmasi.`,
        type: "TASK_COMPLETED",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return { task, transaction: tx };
  },

  // ── Worker Earnings Summary ─────────────────────────────────
  getWorkerEarningsSummary(workerId: string): {
    totalCompletedTasks: number;
    totalEarned: number;
    pendingEarnings: number;
    transactions: TransactionItem[];
  } {
    const store = initStore();
    // Get all accepted applications for this worker
    const workerApps = Array.from(store.applications.values()).filter(
      (a) =>
        a.workerId === workerId && (a.status === "ACCEPTED" || a.status === "COMPLETED"),
    );

    const taskIds = new Set(workerApps.map((a) => a.taskId));
    const workerTransactions = Array.from(store.transactions.values()).filter((tx) =>
      taskIds.has(tx.taskId),
    );

    let totalEarned = 0;
    let pendingEarnings = 0;
    let totalCompletedTasks = 0;

    for (const tx of workerTransactions) {
      if (tx.status === "PAID") {
        totalEarned += tx.netAmount;
        totalCompletedTasks++;
      } else {
        pendingEarnings += tx.netAmount;
      }
    }

    return {
      totalCompletedTasks,
      totalEarned,
      pendingEarnings,
      transactions: workerTransactions.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    };
  },

  // ── Notifications ───────────────────────────────────────────
  getNotifications(userId: string): NotificationItem[] {
    const store = initStore();
    return Array.from(store.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  markNotificationAsRead(notificationId: string, userId: string): boolean {
    const store = initStore();
    const notif = store.notifications.get(notificationId);
    if (!notif || notif.userId !== userId) return false;
    notif.isRead = true;
    store.notifications.set(notificationId, notif);
    return true;
  },

  markAllNotificationsAsRead(userId: string): void {
    const store = initStore();
    for (const [id, notif] of store.notifications) {
      if (notif.userId === userId && !notif.isRead) {
        notif.isRead = true;
        store.notifications.set(id, notif);
      }
    }
  },

  // ── NearPay Wallet ───────────────────────────────────────────
  getWallet(userId: string): WalletSummary {
    const store = initStore();
    if (!store.wallets) {
      store.wallets = new Map();
    }
    const existing = store.wallets.get(userId);
    if (existing) return existing;

    const initial: WalletSummary = {
      userId,
      balance: 500000,
      pendingBalance: 0,
      transactions: [],
    };
    store.wallets.set(userId, initial);
    return initial;
  },

  topUpWallet(userId: string, amount: number): WalletSummary {
    const store = initStore();
    if (!store.wallets) {
      store.wallets = new Map();
    }
    const current = this.getWallet(userId);
    const updated: WalletSummary = {
      ...current,
      balance: current.balance + amount,
      transactions: [
        {
          id: `wtx-${Date.now()}`,
          userId,
          type: "TOPUP",
          amount,
          description: `Top Up Saldo NearPay (+Rp ${amount.toLocaleString("id-ID")})`,
          createdAt: new Date().toISOString(),
        },
        ...current.transactions,
      ],
    };
    store.wallets.set(userId, updated);
    return updated;
  },

  // ── In-App Chat ──────────────────────────────────────────────
  getChatMessages(taskId: string): ChatMessage[] {
    const store = initStore();
    if (!store.chats) {
      store.chats = new Map();
    }
    if (!store.chats.has(taskId)) {
      const task = store.tasks.get(taskId);
      const posterName = task?.poster?.name || "Budi Santoso (Poster)";
      store.chats.set(taskId, [
        {
          id: `msg-init-1-${taskId}`,
          taskId,
          senderId: task?.posterId || "usr-poster-budi",
          senderName: posterName,
          senderRole: "POSTER",
          text: `Halo, terima kasih sudah terhubung untuk tugas "${task?.title || "pekerjaan ini"}"! Apakah ada pertanyaan atau konfirmasi jadwal?`,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: `msg-init-2-${taskId}`,
          taskId,
          senderId: "usr-worker-siti",
          senderName: "Siti Rahma (Pekerja)",
          senderRole: "WORKER",
          text: "Halo! Siap, semuanya sudah jelas. Saya sudah catat alamat dan siap datang tepat waktu ya.",
          createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        },
      ]);
    }
    return store.chats.get(taskId) || [];
  },

  sendChatMessage(taskId: string, senderId: string, text: string): ChatMessage {
    const store = initStore();
    if (!store.chats) {
      store.chats = new Map();
    }
    const user = store.users.get(senderId);

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      taskId,
      senderId,
      senderName: user?.name || "Pengguna",
      senderRole: user?.role || "WORKER",
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const currentList = store.chats.get(taskId) || [];
    currentList.push(newMessage);
    store.chats.set(taskId, currentList);

    return newMessage;
  },

  // ── Live Dispatch & Order Tracking ───────────────────────────
  getOrderTrackingByTaskId(taskId: string): LiveOrderTracking | undefined {
    const store = initStore();
    return store.trackings.get(taskId);
  },

  getActiveOrderTrackings(userId: string): LiveOrderTracking[] {
    const store = initStore();
    return Array.from(store.trackings.values()).filter((trk) => {
      const task = store.tasks.get(trk.taskId);
      if (!task) return false;
      return task.posterId === userId || trk.status !== "COMPLETED";
    });
  },

  createInstantOrder(
    posterId: string,
    data: {
      serviceName: string;
      location: string;
      budget: number;
      description: string;
      latitude?: number;
      longitude?: number;
      voucherCode?: string;
      discountAmount?: number;
      finalPaidAmount?: number;
    },
  ): { task: TaskItem; tracking: LiveOrderTracking } {
    const store = initStore();
    const poster = store.users.get(posterId);
    if (!poster) throw new Error("Pengguna tidak ditemukan");

    const discountAmount = data.discountAmount || 0;
    const finalPaidAmount =
      data.finalPaidAmount ?? Math.max(2000, data.budget - discountAmount);

    const taskId = `tsk-inst-${Date.now()}`;
    const newTask: TaskItem = {
      id: taskId,
      title: `${data.serviceName}: Bantuan Cepat di ${data.location}`,
      description: data.description,
      category: data.serviceName,
      type: "DAILY",
      location: data.location,
      latitude: data.latitude ?? -6.225,
      longitude: data.longitude ?? 106.809,
      budget: data.budget,
      scheduleDate: "Hari ini",
      scheduleTime: "Instan (NearExpress)",
      status: "IN_PROGRESS",
      posterId,
      poster,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      applicationsCount: 1,
      hasApplied: false,
      voucherCode: data.voucherCode || null,
      discountAmount: discountAmount || null,
      finalPaidAmount,
    };

    store.tasks.set(taskId, newTask);

    const tracking: LiveOrderTracking = {
      id: `trk-${Date.now()}`,
      taskId,
      status: "ON_THE_WAY",
      workerName: "Bagus Setiawan",
      workerPhone: "0813-8899-7711",
      workerRating: 4.96,
      workerVehicle: "Honda Vario 160 (B 4721 SBY)",
      workerAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      workerLat: (data.latitude ?? -6.225) + 0.005,
      workerLng: (data.longitude ?? 106.809) + 0.005,
      etaMinutes: 7,
      distanceKm: 1.1,
      destinationLocation: data.location,
      budget: finalPaidAmount,
      updatedAt: new Date().toISOString(),
    };

    store.trackings.set(taskId, tracking);

    // Initial welcome chat
    store.chats.set(taskId, [
      {
        id: `msg-${Date.now()}`,
        taskId,
        senderId: "usr-worker-bagus",
        senderName: "Bagus Setiawan (Mitra NearExpress)",
        senderRole: "WORKER",
        text: `Halo ${poster.name}! Pesanan ${data.serviceName} sudah saya terima. Saya sedang meluncur ke ${data.location} ya.`,
        createdAt: new Date().toISOString(),
      },
    ]);

    return { task: newTask, tracking };
  },

  // ── NEAR MITRA (Partner / GoPartner Mode Methods) ───────────
  getMitraProfile(workerId: string = "usr-worker-siti"): MitraProfile {
    const store = initStore();
    const existing = store.mitraProfiles.get(workerId);
    if (existing) return existing;

    const user = store.users.get(workerId);
    const profile: MitraProfile = {
      id: workerId,
      name: user?.name || "Siti Rahma",
      email: user?.email || "siti@nearjob.id",
      phone: "0812-9988-7722",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      vehicle: "Honda Beat eSP 110cc",
      plateNumber: "B 3819 TZG",
      rating: 4.98,
      totalTrips: 184,
      acceptanceRate: 98,
      completionRate: 100,
      isOnline: true,
      todayEarnings: 245000,
      todayTrips: 4,
      dailyGoalTrips: 6,
      points: 80,
    };
    store.mitraProfiles.set(workerId, profile);
    return profile;
  },

  setMitraOnline(workerId: string = "usr-worker-siti", isOnline: boolean): boolean {
    const store = initStore();
    const profile = this.getMitraProfile(workerId);
    profile.isOnline = isOnline;
    store.mitraProfiles.set(workerId, profile);
    return isOnline;
  },

  getMitraActiveOrder(workerId: string = "usr-worker-siti"): MitraActiveOrder | null {
    const store = initStore();
    return store.mitraActiveOrders.get(workerId) || null;
  },

  getMitraIncomingOrder(workerId: string = "usr-worker-siti"): MitraIncomingOrder | null {
    const store = initStore();
    const profile = this.getMitraProfile(workerId);
    if (!profile.isOnline) return null;

    // If already has an active ongoing job, don't show incoming order
    const active = store.mitraActiveOrders.get(workerId);
    if (active && active.step !== "COMPLETED") return null;

    // Find first OPEN task that worker hasn't applied to yet
    const openTasks = Array.from(store.tasks.values()).filter((t) => t.status === "OPEN");
    if (openTasks.length === 0) return null;

    const target = openTasks[0];
    const comm = calculateCommission(target.budget);

    return {
      id: `ord-${target.id}`,
      taskId: target.id,
      title: target.title,
      category: target.category,
      pickupLocation: target.location,
      destinationLocation: "Radius 2.5 km dari Lokasi Anda",
      distanceKm: 1.2,
      budget: target.budget,
      netEarnings: comm.netAmount,
      customerName: target.poster.name,
      customerRating: 4.9,
      expiresInSeconds: 20,
      notes: target.description,
    };
  },

  acceptMitraOrder(
    workerId: string = "usr-worker-siti",
    taskId: string,
  ): MitraActiveOrder {
    const store = initStore();

    // Pastikan mitra hanya dapat mengambil 1 orderan aktif dalam satu waktu
    const existingActive = store.mitraActiveOrders.get(workerId);
    if (existingActive && existingActive.step !== "COMPLETED") {
      throw new Error(
        `Anda sedang menjalankan order "${existingActive.title}". Selesaikan order aktif ini terlebih dahulu sebelum mengambil order baru.`,
      );
    }

    const task = store.tasks.get(taskId);
    if (!task) throw new Error("Pesanan tidak ditemukan");

    const comm = calculateCommission(task.budget);
    const worker = store.users.get(workerId) || {
      id: workerId,
      name: "Siti Rahma",
      email: "siti@nearjob.id",
      role: "WORKER",
    };

    // Mark task IN_PROGRESS
    task.status = "IN_PROGRESS";
    store.tasks.set(taskId, task);

    // Create or update application as ACCEPTED
    const appId = generateId("app");
    store.applications.set(appId, {
      id: appId,
      taskId,
      task,
      workerId,
      worker,
      status: "ACCEPTED",
      appliedAt: new Date().toISOString(),
      note: "Diterima instan via Radar Order NEAR MITRA",
    });

    // Create pending transaction
    const txId = generateId("tx");
    store.transactions.set(txId, {
      id: txId,
      taskId,
      task,
      amount: comm.budget,
      commissionRate: comm.commissionRate,
      commissionAmount: comm.commissionAmount,
      netAmount: comm.netAmount,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    });

    const activeOrder: MitraActiveOrder = {
      taskId: task.id,
      title: task.title,
      category: task.category,
      customerName: task.poster.name,
      customerPhone: "0812-4455-8899",
      location: task.location,
      destinationLocation: "Tujuan Pengantaran / Pekerjaan",
      budget: task.budget,
      netEarnings: comm.netAmount,
      step: "OTW",
      startedAt: new Date().toISOString(),
      notes: task.description,
    };

    store.mitraActiveOrders.set(workerId, activeOrder);

    // Notify customer
    const notifId = generateId("notif");
    store.notifications.set(notifId, {
      id: notifId,
      userId: task.posterId,
      title: "Mitra Sedang Menuju ke Lokasi Anda!",
      message: `${worker.name} telah menerima pesanan "${task.title}" dan sedang bergerak ke lokasi.`,
      type: "APPLICATION_ACCEPTED",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return activeOrder;
  },

  updateMitraOrderStatus(
    workerId: string = "usr-worker-siti",
    taskId: string,
    step: "OTW" | "ARRIVED" | "WORKING" | "COMPLETED",
  ): MitraActiveOrder | null {
    const store = initStore();
    const active = store.mitraActiveOrders.get(workerId);
    if (!active || active.taskId !== taskId) return null;

    active.step = step;

    if (step === "COMPLETED") {
      // Complete task in main store
      const task = store.tasks.get(taskId);
      if (task) {
        task.status = "COMPLETED";
        store.tasks.set(taskId, task);
      }

      // Complete application in store
      for (const app of store.applications.values()) {
        if (app.taskId === taskId && app.workerId === workerId) {
          app.status = "COMPLETED";
          store.applications.set(app.id, app);
        }
      }

      // Complete transaction to PAID
      for (const tx of store.transactions.values()) {
        if (tx.taskId === taskId) {
          tx.status = "PAID";
        }
      }

      // Update Mitra daily earnings & trips
      const profile = this.getMitraProfile(workerId);
      profile.todayEarnings += active.netEarnings;
      profile.todayTrips += 1;
      profile.points += 20;
      store.mitraProfiles.set(workerId, profile);

      // Add to worker's wallet
      const wallet = this.getWallet(workerId);
      wallet.balance += active.netEarnings;
      wallet.transactions.unshift({
        id: `wtx-${Date.now()}`,
        userId: workerId,
        type: "RECEIVE",
        amount: active.netEarnings,
        description: `Penghasilan Order Selesai: "${active.title}"`,
        createdAt: new Date().toISOString(),
      });
      store.wallets.set(workerId, wallet);

      // Remove from active orders
      store.mitraActiveOrders.delete(workerId);
      return null;
    }

    store.mitraActiveOrders.set(workerId, active);
    return active;
  },

  withdrawMitraEarnings(
    workerId: string = "usr-worker-siti",
    amount: number,
    bank: string,
    accountNumber: string,
  ): { success: boolean; newBalance: number } {
    const store = initStore();
    const wallet = this.getWallet(workerId);
    if (wallet.balance < amount) {
      throw new Error("Saldo dompet tidak mencukupi untuk penarikan ini");
    }

    wallet.balance -= amount;
    wallet.transactions.unshift({
      id: `wtx-wd-${Date.now()}`,
      userId: workerId,
      type: "WITHDRAWAL",
      amount,
      description: `Tarik Saldo ke ${bank} (${accountNumber})`,
      createdAt: new Date().toISOString(),
    });
    store.wallets.set(workerId, wallet);

    return { success: true, newBalance: wallet.balance };
  },
};
