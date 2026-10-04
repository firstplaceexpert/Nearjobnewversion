import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { driverApi } from "./src/services/api";

export default function App() {
  const [isOnline, setIsOnline] = useState(true);
  const [currentTab, setCurrentTab] = useState<"radar" | "orders" | "wallet" | "profile">(
    "radar",
  );
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [incomingOrder, setIncomingOrder] = useState<any>(null);
  const [countdown, setCountdown] = useState(20);
  const [balance, setBalance] = useState(820000);
  const [loading, setLoading] = useState(false);

  // Poll active order & radar
  useEffect(() => {
    let interval: any;
    if (isOnline && !activeOrder) {
      interval = setInterval(async () => {
        try {
          const radarRes = await driverApi.getRadar();
          if (radarRes.success && radarRes.data.length > 0 && !incomingOrder) {
            setIncomingOrder(radarRes.data[0]);
            setCountdown(20);
          }
        } catch {
          // Ignore network errors in poll
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isOnline, activeOrder, incomingOrder]);

  // Countdown timer for incoming order
  useEffect(() => {
    let timer: any;
    if (incomingOrder && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIncomingOrder(null);
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [incomingOrder, countdown]);

  const handleToggleOnline = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    try {
      await driverApi.toggleOnline(nextState);
    } catch {
      // Offline fallback
    }
  };

  const handleAcceptOrder = async () => {
    if (!incomingOrder) return;
    setLoading(true);
    try {
      const res = await driverApi.acceptOrder(incomingOrder.id);
      if (res.success) {
        setActiveOrder({
          ...incomingOrder,
          status: "ACCEPTED",
        });
        setIncomingOrder(null);
        Alert.alert(
          "Sukses",
          "Order berhasil Anda terima! Silakan meluncur ke lokasi penjemputan.",
        );
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (!activeOrder) return;
    const nextStatuses: Record<string, string> = {
      ACCEPTED: "OTW",
      OTW: "ARRIVED",
      ARRIVED: "WORKING",
      WORKING: "COMPLETED",
    };
    const next = nextStatuses[activeOrder.status];
    if (!next) return;

    setLoading(true);
    try {
      const res = await driverApi.updateOrderStatus(activeOrder.id, next);
      if (res.success) {
        if (next === "COMPLETED") {
          setBalance((prev) => prev + (activeOrder.net_amount || 25000));
          setActiveOrder(null);
          Alert.alert(
            "Selamat!",
            `Pekerjaan selesai! Pendapatan Rp ${(activeOrder.net_amount || 25000).toLocaleString("id-ID")} masuk ke dompet Anda.`,
          );
        } else {
          setActiveOrder({ ...activeOrder, status: next });
        }
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header Mitra */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>NEAR MITRA</Text>
          <Text style={styles.headerSubtitle}>
            Portal Pengemudi & Pekerja (GoPartner)
          </Text>
        </View>
        <TouchableOpacity
          style={styles.walletBadge}
          onPress={() => setCurrentTab("wallet")}
        >
          <Text style={styles.walletLabel}>Saldo Dompet</Text>
          <Text style={styles.walletAmount}>Rp {balance.toLocaleString("id-ID")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Online / Offline Switch Card */}
        <View
          style={[
            styles.statusCard,
            isOnline ? styles.statusOnline : styles.statusOffline,
          ]}
        >
          <View>
            <Text style={styles.statusTitle}>
              {isOnline ? "SIAP KERJA (ONLINE)" : "ISTIRAHAT (OFFLINE)"}
            </Text>
            <Text style={styles.statusDesc}>
              {isOnline
                ? "Radar aktif. Anda siap menerima pesanan di sekitar Anda."
                : "Aktifkan status untuk mulai menerima orderan baru."}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: "#94A3B8", true: "#10B981" }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Active Order Progress Tracker */}
        {activeOrder && (
          <View style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <Text style={styles.activeBadge}>TUGAS BERLANGSUNG</Text>
              <Text style={styles.statusStep}>{activeOrder.status}</Text>
            </View>

            <Text style={styles.activeTitle}>{activeOrder.title}</Text>
            <Text style={styles.addressText}>
              📍 Jemput: {activeOrder.pickup_address}
            </Text>
            {activeOrder.destination_address && (
              <Text style={styles.addressText}>
                🏁 Antar: {activeOrder.destination_address}
              </Text>
            )}
            <Text style={styles.netText}>
              Pendapatan Bersih: Rp{" "}
              {(activeOrder.net_amount || 25000).toLocaleString("id-ID")}
            </Text>

            {/* Step Action Button */}
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={handleNextStep}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.stepBtnText}>
                  {activeOrder.status === "ACCEPTED" && "🚗 Mulai Meluncur (OTW)"}
                  {activeOrder.status === "OTW" && "📍 Sudah Sampai di Lokasi"}
                  {activeOrder.status === "ARRIVED" && "🛠️ Mulai Pengerjaan"}
                  {activeOrder.status === "WORKING" && "✅ Selesaikan Pekerjaan"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Performance & Metrics Grid */}
        <Text style={styles.sectionTitle}>Performa & Penghasilan Hari Ini</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Hari Ini</Text>
            <Text style={styles.statValue}>Rp 245.000</Text>
            <Text style={styles.statSub}>4 Trip Selesai</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Rating Bintang</Text>
            <Text style={styles.statValue}>4.98 ⭐</Text>
            <Text style={styles.statSub}>184 Ulasan</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Penerimaan</Text>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statSub}>Sangat Responsif</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Poin Harian</Text>
            <Text style={styles.statValue}>80 / 100</Text>
            <Text style={styles.statSub}>Prioritas Order</Text>
          </View>
        </View>

        {/* Vehicle & Verification */}
        <View style={styles.vehicleCard}>
          <Text style={styles.vehicleTitle}>🛵 Kendaraan Operasional Terdaftar</Text>
          <Text style={styles.vehicleInfo}>Honda Beat eSP 110cc • Plat B 3819 TZG</Text>
          <Text style={styles.vehicleBadge}>
            STNK Aktif • Mitra Terverifikasi Dukcapil
          </Text>
        </View>
      </ScrollView>

      {/* Incoming Order Alert Modal (GoPartner Style) */}
      <Modal visible={!!incomingOrder} animationType="slide" transparent={true}>
        <View style={styles.radarModalOverlay}>
          <View style={styles.radarCard}>
            <View style={styles.radarHeader}>
              <Text style={styles.radarBadge}>🚨 PESANAN MASUK!</Text>
              <Text style={styles.countdownText}>{countdown}s</Text>
            </View>

            <Text style={styles.radarTitle}>{incomingOrder?.title}</Text>
            <Text style={styles.radarAddress}>📍 {incomingOrder?.pickup_address}</Text>
            <Text style={styles.radarDistance}>
              Jarak: {incomingOrder?.distance_km || "2.5"} km
            </Text>

            <View style={styles.earningsBox}>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsRowLabel}>Tarif Pelanggan:</Text>
                <Text style={styles.earningsRowValue}>
                  Rp {(incomingOrder?.budget || 30000).toLocaleString("id-ID")}
                </Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsFeeLabel}>Potongan Komisi (10%):</Text>
                <Text style={styles.earningsFeeValue}>
                  -Rp{" "}
                  {(
                    incomingOrder?.commission_amount ||
                    Math.round((incomingOrder?.budget || 30000) * 0.1)
                  ).toLocaleString("id-ID")}
                </Text>
              </View>
              <View style={styles.earningsTotalRow}>
                <Text style={styles.earningsLabel}>Upah Bersih Masuk ke Mitra:</Text>
                <Text style={styles.earningsAmount}>
                  Rp{" "}
                  {(
                    incomingOrder?.net_amount ||
                    Math.round((incomingOrder?.budget || 30000) * 0.9)
                  ).toLocaleString("id-ID")}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnDecline]}
                onPress={() => setIncomingOrder(null)}
              >
                <Text style={styles.btnDeclineText}>Abaikan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnAccept]}
                onPress={handleAcceptOrder}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnAcceptText}>TERIMA ORDER</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Tabs */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab("radar")}>
          <Text style={currentTab === "radar" ? styles.navActiveText : styles.navText}>
            📡 Radar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab("orders")}>
          <Text style={currentTab === "orders" ? styles.navActiveText : styles.navText}>
            🛵 Tugas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab("wallet")}>
          <Text style={currentTab === "wallet" ? styles.navActiveText : styles.navText}>
            💰 Dompet
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab("profile")}>
          <Text style={currentTab === "profile" ? styles.navActiveText : styles.navText}>
            👤 Profil
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#38BDF8",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#94A3B8",
  },
  walletBadge: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#38BDF8",
    alignItems: "flex-end",
  },
  walletLabel: {
    fontSize: 9,
    color: "#94A3B8",
    fontWeight: "700",
  },
  walletAmount: {
    fontSize: 13,
    fontWeight: "800",
    color: "#38BDF8",
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  statusCard: {
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusOnline: {
    backgroundColor: "#064E3B",
    borderColor: "#10B981",
    borderWidth: 1.5,
  },
  statusOffline: {
    backgroundColor: "#334155",
    borderColor: "#64748B",
    borderWidth: 1.5,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statusDesc: {
    fontSize: 11,
    color: "#E2E8F0",
    maxWidth: 240,
  },
  activeCard: {
    backgroundColor: "#1E293B",
    borderColor: "#38BDF8",
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  activeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  activeBadge: {
    fontSize: 10,
    fontWeight: "900",
    color: "#38BDF8",
    backgroundColor: "#0F172A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusStep: {
    fontSize: 12,
    fontWeight: "800",
    color: "#10B981",
  },
  activeTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  netText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#34D399",
    marginTop: 10,
    marginBottom: 12,
  },
  stepBtn: {
    backgroundColor: "#2F6BFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  stepBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#F8FAFC",
    marginTop: 8,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statBox: {
    width: "48%",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  statLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  statSub: {
    fontSize: 10,
    color: "#38BDF8",
  },
  vehicleCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  vehicleTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  vehicleInfo: {
    fontSize: 12,
    color: "#E2E8F0",
    fontWeight: "600",
    marginBottom: 4,
  },
  vehicleBadge: {
    fontSize: 11,
    color: "#34D399",
  },
  radarModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },
  radarCard: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: "#38BDF8",
  },
  radarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  radarBadge: {
    fontSize: 13,
    fontWeight: "900",
    color: "#EF4444",
  },
  countdownText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#F59E0B",
  },
  radarTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  radarAddress: {
    fontSize: 12,
    color: "#CBD5E1",
    marginBottom: 4,
  },
  radarDistance: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 12,
  },
  earningsBox: {
    backgroundColor: "#0F172A",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  earningsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  earningsRowLabel: {
    fontSize: 11,
    color: "#94A3B8",
  },
  earningsRowValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  earningsFeeLabel: {
    fontSize: 11,
    color: "#F87171",
  },
  earningsFeeValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#F87171",
  },
  earningsTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingTop: 8,
    marginTop: 4,
  },
  earningsLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#38BDF8",
  },
  earningsAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#34D399",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnDecline: {
    backgroundColor: "#334155",
    marginRight: 8,
  },
  btnDeclineText: {
    color: "#E2E8F0",
    fontWeight: "700",
  },
  btnAccept: {
    backgroundColor: "#10B981",
    marginLeft: 8,
  },
  btnAcceptText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1E293B",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 14,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  navActiveText: {
    fontSize: 12,
    color: "#38BDF8",
    fontWeight: "800",
  },
});
