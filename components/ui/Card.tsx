/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Dark Card Component
   ═══════════════════════════════════════════════════════════ */

"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  glowColor?: "blue" | "violet" | "green";
  hover?: boolean;
  onClick?: () => void;
}

const glowStyles = {
  blue: "hover:border-umbra-blue/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.06)]",
  violet: "hover:border-umbra-violet/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.06)]",
  green: "hover:border-umbra-success/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.06)]",
};

export function Card({
  children,
  className,
  glow = false,
  glowColor = "blue",
  hover = false,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-white/[0.06] bg-umbra-card shadow-card-dark",
        hover && "transition-all duration-300 cursor-pointer hover:inset-shadow-[0_0_20px_rgba(59,130,246,0.05)]",
        glow && glowStyles[glowColor],
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-4 border-b border-white/[0.06]", className)}>
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}
