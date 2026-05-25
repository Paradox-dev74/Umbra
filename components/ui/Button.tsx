"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost" | "danger" | "outline" | "violet";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-umbra-cyan to-umbra-cyan-dim text-umbra-bg font-semibold hover:shadow-[0_0_40px_rgba(34,211,238,0.35)]",
  ghost:
    "bg-white/[0.03] border border-white/10 text-white hover:bg-white/[0.06] hover:border-white/20",
  danger:
    "bg-umbra-danger/10 border border-umbra-danger/30 text-umbra-danger hover:bg-umbra-danger/20",
  outline:
    "bg-transparent border border-umbra-cyan/40 text-umbra-cyan hover:bg-umbra-cyan/10",
  violet:
    "bg-gradient-to-r from-umbra-violet-dim to-umbra-violet text-white hover:shadow-[0_0_32px_rgba(167,139,250,0.3)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function ButtonInner(
    {
      variant = "primary",
      size = "md",
      pill = false,
      glow = false,
      className,
      children,
      ...props
    },
    ref
  ) {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer overflow-hidden",
          "focus:outline-none focus:ring-2 focus:ring-umbra-cyan/40 focus:ring-offset-2 focus:ring-offset-umbra-bg",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          variantStyles[variant],
          sizeStyles[size],
          pill ? "rounded-full" : "rounded-xl",
          glow && variant === "primary" && "shadow-cyan-glow-sm",
          className
        )}
        {...props}
      >
        {variant === "primary" && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
        )}
        {children}
      </motion.button>
    );
  }
);
