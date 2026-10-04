/**
 * Feature: Tasks — TypeScript Types
 */
import type {
  JobType,
  TaskStatus,
  ApplicationStatus,
  TransactionStatus,
} from "@/lib/constants";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: "POSTER" | "WORKER";
  image?: string | null;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: JobType;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  budget: number;
  scheduleDate: string;
  scheduleTime: string;
  status: TaskStatus;
  posterId: string;
  poster: UserSummary;
  createdAt: string;
  updatedAt: string;
  applicationsCount?: number;
  hasApplied?: boolean;
}

export interface ApplicationItem {
  id: string;
  taskId: string;
  task?: TaskItem;
  workerId: string;
  worker: UserSummary;
  status: ApplicationStatus;
  appliedAt: string;
  note?: string;
}

export interface TransactionItem {
  id: string;
  taskId: string;
  task?: TaskItem;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  status: TransactionStatus;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | "NEW_APPLICATION"
    | "APPLICATION_ACCEPTED"
    | "APPLICATION_REJECTED"
    | "TASK_COMPLETED";
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  taskId: string;
  senderId: string;
  senderName: string;
  senderRole: "POSTER" | "WORKER";
  text: string;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: "TOPUP" | "PAYMENT" | "RECEIVE" | "WITHDRAWAL";
  amount: number;
  description: string;
  createdAt: string;
}

export interface WalletSummary {
  userId: string;
  balance: number;
  pendingBalance: number;
  transactions: WalletTransaction[];
}

export interface LiveOrderTracking {
  id: string;
  taskId: string;
  status: "SEARCHING" | "ASSIGNED" | "ON_THE_WAY" | "IN_PROGRESS" | "COMPLETED";
  workerName?: string;
  workerPhone?: string;
  workerRating?: number;
  workerVehicle?: string;
  workerAvatar?: string;
  workerLat?: number;
  workerLng?: number;
  etaMinutes?: number;
  distanceKm?: number;
  destinationLocation: string;
  budget: number;
  updatedAt: string;
}

export interface MitraProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  vehicle: string;
  plateNumber: string;
  rating: number;
  totalTrips: number;
  acceptanceRate: number;
  completionRate: number;
  isOnline: boolean;
  todayEarnings: number;
  todayTrips: number;
  dailyGoalTrips: number;
  points: number;
}

export interface MitraIncomingOrder {
  id: string;
  taskId: string;
  title: string;
  category: string;
  pickupLocation: string;
  destinationLocation: string;
  distanceKm: number;
  budget: number;
  netEarnings: number;
  customerName: string;
  customerRating: number;
  expiresInSeconds: number;
  notes?: string;
}

export interface MitraActiveOrder {
  taskId: string;
  title: string;
  category: string;
  customerName: string;
  customerPhone: string;
  location: string;
  destinationLocation?: string;
  budget: number;
  netEarnings: number;
  step: "OTW" | "ARRIVED" | "WORKING" | "COMPLETED";
  startedAt: string;
  notes?: string;
}
