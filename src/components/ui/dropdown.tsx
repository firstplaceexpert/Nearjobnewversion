/**
 * Dropdown — Filter dropdown for location, category, etc.
 *
 * Uses native <select> for accessibility and mobile compatibility,
 * wrapped in brand-consistent styling.
 *
 * @example
 * <Dropdown
 *   label="Lokasi"
 *   options={[
 *     { value: "", label: "Lokasi Saya" },
 *     { value: "jakarta", label: "Jakarta" },
 *   ]}
 * />
 */
import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: DropdownOption[];
  error?: string;
  icon?: React.ReactNode;
}

export const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  ({ label, options, error, icon, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-dark mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray">
              {icon}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full px-4 py-2.5 text-sm text-dark",
              "bg-white border rounded-[var(--radius-lg)]",
              "appearance-none cursor-pointer",
              "transition-all duration-200",
              "focus-ring",
              icon && "pl-10",
              error
                ? "border-error"
                : "border-gray-border hover:border-gray focus:border-primary",
              className,
            )}
            aria-invalid={!!error}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom chevron */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-gray"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Dropdown.displayName = "Dropdown";
