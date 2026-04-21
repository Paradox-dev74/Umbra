"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PolicyTable } from "@/components/dashboard/PolicyTable";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { WalletConnectPrompt } from "@/components/dashboard/WalletConnectPrompt";
import { useUserPolicies } from "@/hooks/useUmbraContract";
import { POLICY_STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Plus, RefreshCw } from "lucide-react";

const FILTER_TABS = [
  { key: "all", label: "All" },
  ...Object.entries(POLICY_STATUS_CONFIG).map(([status, cfg]) => ({
    key: status,
    label: cfg.label,
  })),
];

function PoliciesContent() {
  const { isConnected } = useAccount();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") ?? "all";
  const { policies, isLoading, refetch } = useUserPolicies();

  const filtered = useMemo(() => {
    if (statusFilter === "all") return policies;
    const statusNum = Number(statusFilter);
    if (Number.isNaN(statusNum)) return policies;
    return policies.filter((p) => p.status === statusNum);
  }, [policies, statusFilter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: policies.length };
    for (const p of policies) {
      const key = String(p.status);
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [policies]);

  if (!isConnected) {
    return (
      <div className="px-4 md:px-8 max-w-4xl mx-auto">
        <DashboardPageHeader title="My Policies" description="View and manage all policies held by your wallet." />
        <WalletConnectPrompt title="Connect to view policies" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="My Policies"
        description="Filter by status, open policy details, or create new encrypted coverage."
        onRefresh={() => refetch()}
        isRefreshing={isLoading}
        actions={
          <Link href="/dashboard/create">
            <Button variant="primary" pill>
              <Plus className="w-4 h-4" />
              New Policy
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_TABS.map((tab) => {
          const active = statusFilter === tab.key;
          const count = counts[tab.key] ?? 0;
          if (tab.key !== "all" && count === 0 && !active) return null;
          return (
            <Link
              key={tab.key}
              href={tab.key === "all" ? "/dashboard/policies" : `/dashboard/policies?status=${tab.key}`}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                active
                  ? "bg-umbra-cyan/10 border-umbra-cyan/30 text-umbra-cyan"
                  : "border-white/10 text-umbra-muted hover:text-white hover:border-white/20"
              )}
            >
              {tab.label}
              {count > 0 && <span className="ml-1.5 opacity-70">({count})</span>}
            </Link>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {statusFilter === "all"
                ? "All Policies"
                : POLICY_STATUS_CONFIG[Number(statusFilter)]?.label ?? "Policies"}
            </h2>
            <Badge variant="info">{isLoading ? "Loading…" : `${filtered.length} shown`}</Badge>
          </div>
          <PolicyTable policies={filtered} isLoading={isLoading} />
        </Card>
      </motion.div>
    </div>
  );
}

export default function PoliciesPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 md:px-8 max-w-7xl mx-auto py-20 text-center text-umbra-muted">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" />
          Loading policies…
        </div>
      }
    >
      <PoliciesContent />
    </Suspense>
  );
}
