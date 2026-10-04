"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { TaskFilter } from "@/features/tasks/components/task-filter";
import { TaskCard } from "@/features/tasks/components/task-card";
import { ApplyModal } from "@/features/tasks/components/apply-modal";
import { InstantOrderModal } from "@/components/ui/instant-order-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { TaskCardSkeleton } from "@/components/ui/skeleton";
import type { TaskItem } from "@/features/tasks/types";
import { Map, List, Zap } from "lucide-react";

// Dynamically import Leaflet TaskMap for SSR safety
const TaskMap = dynamic(
  () => import("@/features/tasks/components/task-map").then((mod) => mod.TaskMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[620px] rounded-3xl bg-light flex flex-col items-center justify-center text-gray gap-2 animate-pulse">
        <Map className="w-8 h-8 text-primary animate-pulse" />
        <span className="text-xs font-semibold">Memuat Peta Tugas Sekitar...</span>
      </div>
    ),
  },
);

interface BrowseViewProps {
  initialTasks: TaskItem[];
  initialSearch?: string;
  initialCategory?: string;
}

export function BrowseView({
  initialTasks,
  initialSearch = "",
  initialCategory = "Semua Kategori",
}: BrowseViewProps) {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [type, setType] = useState("ALL");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [applyingTask, setApplyingTask] = useState<TaskItem | null>(null);
  const [isInstantOrderOpen, setIsInstantOrderOpen] = useState(false);
  const ITEMS_PER_PAGE = 6;

  // React Query fetching with search and filters
  const { data: tasks = initialTasks, isLoading } = useQuery<TaskItem[]>({
    queryKey: ["tasks", { search, category, type, location }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category && category !== "Semua Kategori") params.set("category", category);
      if (type && type !== "ALL") params.set("type", type);
      if (location) params.set("location", location);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    initialData: initialTasks,
  });

  const handleReset = () => {
    setSearch("");
    setCategory("Semua Kategori");
    setType("ALL");
    setLocation("");
    setPage(1);
  };

  // Pagination slice
  const totalItems = tasks.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedTasks = tasks.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Search & Filter Component */}
      <TaskFilter
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        selectedCategory={category}
        onCategoryChange={(c) => {
          setCategory(c);
          setPage(1);
        }}
        selectedType={type}
        onTypeChange={(t) => {
          setType(t);
          setPage(1);
        }}
        selectedLocation={location}
        onLocationChange={(l) => {
          setLocation(l);
          setPage(1);
        }}
        onReset={handleReset}
      />

      {/* Results Header with View Mode Toggle & Instant Order Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm text-gray">
            Menampilkan <span className="font-bold text-dark">{tasks.length}</span>{" "}
            pekerjaan terbuka
          </p>
          {(search || category !== "Semua Kategori" || type !== "ALL" || location) && (
            <span className="text-primary font-semibold text-xs bg-primary-light px-2 py-0.5 rounded-full">
              Filter Aktif
            </span>
          )}
        </div>

        {/* View Switcher & Instant Order CTA */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsInstantOrderOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm shadow-amber-500/20"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Pesan Instan</span>
          </button>

          <div className="flex items-center p-1 bg-light rounded-2xl border border-gray-border/60">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-white text-dark shadow-xs font-bold"
                  : "text-gray hover:text-dark"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daftar</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                viewMode === "map"
                  ? "bg-primary text-white shadow-xs font-bold"
                  : "text-gray hover:text-dark"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Peta Interaktif</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE: MAP */}
      {viewMode === "map" ? (
        <div className="space-y-4 animate-fade-in">
          <TaskMap
            tasks={tasks}
            selectedCategory={category}
            onApplyClick={(task) => setApplyingTask(task)}
          />
        </div>
      ) : (
        /* VIEW MODE: LIST */
        <div className="space-y-6 animate-fade-in">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TaskCardSkeleton key={i} />
              ))}
            </div>
          ) : paginatedTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-border p-12">
              <EmptyState
                title="Tidak Ada Tugas Ditemukan"
                description="Coba ubah kata kunci pencarian, pilih kategori lain, atau reset filter untuk melihat semua tugas terbuka."
                action={{
                  label: "Reset Semua Filter",
                  onClick: handleReset,
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Sebelumnya
              </Button>

              <span className="text-xs text-gray px-3 font-medium">
                Halaman {page} dari {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Selanjutnya →
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Instant Order Modal */}
      <InstantOrderModal
        isOpen={isInstantOrderOpen}
        onClose={() => setIsInstantOrderOpen(false)}
      />

      {/* Quick Apply Modal */}
      {applyingTask && (
        <ApplyModal
          task={applyingTask}
          isOpen={!!applyingTask}
          onClose={() => setApplyingTask(null)}
          onSuccess={() => setApplyingTask(null)}
        />
      )}
    </div>
  );
}
