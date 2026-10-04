/**
 * Button — Primary interactive element
 *
 * Follows NEAR JOB brand guidelines:
 * - Primary/solid: bright blue (#1968F9) with white text
 * - Outline: transparent with blue border
 * - Ghost: no border, subtle hover
 * - Danger: red for destructive actions
 *
 * All variants include focus-visible ring and smooth transitions.
 *
 * @example
 * <Button>Lamar Sekarang</Button>
 * <Button variant="outline">Lihat Detail</Button>
 * <Button size="sm" variant="ghost">Batal</Button>
 */
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger" | "success" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover shadow-sm",
  outline:
    "border-2 border-primary text-primary hover:bg-primary-light active:bg-primary-light",
  ghost: "text-gray hover:bg-light hover:text-dark active:bg-gray-border",
  danger: "bg-error text-white hover:bg-error-hover active:bg-error-hover",
  success:
    "bg-secondary text-white hover:bg-secondary-hover active:bg-secondary-hover shadow-sm",
  secondary: "bg-light text-dark hover:bg-gray-border/50 active:bg-gray-border",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-[var(--radius-md)]",
  md: "px-5 py-2.5 text-sm rounded-[var(--radius-lg)]",
  lg: "px-7 py-3 text-base rounded-[var(--radius-pill)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      loading,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isSpinnerActive = loading !== undefined ? loading : isLoading;
    return (
      <button
        ref={ref}
        disabled={disabled || isSpinnerActive}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center gap-2",
          "font-semibold transition-all duration-200 ease-out",
          "focus-ring cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          // Variant & size
          variantStyles[variant],
          sizeStyles[size],
          // Full width
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {isSpinnerActive && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
