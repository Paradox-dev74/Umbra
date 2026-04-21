/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Animated Count-Up Stat Component
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { easeOut } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  label: string;
  className?: string;
}

export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2000,
  label,
  className,
}: StatCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const animateValue = useCallback(() => {
    if (hasAnimated) return;
    setHasAnimated(true);

    const startTime = performance.now();

    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);
      const currentValue = easedProgress * value;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [value, duration, hasAnimated]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateValue();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [animateValue]);

  const formattedValue = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.floor(displayValue).toLocaleString();

  return (
    <div ref={elementRef} className={cn("text-center", className)}>
      <div className="font-mono text-3xl md:text-4xl font-bold text-umbra-blue">
        {prefix}
        {formattedValue}
        {suffix}
      </div>
      <div className="mt-2 text-sm text-umbra-muted">{label}</div>
    </div>
  );
}
