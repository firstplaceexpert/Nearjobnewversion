/**
 * SearchBar — Main search input for job/task discovery
 */
"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
}

export function SearchBar({
  placeholder = "Cari pekerjaan, bidang, atau lokasi...",
  onSearch,
  className,
  defaultValue = "",
  value,
  onChange,
  onClear,
}: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentQuery = isControlled ? value : internalQuery;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.(currentQuery.trim());
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalQuery(e.target.value);
    }
    onChange?.(e);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative w-full max-w-2xl", className)}>
      {/* Search icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg
          className="w-5 h-5 text-gray"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        type="search"
        value={currentQuery}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={cn(
          "w-full pl-12 pr-28 py-3.5",
          "text-sm text-dark bg-white",
          "border border-gray-border",
          "rounded-[var(--radius-pill)]",
          "shadow-[var(--shadow-card)]",
          "placeholder:text-gray-light",
          "transition-all duration-200",
          "focus-ring",
          "hover:shadow-[var(--shadow-card-hover)]",
          "focus:border-primary focus:shadow-[var(--shadow-card-hover)]",
        )}
        aria-label="Cari pekerjaan"
      />

      {/* Clear button if has value and onClear provided */}
      {currentQuery && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-24 px-2 flex items-center text-gray hover:text-dark text-xs"
          aria-label="Hapus pencarian"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Search button */}
      <button
        type="submit"
        className={cn(
          "absolute inset-y-1.5 right-1.5",
          "px-5 flex items-center gap-1.5",
          "bg-primary text-white text-sm font-semibold",
          "rounded-[var(--radius-pill)]",
          "hover:bg-primary-hover",
          "transition-colors duration-200",
          "cursor-pointer",
        )}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        Cari
      </button>
    </form>
  );
}
