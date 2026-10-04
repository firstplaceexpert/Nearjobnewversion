import { Platform } from "react-native";

export const API_BASE_URL = Platform.select({
  android: "http://10.0.2.2:8000/api",
  ios: "http://localhost:8000/api",
  default: "http://localhost:8000/api",
});

export const driverApi = {
  async toggleOnline(isOnline: boolean, driverId = "usr-worker-siti") {
    const res = await fetch(`${API_BASE_URL}/driver/toggle-online`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_online: isOnline, driver_id: driverId }),
    });
    return res.json();
  },

  async getRadar() {
    const res = await fetch(`${API_BASE_URL}/driver/radar`);
    return res.json();
  },

  async getActiveOrder(driverId = "usr-worker-siti") {
    const res = await fetch(`${API_BASE_URL}/driver/active-order?driver_id=${driverId}`);
    return res.json();
  },

  async acceptOrder(orderId: string, driverId = "usr-worker-siti") {
    const res = await fetch(`${API_BASE_URL}/driver/orders/${orderId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driver_id: driverId }),
    });
    return res.json();
  },

  async updateOrderStatus(orderId: string, status: string, note?: string) {
    const res = await fetch(`${API_BASE_URL}/driver/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    return res.json();
  },

  async getWallet(userId = "usr-worker-siti") {
    const res = await fetch(`${API_BASE_URL}/wallet?user_id=${userId}`);
    return res.json();
  },

  async withdraw(
    amount: number,
    bank: string,
    accountNumber: string,
    userId = "usr-worker-siti",
  ) {
    const res = await fetch(`${API_BASE_URL}/wallet/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        amount,
        bank,
        account_number: accountNumber,
      }),
    });
    return res.json();
  },
};
