export interface ServiceVariant {
  id: string;
  name: string;
  badge: string;
  defaultBudget: number;
  description: string;
  suggestedDuration?: number;
  pricingType: "FIXED" | "HOURLY";
}

export interface ServiceCategoryConfig {
  slug: string;
  code: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  dbCategory: string;
  themeColor: {
    badge: string;
    bgAccent: string;
    border: string;
    text: string;
    gradient: string;
  };
  isRemote: boolean;
  typeTag: string;
  variants: ServiceVariant[];
}

export const SERVICE_CATEGORIES: Record<string, ServiceCategoryConfig> = {
  tugas: {
    slug: "tugas",
    code: "NearTugas",
    title: "Tugas Kuliah, Sekolah & Digital",
    shortDesc: "Desain Canva, format PPT, pengetikan naskah, dan olah data",
    longDesc:
      "Layanan bantuan pengerjaan tugas digital secara remote / online. Mitra siap membantu merapikan dokumen, membuat desain presentasi, dan input data sesuai tenggat waktu yang Anda tentukan.",
    dbCategory: "IT & Desain",
    themeColor: {
      badge: "bg-[#1867F8]/10 text-[#1867F8] border-[#1867F8]/20",
      bgAccent: "bg-[#1867F8]/5",
      border: "border-[#1867F8]/20",
      text: "text-[#1867F8]",
      gradient: "from-[#2F2B4F] via-[#1867F8] to-[#23C8FE]",
    },
    isRemote: true,
    typeTag: "Online / Remote",
    variants: [
      {
        id: "canva",
        name: "Desain Feed Canva & Banner",
        badge: "Rp 50.000 / tugas",
        defaultBudget: 50000,
        description:
          "Bantu buat desain konten Instagram, banner promosi, atau poster acara menggunakan template Canva.",
        pricingType: "FIXED",
      },
      {
        id: "ppt",
        name: "Rapikan Format PPT & Slide Kuliah",
        badge: "Rp 45.000 / tugas",
        defaultBudget: 45000,
        description:
          "Tata letak visual slide presentasi, perbaiki tipografi, dan masukkan materi agar siap dipresentasikan.",
        pricingType: "FIXED",
      },
      {
        id: "ketik",
        name: "Ketik Ulang Naskah & Transkrip",
        badge: "Rp 35.000 / tugas",
        defaultBudget: 35000,
        description:
          "Bantu ketik naskah tulisan tangan / PDF ke Word, transkrip rekaman suara, atau rapikan daftar pustaka.",
        pricingType: "FIXED",
      },
      {
        id: "excel",
        name: "Olah Data Excel & Statistik Dasar",
        badge: "Rp 60.000 / tugas",
        defaultBudget: 60000,
        description:
          "Input tabulasi data kuesioner, rumus formula Excel dasar, dan pembuatan grafik visualisasi.",
        pricingType: "FIXED",
      },
    ],
  },
  rumah: {
    slug: "rumah",
    code: "NearRumah",
    title: "Pekerjaan Rumah & Kos",
    shortDesc: "Beres-beres kosan, rawat anabul kucing, bantu masak, dan cuci piring",
    longDesc:
      "Mitra terdekat akan datang langsung ke lokasi rumah atau kamar kosan Anda untuk membantu berbagai pekerjaan harian secara cepat, higienis, dan terpercaya.",
    dbCategory: "Jasa Harian",
    themeColor: {
      badge: "bg-[#23C8FE]/15 text-[#0aaedc] border-[#23C8FE]/30",
      bgAccent: "bg-[#23C8FE]/5",
      border: "border-[#23C8FE]/25",
      text: "text-[#0aaedc]",
      gradient: "from-[#1867F8] via-[#23C8FE] to-[#1867F8]",
    },
    isRemote: false,
    typeTag: "Datang ke Lokasi",
    variants: [
      {
        id: "kucing",
        name: "Kasih Makan & Bersih Pasir Kucing",
        badge: "Rp 40.000 / visit",
        defaultBudget: 40000,
        description:
          "Kunjungan kasih makan anabul, ganti air minum bersih, buang kotoran pasir litterbox, dan update foto.",
        pricingType: "FIXED",
      },
      {
        id: "clean",
        name: "Beres-Beres Kosan & Kamar Mandi",
        badge: "Rp 70.000 / 2 jam",
        defaultBudget: 70000,
        suggestedDuration: 2,
        description:
          "Sapu lantai, pel menyeluruh, sikat kamar mandi, ganti sprei, dan buang sampah kosan.",
        pricingType: "HOURLY",
      },
      {
        id: "masak",
        name: "Bantu Masak Harian & Meal Prep",
        badge: "Rp 60.000 / sesi",
        defaultBudget: 60000,
        description:
          "Bantu potong bahan, racik bumbu, dan masak 2-3 menu lauk rumahan sehat untuk anak kos / keluarga.",
        pricingType: "FIXED",
      },
      {
        id: "laundry",
        name: "Bantu Cuci Piring & Setrika Pakaian",
        badge: "Rp 70.000 / 2 jam",
        defaultBudget: 70000,
        suggestedDuration: 2,
        description:
          "Cuci tumpukan piring dapur, rapikan perabotan, dan setrika pakaian harian rapi.",
        pricingType: "HOURLY",
      },
    ],
  },
  event: {
    slug: "event",
    code: "NearEvent",
    title: "Acara & Jaga Stand",
    shortDesc: "Jaga booth bazaar mall, crew event pameran, dan titip jaga toko",
    longDesc:
      "Kebutuhan tenaga jaga stand pameran, usher festival, penyebar leaflet, maupun pengganti kasir toko berbasis shift waktu fleksibel dan profesional.",
    dbCategory: "Jaga Booth",
    themeColor: {
      badge: "bg-[#FEE49A]/30 text-[#ad8318] border-[#FEE49A]",
      bgAccent: "bg-[#FEE49A]/10",
      border: "border-[#FEE49A]",
      text: "text-[#ad8318]",
      gradient: "from-[#2F2B4F] via-[#F57373] to-[#FEE49A]",
    },
    isRemote: false,
    typeTag: "Shift Fleksibel",
    variants: [
      {
        id: "booth",
        name: "Jaga Stand Booth Bazaar Mall",
        badge: "Rp 180.000 / shift (6 Jam)",
        defaultBudget: 180000,
        suggestedDuration: 6,
        description:
          "Standby melayani pembeli di booth bazaar mall, catat nota transaksi, dan rapikan display produk.",
        pricingType: "HOURLY",
      },
      {
        id: "crew",
        name: "Crew Bantuan Event & Pameran",
        badge: "Rp 210.000 / shift (6 Jam)",
        defaultBudget: 210000,
        suggestedDuration: 6,
        description:
          "Bantu operasional venue, cek tiket masuk, registrasi peserta, dan distribusi konsumsi.",
        pricingType: "HOURLY",
      },
      {
        id: "flyer",
        name: "Penyebar Brosur & Flyer Promosi",
        badge: "Rp 120.000 / shift (4 Jam)",
        defaultBudget: 120000,
        suggestedDuration: 4,
        description:
          "Membagikan brosur promosi kepada pengunjung di area mall, kampus, atau pusat keramaian.",
        pricingType: "HOURLY",
      },
      {
        id: "toko",
        name: "Titip Jaga Toko / Kasir Pengganti",
        badge: "Rp 180.000 / shift (6 Jam)",
        defaultBudget: 180000,
        suggestedDuration: 6,
        description:
          "Menjaga toko ritel, melayani pembeli saat penjaga utama berhalangan atau cuti.",
        pricingType: "HOURLY",
      },
    ],
  },
  titip: {
    slug: "titip",
    code: "NearTitip",
    title: "Titip Antre & Bantuan Angkut",
    shortDesc: "Titip antre tiket/faskes, belanja pasar, dan tenaga angkut pindahan",
    longDesc:
      "Bantuan tenaga fisik lapangan untuk menghemat waktu berharga Anda. Mulai dari antre panjang, belanja kebutuhan pasar pagi, hingga angkut barang pindahan.",
    dbCategory: "Angkut Barang",
    themeColor: {
      badge: "bg-[#FF9DE0]/20 text-[#c8469c] border-[#FF9DE0]/40",
      bgAccent: "bg-[#FF9DE0]/10",
      border: "border-[#FF9DE0]/30",
      text: "text-[#c8469c]",
      gradient: "from-[#2F2B4F] via-[#1867F8] to-[#FF9DE0]",
    },
    isRemote: false,
    typeTag: "Bantuan Lapangan",
    variants: [
      {
        id: "antre",
        name: "Titip Antre Tiket & Nomor Faskes",
        badge: "Rp 70.000 / 2 jam",
        defaultBudget: 70000,
        suggestedDuration: 2,
        description:
          "Bantu antre tiket fisik konser/wahana atau mengambilkan nomor antrean klinik & faskes sejak pagi.",
        pricingType: "HOURLY",
      },
      {
        id: "pasar",
        name: "Titip Belanja Sayur & Pasar Tradisional",
        badge: "Rp 40.000 / tugas",
        defaultBudget: 40000,
        description:
          "Bantu belanja daftar bumbu dan sayuran segar langsung ke pasar tradisional terdekat.",
        pricingType: "FIXED",
      },
      {
        id: "pindahan",
        name: "Tenaga Angkut Pindahan Kosan",
        badge: "Rp 100.000 / tugas",
        defaultBudget: 100000,
        description:
          "Tenaga fisik membantu angkat kardus perabotan, kasur, lemari lipat, dan naik turun tangga kosan.",
        pricingType: "FIXED",
      },
      {
        id: "galon",
        name: "Angkat Galon, Tabung Gas & Barang Berat",
        badge: "Rp 35.000 / tugas",
        defaultBudget: 35000,
        description:
          "Bantu angkat galon air, tabung gas elpiji, atau paket berat sampai ke lantai atas.",
        pricingType: "FIXED",
      },
    ],
  },
};

export function getServiceCategoryConfig(slug: string): ServiceCategoryConfig | null {
  return SERVICE_CATEGORIES[slug.toLowerCase()] || null;
}
