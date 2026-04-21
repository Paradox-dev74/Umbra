/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Status Badge Component
   ═══════════════════════════════════════════════════════════ */

"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "muted";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-white/5 text-white border-white/10",
  success: "bg-umbra-success/10 text-umbra-success border-umbra-success/20",
  warning: "bg-umbra-warning/10 text-umbra-warning border-umbra-warning/20",
  danger: "bg-umbra-danger/10 text-umbra-danger border-umbra-danger/20",
  info: "bg-umbra-blue/10 text-umbra-blue border-umbra-blue/20",
  muted: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-white",
  success: "bg-umbra-success",
  warning: "bg-umbra-warning",
  danger: "bg-umbra-danger",
  info: "bg-umbra-blue",
  muted: "bg-gray-500",
};

export function Badge({
  children,
  variant = "default",
  dot = false,
  pulse = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                dotColors[variant]
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              dotColors[variant]
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}
