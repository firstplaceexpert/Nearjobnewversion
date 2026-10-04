import { BrowseView } from "@/features/tasks/components/browse-view";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cari Tugas Terdekat | NEAR JOB",
  description:
    "Jelajahi pekerjaan harian, freelance, angkut barang, jaga booth, dan aneka tugas terbuka di sekitarmu dengan komisi transparan.",
};

export default async function BrowsePage(props: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentUser = await getCurrentUser();

  const initialTasks = marketplaceStore.getTasks({
    search: searchParams.search,
    category: searchParams.category,
    status: "OPEN",
    currentUserId: currentUser?.id,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
          Cari & Lamar Tugas Terdekat
        </h1>
        <p className="text-sm text-gray mt-1 max-w-2xl">
          Temukan pekerjaan yang sesuai dengan keahlian dan lokasimu. Semua pembayaran
          dilengkapi estimasi pendapatan bersih yang transparan.
        </p>
      </div>

      <BrowseView
        initialTasks={initialTasks}
        initialSearch={searchParams.search || ""}
        initialCategory={searchParams.category || "Semua Kategori"}
      />
    </div>
  );
}
