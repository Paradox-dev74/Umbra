"use client";

import { motion } from "framer-motion";
import { Check, Lock, Radio, Send, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type TimelineStep =
  | "encrypt"
  | "submit"
  | "oracle"
  | "settle"
  | "audit";

const STEPS: {
  key: TimelineStep;
  label: string;
  icon: typeof Lock;
}[] = [
  { key: "encrypt", label: "Encrypt terms", icon: Lock },
  { key: "submit", label: "Submit policy", icon: Shield },
  { key: "oracle", label: "Oracle resolve", icon: Radio },
  { key: "settle", label: "Privara settle", icon: Send },
  { key: "audit", label: "Audit review", icon: Zap },
];

function stepIndex(step: TimelineStep): number {
  return STEPS.findIndex((s) => s.key === step);
}

export function PolicyTimeline({
  currentStep,
  completedSteps = [],
  className,
}: {
  currentStep: TimelineStep;
  completedSteps?: TimelineStep[];
  className?: string;
}) {
  const currentIdx = stepIndex(currentStep);

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center justify-between gap-2">
        {STEPS.map((step, idx) => {
          const done = completedSteps.includes(step.key) || idx < currentIdx;
          const active = step.key === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <motion.div
                animate={{
                  scale: active ? 1.05 : 1,
                  boxShadow: active
                    ? "0 0 20px rgba(34,211,238,0.25)"
                    : "none",
                }}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center border transition-colors",
                  done
                    ? "bg-umbra-success/15 border-umbra-success/40 text-umbra-success"
                    : active
                      ? "bg-umbra-cyan/15 border-umbra-cyan/40 text-umbra-cyan"
                      : "bg-white/[0.03] border-white/10 text-umbra-muted"
                )}
              >
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </motion.div>
              <span
                className={cn(
                  "text-[10px] text-center truncate w-full",
                  active ? "text-white" : done ? "text-umbra-success" : "text-umbra-muted"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="absolute top-[18px] left-[10%] right-[10%] h-px bg-white/10 -z-10" />
    </div>
  );
}

export function policyStatusToTimelineStep(status: number): TimelineStep {
  if (status >= 2) return "audit";
  if (status === 1) return "settle";
  return "oracle";
}
