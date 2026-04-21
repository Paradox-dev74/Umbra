/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Policy Status Badge (Dashboard)
   ═══════════════════════════════════════════════════════════ */

"use client";

import { Badge } from "@/components/ui/Badge";
import { POLICY_STATUS_CONFIG } from "@/lib/constants";

interface StatusBadgeProps {
  status: number;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = POLICY_STATUS_CONFIG[status] ?? POLICY_STATUS_CONFIG[0];

  const variantMap: Record<number, "success" | "warning" | "info" | "muted" | "danger"> = {
    0: "success",
    1: "warning",
    2: "info",
    3: "muted",
    4: "danger",
    5: "muted",
  };

  return (
    <Badge
      variant={variantMap[status] ?? "muted"}
      dot
      pulse={status === 0 || status === 1}
      className={className}
    >
      {config.label}
    </Badge>
  );
}
