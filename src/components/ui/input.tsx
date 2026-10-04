/**
 * Input — Text input with label, error state, and optional icon
 *
 * Always pair with Zod validation on the server side.
 * Client-side validation is for UX convenience only.
 *
 * @example
 * <Input label="Email" placeholder="you@example.com" type="email" />
 * <Input label="Password" type="password" error="Password minimal 8 karakter" />
 */
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-dark mb-1.5">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full px-4 py-2.5 text-sm text-dark",
              "bg-white border rounded-[var(--radius-lg)]",
              "placeholder:text-gray-light",
              "transition-all duration-200",
              "focus-ring",
              // Icon padding
              icon && "pl-10",
              // Error state
              error
                ? "border-error focus:ring-error/20"
                : "border-gray-border hover:border-gray focus:border-primary",
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-xs text-error flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-gray-light">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
