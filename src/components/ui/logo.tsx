/**
 * Logo — Brand mark component for NEAR JOB
 *
 * Renders the official NEAR JOB brand mascot icon with optional text.
 *
 * @example
 * <Logo />
 * <Logo size="lg" />
 * <Logo showText={false} />
 */
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
}

const sizeMap: Record<LogoSize, { icon: number; text: string; radius: string }> = {
  sm: { icon: 30, text: "text-lg", radius: "rounded-lg" },
  md: { icon: 38, text: "text-xl", radius: "rounded-xl" },
  lg: { icon: 52, text: "text-2xl", radius: "rounded-2xl" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const { icon, text, radius } = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Official NearJob Mascot Brand Mark */}
      <div
        className={cn(
          "relative overflow-hidden shrink-0 shadow-xs border border-primary/20 bg-[#1968F9]",
          radius,
        )}
        style={{ width: icon, height: icon }}
      >
        <Image
          src="/logo.png?v=2"
          alt="NEAR JOB Logo"
          width={icon}
          height={icon}
          className="w-full h-full object-cover"
          priority
          unoptimized
        />
      </div>

      {showText && (
        <span className={cn("font-bold tracking-tight text-dark", text)}>
          NEAR<span className="text-primary"> JOB</span>
        </span>
      )}
    </div>
  );
}
