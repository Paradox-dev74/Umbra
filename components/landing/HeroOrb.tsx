/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Hero Energy Orb with Orbit Rings
   ═══════════════════════════════════════════════════════════ */

"use client";

import { cn } from "@/lib/utils";

export function HeroOrb({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute top-1/2 left-1/2 -translate-y-1/2 translate-x-[10%] z-[1]",
        className
      )}
    >
      {/* Animated container with pulse */}
      <div className="relative animate-orb-pulse">
        {/* LAYER: Outer blue diffusion */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.06) 0%, transparent 70%)",
          }}
        />

        {/* LAYER: Mid glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[280px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(96,165,250,0.15) 0%, rgba(59,130,246,0.08) 40%, transparent 70%)",
          }}
        />

        {/* LAYER: Core burst */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[150px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(147,197,253,0.6) 25%, rgba(59,130,246,0.3) 55%, transparent 75%)",
            filter: "blur(2px)",
          }}
        />

        {/* ORBIT RING 1 — largest, slowest */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[320px] rounded-full border border-white/[0.12] animate-orbit-1 pointer-events-none"
          style={{ transform: "translate(-50%, -50%) rotate(-15deg)" }}
        >
          {/* Traveling dot on Ring 1 */}
          <div
            className="absolute w-[6px] h-[6px] bg-white rounded-full"
            style={{
              filter: "blur(1px)",
              offsetPath: "ellipse(250px 160px at 50% 50%)",
              animation: "dot-travel 8s linear infinite",
            }}
          />
        </div>

        {/* ORBIT RING 2 */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[240px] rounded-full animate-orbit-2 pointer-events-none"
          style={{
            border: "1px solid rgba(96,165,250,0.15)",
            transform: "translate(-50%, -50%) rotate(-25deg)",
          }}
        />

        {/* ORBIT RING 3 — smallest, fastest */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[160px] rounded-full animate-orbit-3 pointer-events-none"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            transform: "translate(-50%, -50%) rotate(-35deg)",
          }}
        />

        {/* RIGHT SIDE BEAM — sharp light extending from orb */}
        <div
          className="absolute top-1/2 right-0 translate-x-[60%] -translate-y-1/2 w-[55vw] h-[30%] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(147,197,253,0.15) 30%, transparent 80%)",
            filter: "blur(20px)",
            minHeight: "120px",
          }}
        />
      </div>
    </div>
  );
}
