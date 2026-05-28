"use client";

import { cn } from "@/lib/utils";
import { Shield, Radio, Scale, Eye, Crown, User } from "lucide-react";
import type { UmbraRole } from "@/hooks/useUserRole";

const ROLE_META: Record<
  UmbraRole,
  { label: string; icon: typeof Shield; className: string }
> = {
  guest: { label: "Guest", icon: User, className: "border-white/10 bg-white/[0.02]" },
  holder: { label: "Policyholder", icon: Shield, className: "border-umbra-blue/25 bg-umbra-blue/5" },
  oracle: { label: "Oracle Operator", icon: Radio, className: "border-amber-500/25 bg-amber-500/5" },
  owner: { label: "Contract Owner", icon: Crown, className: "border-umbra-violet/25 bg-umbra-violet/5" },
  beneficiary: { label: "Beneficiary", icon: Shield, className: "border-umbra-success/25 bg-umbra-success/5" },
  arbitrator: { label: "Arbitrator", icon: Scale, className: "border-umbra-warning/25 bg-umbra-warning/5" },
  reinsurer: { label: "Reinsurer", icon: Eye, className: "border-umbra-cyan/25 bg-umbra-cyan/5" },
};

export function RoleBanner({
  roles,
  message,
  className,
}: {
  roles: UmbraRole[];
  message?: string;
  className?: string;
}) {
  const visible = roles.filter((r) => r !== "guest" && r !== "holder");
  if (visible.length === 0 && !message) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visible.map((role) => {
        const meta = ROLE_META[role];
        const Icon = meta.icon;
        return (
          <span
            key={role}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
              meta.className
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {meta.label}
          </span>
        );
      })}
      {message && <p className="text-xs text-umbra-muted w-full mt-1">{message}</p>}
    </div>
  );
}
