/**
 * Card — Container for task/job listings and content blocks
 *
 * Provides consistent elevation, border-radius, and hover behavior
 * across all card surfaces in the app.
 *
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Kurir Antar Dokumen</CardTitle>
 *     <CardDescription>Jakarta Selatan</CardDescription>
 *   </CardHeader>
 *   <CardContent>...</CardContent>
 *   <CardFooter>...</CardFooter>
 * </Card>
 */
import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

/* ── Card Root ───────────────────────────────────────────── */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, hover, className, children, ...props }, ref) => {
    const isHoverable = hover !== undefined ? hover : hoverable;
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-[var(--radius-xl)] border border-gray-border/50",
          "shadow-[var(--shadow-card)]",
          "transition-all duration-200 ease-out",
          isHoverable &&
            "hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 cursor-pointer",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";

/* ── Card Header ─────────────────────────────────────────── */
export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5 pb-3", className)} {...props}>
      {children}
    </div>
  );
}

/* ── Card Title ──────────────────────────────────────────── */
export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-bold text-dark leading-snug", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

/* ── Card Description ────────────────────────────────────── */
export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-gray mt-1", className)} {...props}>
      {children}
    </p>
  );
}

/* ── Card Content ────────────────────────────────────────── */
export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-5 py-3", className)} {...props}>
      {children}
    </div>
  );
}

/* ── Card Footer ─────────────────────────────────────────── */
export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-5 pt-3 pb-5 flex items-center gap-3", className)} {...props}>
      {children}
    </div>
  );
}
