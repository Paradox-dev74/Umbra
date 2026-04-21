"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LandingSectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "left";
}

export function LandingSection({
  id,
  children,
  className,
  eyebrow,
  title,
  subtitle,
  align = "center",
}: LandingSectionProps) {
  return (
    <section id={id} className={cn("relative py-24 md:py-32 overflow-hidden", className)}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={cn("mb-14 md:mb-16", align === "center" ? "text-center max-w-3xl mx-auto" : "max-w-2xl")}
        >
          {eyebrow && (
            <p className="text-umbra-cyan text-xs font-mono uppercase tracking-[0.2em] mb-4">{eyebrow}</p>
          )}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-umbra-muted text-base md:text-lg mt-4 leading-relaxed">{subtitle}</p>
          )}
        </motion.div>
        {children}
      </div>
    </section>
  );
}
