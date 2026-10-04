"use client";

import { SearchBar } from "@/components/ui/search-bar";
import { TASK_CATEGORIES, JOB_TYPE_BADGE } from "@/lib/constants";
import { X } from "lucide-react";

interface TaskFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  onReset: () => void;
}

export function TaskFilter({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedType,
  onTypeChange,
  selectedLocation,
  onLocationChange,
  onReset,
}: TaskFilterProps) {
  const hasActiveFilters =
    search ||
    (selectedCategory && selectedCategory !== "Semua Kategori") ||
    selectedType !== "ALL" ||
    selectedLocation;

  return (
    <div className="bg-white rounded-2xl border border-gray-border p-4 sm:p-5 shadow-xs space-y-4">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange("")}
            placeholder="Cari pekerjaan, keahlian, atau tugas (misal: angkut barang, jaga booth)..."
          />
        </div>

        {/* Location quick filter */}
        <div className="sm:w-64 relative">
          <input
            type="text"
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Filter Kota / Daerah..."
            className="w-full px-3.5 py-2.5 bg-light rounded-xl text-xs sm:text-sm text-dark placeholder:text-gray-light border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all pl-9"
          />
          <svg
            className="w-4 h-4 text-gray absolute left-3 top-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      </div>

      {/* Category horizontal scroll / chips */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-gray uppercase tracking-wider block">
          Kategori Pekerjaan
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TASK_CATEGORIES.map((cat) => {
            const isSelected =
              selectedCategory === cat || (!selectedCategory && cat === "Semua Kategori");
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-primary text-white shadow-xs"
                    : "bg-light text-dark hover:bg-gray-border/50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Job Type Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-light">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray uppercase tracking-wider mr-1">
            Tipe Tugas:
          </span>

          <button
            type="button"
            onClick={() => onTypeChange("ALL")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedType === "ALL"
                ? "bg-dark text-white"
                : "bg-light text-gray hover:text-dark"
            }`}
          >
            Semua
          </button>

          {Object.entries(JOB_TYPE_BADGE).map(([typeKey, config]) => {
            const isSelected = selectedType === typeKey;
            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => onTypeChange(typeKey)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-primary text-white ring-2 ring-primary/30"
                    : "bg-light text-gray hover:bg-gray-border/40"
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-error hover:text-error-hover font-semibold transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>
    </div>
  );
}
