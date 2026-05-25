"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  glowColor?: "cyan" | "blue" | "violet" | "green";
  hover?: boolean;
  glass?: boolean;
  gradientBorder?: boolean;
  onClick?: () => void;
}

const glowStyles = {
  cyan: "hover:border-umbra-cyan/30 hover:shadow-[0_0_32px_rgba(34,211,238,0.08)]",
  blue: "hover:border-umbra-blue/30 hover:shadow-[0_0_32px_rgba(59,130,246,0.08)]",
  violet: "hover:border-umbra-violet/30 hover:shadow-[0_0_32px_rgba(167,139,250,0.08)]",
  green: "hover:border-umbra-success/30 hover:shadow-[0_0_32px_rgba(52,211,153,0.08)]",
};

export function Card({
  children,
  className,
  glow = false,
  glowColor = "cyan",
  hover = false,
  glass = false,
  gradientBorder = false,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-umbra-card shadow-card-dark shadow-inner-glow overflow-hidden",
        glass && "glass-panel bg-umbra-card/80",
        gradientBorder && "umbra-gradient-border border-0",
        hover && "transition-all duration-300 cursor-pointer hover:-translate-y-0.5",
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
    <div className={cn("px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]", className)}>
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
