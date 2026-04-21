/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Multi-Step Form Progress Indicator
   ═══════════════════════════════════════════════════════════ */

"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  label: string;
  description?: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function ProgressSteps({
  steps,
  currentStep,
  className,
}: ProgressStepsProps) {
  return (
    <div className={cn("flex items-center w-full", className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isUpcoming = stepNumber > currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-300",
                  isCompleted &&
                    "bg-umbra-blue border-umbra-blue text-white",
                  isCurrent &&
                    "bg-umbra-blue/20 border-umbra-blue text-umbra-blue",
                  isUpcoming &&
                    "bg-transparent border-white/10 text-white/30"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs whitespace-nowrap",
                  isCurrent && "text-umbra-blue font-medium",
                  isCompleted && "text-umbra-muted",
                  isUpcoming && "text-white/20"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-[2px] mx-4 mt-[-20px] transition-colors duration-300",
                  stepNumber < currentStep
                    ? "bg-umbra-blue"
                    : "bg-white/10"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
