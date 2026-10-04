import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { customerApi } from "./src/services/api";

export type PricingMode = "PER_TASK" | "HOURLY" | "PER_KM" | "DAILY";

export default function App() {
  const [currentTab, setCurrentTab] = useState<"home" | "orders" | "wallet" | "profile">(
    "home",
  );
  const [balance, setBalance] = useState(500000);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState("NearRide");
  const [pickupAddress, setPickupAddress] = useState("Grand Indonesia, Jakarta");
  const [destAddress, setDestAddress] = useState("Plaza Senayan, Jakarta");
  const [orderBudget, setOrderBudget] = useState("40000");
  const [pricingMode, setPricingMode] = useState<PricingMode>("PER_TASK");
  const [durationHours, setDurationHours] = useState(3);
  const [distanceKm, setDistanceKm] = useState(5);
  const [loading, setLoading] = useState(false);

  const services = [
    {
      id: "near_pet",
      name: "Rawat Kucing",
      icon: "🐱",
      desc: "Makan & Pasir Kucing",
      defaultBudget: "40000",
      mode: "PER_TASK" as PricingMode,
      note: "Kunjungan kasih makan kucing & bersihkan pasir litterbox",
    },
    {
      id: "near_cook",
      name: "Bantu Masak",
      icon: "🍳",
      desc: "Meal Prep & Masak Lauk",
      defaultBudget: "60000",
      mode: "PER_TASK" as PricingMode,
      note: "Bantu masak 2-3 menu harian rumahan anak kos / keluarga",
    },
    {
      id: "near_canva",
      name: "Tugas Canva",
      icon: "🎨",
      desc: "Desain Feed & Poster",
      defaultBudget: "50000",
      mode: "PER_TASK" as PricingMode,
      note: "Bantu buat template desain presentasi/Instagram Canva",
    },
    {
      id: "near_study",
      name: "Tugas Kuliah",
      icon: "🎓",
      desc: "Ketik, Format & PPT",
      defaultBudget: "45000",
      mode: "PER_TASK" as PricingMode,
      note: "Bantu rapikan makalah kampus, sitasi & slide PPT",
    },
    {
      id: "near_booth",
      name: "Jaga Booth",
      icon: "🎪",
      desc: "Shift Pameran / Bazaar",
      defaultBudget: "180000",
      mode: "HOURLY" as PricingMode,
      duration: 6,
      rate: 30000,
      note: "Jaga stand booth pameran 6 jam (Rp 30.000/jam)",
    },
    {
      id: "near_clean",
      name: "Beres Kosan",
      icon: "🧹",
      desc: "Bersih Rumah & Kamar",
      defaultBudget: "70000",
      mode: "HOURLY" as PricingMode,
      duration: 2,
      rate: 35000,
      note: "Sapu, pel & bersihkan kosan 2 jam (Rp 35.000/jam)",
    },
    {
      id: "near_helper",
      name: "Angkut Barang",
      icon: "📦",
      desc: "Angkat Kardus & Pindahan",
      defaultBudget: "100000",
      mode: "PER_TASK" as PricingMode,
      note: "Bantu angkut barang galon, perabot, dan pindahan",
    },
    {
      id: "near_antre",
      name: "Titip Antre",
      icon: "⏱️",
      desc: "Antre Tiket / Pasar",
      defaultBudget: "70000",
      mode: "HOURLY" as PricingMode,
      duration: 2,
      rate: 35000,
      note: "Titip antre tiket fisik / belanja bahan di pasar tradisional",
    },
    {
      id: "task_custom",
      name: "Jasa Kustom",
      icon: "📋",
      desc: "Tugas Bebas Lainnya",
      defaultBudget: "50000",
      mode: "PER_TASK" as PricingMode,
      note: "Pekerjaan harian sesuai instruksi bebas pelanggan",
    },
  ];

  const handleSelectService = (item: (typeof services)[0]) => {
    setSelectedService(item.name);
    setPricingMode(item.mode);
    setOrderBudget(item.defaultBudget);
    if (item.duration) setDurationHours(item.duration);
    if (item.distance) setDistanceKm(item.distance);
    setModalVisible(true);
  };

  const handleModeChange = (mode: PricingMode) => {
    setPricingMode(mode);
    if (mode === "HOURLY") {
      setOrderBudget((durationHours * 30000).toString());
    } else if (mode === "PER_KM") {
      setOrderBudget((10000 + distanceKm * 3000).toString());
    } else if (mode === "DAILY") {
      setOrderBudget("150000");
    } else {
      setOrderBudget("50000");
    }
  };

  const budgetNum = parseInt(orderBudget.replace(/\D/g, ""), 10) || 0;

  const handleOrder = async () => {
    if (!pickupAddress) {
      Alert.alert("Perhatian", "Mohon lengkapi alamat lokasi pekerjaan");
      return;
    }

    setLoading(true);
    try {
      const res = await customerApi.createOrder({
        title: `Pesan ${selectedService}`,
        service_type: selectedService.toLowerCase().replace(/\s+/g, "_"),
        pickup_address: pickupAddress,
        destination_address: destAddress || pickupAddress,
        budget: budgetNum || 25000,
        customer_id: "usr-customer-budi",
      });

      if (res.success) {
        setActiveOrder(res.data);
        setModalVisible(false);
        Alert.alert(
          "Sukses",
          `Pesanan dibuat! Total Biaya: Rp ${budgetNum.toLocaleString("id-ID")}`,
        );
      } else {
        Alert.alert("Gagal", res.message || "Terjadi kesalahan");
      }
    } catch (err: any) {
      Alert.alert("Koneksi", "Menghubungkan ke API Laravel backend: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2F6BFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>NEAR JOB</Text>
          <Text style={styles.headerSubtitle}>Aplikasi Pelanggan (Customer)</Text>
        </View>
        <TouchableOpacity
          style={styles.walletBadge}
          onPress={() => setCurrentTab("wallet")}
        >
          <Text style={styles.walletLabel}>NearPay</Text>
          <Text style={styles.walletAmount}>Rp {balance.toLocaleString("id-ID")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Active Order Banner if any */}
        {activeOrder && (
          <View style={styles.activeOrderCard}>
            <View style={styles.activeOrderHeader}>
              <Text style={styles.activeOrderBadge}>Pesanan Aktif</Text>
              <Text style={styles.activeOrderStatus}>{activeOrder.status}</Text>
            </View>
            <Text style={styles.activeOrderTitle}>{activeOrder.title}</Text>
            <Text style={styles.activeOrderAddress}>
              📍 Dari: {activeOrder.pickup_address}
            </Text>
            <Text style={styles.activeOrderAddress}>
              🏁 Ke: {activeOrder.destination_address}
            </Text>
            <Text style={styles.activeOrderBudget}>
              Tarif: Rp {activeOrder.budget?.toLocaleString("id-ID")}
            </Text>
          </View>
        )}

        {/* Hero Promo Box */}
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>Butuh Bantuan Sekarang?</Text>
          <Text style={styles.heroDesc}>
            Pesan ojek, kurir kilat, atau panggil pekerja harian dalam 1 menit.
          </Text>
        </View>

        {/* Services Grid (Gojek Style) */}
        <Text style={styles.sectionTitle}>Layanan Terpopuler</Text>
        <View style={styles.gridContainer}>
          {services.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.serviceItem}
              onPress={() => handleSelectService(item)}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.serviceIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.serviceDesc}>{item.desc}</Text>
              <Text style={styles.servicePriceBadge}>
                Rp {parseInt(item.defaultBudget, 10).toLocaleString("id-ID")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Post Custom Task Card */}
        <TouchableOpacity
          style={styles.customTaskCard}
          onPress={() => {
            handleSelectService(services[6]);
          }}
        >
          <Text style={styles.customTaskTitle}>➕ Pasang Pekerjaan Kustom</Text>
          <Text style={styles.customTaskDesc}>
            Jaga booth, angkut barang, bantu pindahan, perbaikan rumah, dll.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Order Booking Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pesan {selectedService}</Text>

            {/* Skema Upah Selector */}
            <Text style={styles.inputLabel}>Skema Perhitungan Upah:</Text>
            <View style={styles.modeRow}>
              {(["PER_TASK", "HOURLY", "PER_KM", "DAILY"] as PricingMode[]).map(
                (mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.modePill,
                      pricingMode === mode && styles.modePillActive,
                    ]}
                    onPress={() => handleModeChange(mode)}
                  >
                    <Text
                      style={[
                        styles.modePillText,
                        pricingMode === mode && styles.modePillTextActive,
                      ]}
                    >
                      {mode === "PER_TASK" && "📌 Per Tugas"}
                      {mode === "HOURLY" && "⏱️ Per Jam"}
                      {mode === "PER_KM" && "🏍️ Per KM"}
                      {mode === "DAILY" && "📅 Per Hari"}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>

            {/* Dynamic Adjuster if Hourly */}
            {pricingMode === "HOURLY" && (
              <View style={styles.adjusterRow}>
                <Text style={styles.adjusterLabel}>
                  Durasi: <Text style={styles.boldText}>{durationHours} Jam</Text> (@ Rp
                  30.000/jam)
                </Text>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => {
                      const next = Math.max(1, durationHours - 1);
                      setDurationHours(next);
                      setOrderBudget((next * 30000).toString());
                    }}
                  >
                    <Text style={styles.stepperBtnText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => {
                      const next = durationHours + 1;
                      setDurationHours(next);
                      setOrderBudget((next * 30000).toString());
                    }}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Dynamic Adjuster if Per KM */}
            {pricingMode === "PER_KM" && (
              <View style={styles.adjusterRow}>
                <Text style={styles.adjusterLabel}>
                  Jarak: <Text style={styles.boldText}>{distanceKm} KM</Text> (Rp 10rb +
                  Rp 3rb/km)
                </Text>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => {
                      const next = Math.max(1, distanceKm - 1);
                      setDistanceKm(next);
                      setOrderBudget((10000 + next * 3000).toString());
                    }}
                  >
                    <Text style={styles.stepperBtnText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => {
                      const next = distanceKm + 1;
                      setDistanceKm(next);
                      setOrderBudget((10000 + next * 3000).toString());
                    }}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <Text style={styles.inputLabel}>Alamat Penjemputan / Lokasi:</Text>
            <TextInput
              style={styles.input}
              value={pickupAddress}
              onChangeText={setPickupAddress}
              placeholder="Contoh: Jl. Sudirman No. 10"
            />

            <Text style={styles.inputLabel}>Tujuan (Opsional / Jika Antar):</Text>
            <TextInput
              style={styles.input}
              value={destAddress}
              onChangeText={setDestAddress}
              placeholder="Contoh: Menara BCA, Thamrin"
            />

            {/* Total Tarif Layanan */}
            <View style={styles.breakdownBox}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Total Biaya Layanan:</Text>
                <Text style={styles.breakdownValueBold}>
                  Rp {budgetNum.toLocaleString("id-ID")}
                </Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSubmit]}
                onPress={handleOrder}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnSubmitText}>Konfirmasi Pesanan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab("home")}>
          <Text style={currentTab === "home" ? styles.navActiveText : styles.navText}>
            🏠 Beranda
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab("orders")}>
          <Text style={currentTab === "orders" ? styles.navActiveText : styles.navText}>
            📋 Pesanan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab("wallet")}>
          <Text style={currentTab === "wallet" ? styles.navActiveText : styles.navText}>
            💳 Dompet
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
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#2F6BFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#E0E7FF",
  },
  walletBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "flex-end",
  },
  walletLabel: {
    fontSize: 9,
    color: "#64748B",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  walletAmount: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2F6BFF",
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  activeOrderCard: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  activeOrderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  activeOrderBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2F6BFF",
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeOrderStatus: {
    fontSize: 12,
    fontWeight: "800",
    color: "#10B981",
  },
  activeOrderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  activeOrderAddress: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  activeOrderBudget: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2F6BFF",
    marginTop: 6,
  },
  heroBox: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  serviceItem: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 22,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 11,
    color: "#64748B",
  },
  servicePriceBadge: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "800",
    color: "#2F6BFF",
  },
  modeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  modePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modePillActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2F6BFF",
  },
  modePillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  modePillTextActive: {
    color: "#2F6BFF",
    fontWeight: "800",
  },
  adjusterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  adjusterLabel: {
    fontSize: 12,
    color: "#334155",
  },
  boldText: {
    fontWeight: "800",
    color: "#0F172A",
  },
  stepperContainer: {
    flexDirection: "row",
    gap: 8,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#2F6BFF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  breakdownBox: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  breakdownRowTotal: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 6,
    marginTop: 4,
    marginBottom: 0,
  },
  breakdownLabel: {
    fontSize: 11,
    color: "#475569",
  },
  breakdownValueBold: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
  },
  breakdownLabelWarning: {
    fontSize: 11,
    color: "#B45309",
  },
  breakdownValueWarning: {
    fontSize: 11,
    fontWeight: "600",
    color: "#B45309",
  },
  breakdownLabelSuccess: {
    fontSize: 12,
    fontWeight: "800",
    color: "#047857",
  },
  breakdownValueSuccess: {
    fontSize: 12,
    fontWeight: "900",
    color: "#047857",
  },
  customTaskCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#2F6BFF",
    borderRadius: 16,
    padding: 16,
  },
  customTaskTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2F6BFF",
    marginBottom: 4,
  },
  customTaskDesc: {
    fontSize: 11,
    color: "#64748B",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnCancel: {
    backgroundColor: "#E2E8F0",
    marginRight: 8,
  },
  btnCancelText: {
    color: "#475569",
    fontWeight: "700",
  },
  btnSubmit: {
    backgroundColor: "#2F6BFF",
    marginLeft: 8,
  },
  btnSubmitText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  navActiveText: {
    fontSize: 12,
    color: "#2F6BFF",
    fontWeight: "800",
  },
});
