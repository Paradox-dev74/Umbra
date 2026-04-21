/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Canvas Particle Field Background
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useRef } from "react";
import { useParticles } from "@/hooks/useParticles";
import { cn } from "@/lib/utils";

interface ParticleCanvasProps {
  className?: string;
  count?: number;
}

export function ParticleCanvas({ className, count = 150 }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useParticles(canvasRef, {
    count,
    speed: 0.3,
    minOpacity: 0.2,
    maxOpacity: 0.5,
    minRadius: 1,
    maxRadius: 2,
  });

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "absolute inset-0 w-full h-full pointer-events-none z-0",
        className
      )}
    />
  );
}
