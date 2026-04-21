"use client";

import { ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardPageHeader({
  title,
  description,
  actions,
  onRefresh,
  isRefreshing,
}: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{title}</h1>
        {description && <p className="text-umbra-muted text-sm mt-1.5 max-w-2xl">{description}</p>}
      </div>
      {(actions || onRefresh) && (
        <div className="flex items-center gap-3 shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl text-umbra-muted hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
              title="Refresh data"
              aria-label="Refresh data"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </button>
          )}
          {actions}
        </div>
      )}
    </div>
  );
}
