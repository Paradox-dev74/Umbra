"use client";

import { cn } from "@/lib/utils";

interface MeshBackgroundProps {
  className?: string;
  intensity?: "subtle" | "medium" | "strong";
  hex?: boolean;
}

export function MeshBackground({ className, intensity = "medium", hex = false }: MeshBackgroundProps) {
  const opacity = {
    subtle: "opacity-40",
    medium: "opacity-70",
    strong: "opacity-100",
  }[intensity];

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className={cn("absolute inset-0 umbra-mesh", opacity)} />
      {hex && <div className="absolute inset-0 umbra-hex-grid opacity-50" />}
      <div className="absolute -top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full bg-umbra-cyan/10 blur-[120px] animate-mesh-drift" />
      <div
        className="absolute -bottom-1/4 -right-1/4 w-[50%] h-[50%] rounded-full bg-umbra-violet/10 blur-[100px] animate-mesh-drift"
        style={{ animationDelay: "-7s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-umbra-blue/5 blur-[80px] animate-mesh-drift"
        style={{ animationDelay: "-14s" }}
      />
    </div>
  );
}
