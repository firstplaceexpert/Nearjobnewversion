/**
 * Badge — Color-coded status/type indicator
 */
import { cn } from "@/lib/utils";

type BadgeVariant = "primary" | "success" | "warning" | "error" | "accent" | "neutral";

type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-primary-light text-primary",
  success: "bg-success-light text-success font-semibold",
  warning: "bg-warning-light text-warning font-semibold",
  error: "bg-error-light text-error font-semibold",
  accent: "bg-accent text-primary font-semibold",
  neutral: "bg-light text-gray",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm font-semibold",
};

export function Badge({
  variant = "neutral",
  size = "md",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold",
        "rounded-[var(--radius-pill)]",
        "transition-colors duration-150",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
