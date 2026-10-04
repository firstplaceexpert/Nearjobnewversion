import { Platform } from "react-native";

// Di Android Emulator gunakan 10.0.2.2, di iOS Simulator / Web gunakan localhost
export const API_BASE_URL = Platform.select({
  android: "http://10.0.2.2:8000/api",
  ios: "http://localhost:8000/api",
  default: "http://localhost:8000/api",
});

export const customerApi = {
  // Autentikasi
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, role: "customer" }),
    });
    return res.json();
  },

  // Tugas & Order Instan
  async getTasks() {
    const res = await fetch(`${API_BASE_URL}/tasks`);
    return res.json();
  },

  async createOrder(data: {
    title: string;
    service_type: string;
    pickup_address: string;
    destination_address?: string;
    budget: number;
    customer_id: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Dompet NearPay
  async getWallet(userId: string) {
    const res = await fetch(`${API_BASE_URL}/wallet?user_id=${userId}`);
    return res.json();
  },

  async topupWallet(userId: string, amount: number) {
    const res = await fetch(`${API_BASE_URL}/wallet/topup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, amount }),
    });
    return res.json();
  },
};
