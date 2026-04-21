/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Design System Button
   ═══════════════════════════════════════════════════════════ */

"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost" | "danger" | "outline";
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
    "bg-umbra-blue text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]",
  ghost:
    "bg-transparent border border-white/20 text-white hover:bg-white/5",
  danger:
    "bg-umbra-danger/10 border border-umbra-danger/30 text-umbra-danger hover:bg-umbra-danger/20",
  outline:
    "bg-transparent border border-umbra-blue/30 text-umbra-blue hover:bg-umbra-blue/10",
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
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-umbra-blue/50 focus:ring-offset-2 focus:ring-offset-umbra-bg",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          variantStyles[variant],
          sizeStyles[size],
          pill ? "rounded-full" : "rounded-lg",
          glow && variant === "primary" && "shadow-blue-glow-sm",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
