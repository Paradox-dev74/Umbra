"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PolicyTable } from "@/components/dashboard/PolicyTable";
import { PrivatePortfolioCard } from "@/components/dashboard/PrivatePortfolioCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { WalletConnectPrompt } from "@/components/dashboard/WalletConnectPrompt";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { OracleTicker } from "@/components/dashboard/OracleTicker";
import { useUserPolicies } from "@/hooks/useUmbraContract";
import { formatAddress } from "@/lib/utils";
import { Plus, Lock, ArrowRight } from "lucide-react";
import { PolicyStatus } from "@/lib/types";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { policies, isLoading, refetch } = useUserPolicies();

  const activeCount = policies.filter((p) => p.status === PolicyStatus.Active).length;
  const triggeredCount = policies.filter((p) => p.status === PolicyStatus.Triggered).length;
  const recentPolicies = policies.slice(0, 5);

  if (!isConnected) {
    return (
      <div className="px-4 md:px-8 max-w-4xl mx-auto">
        <DashboardPageHeader
          title="Overview"
          description="Confidential parametric insurance on Ethereum Sepolia with FHE-encrypted policy terms."
        />
        <WalletConnectPrompt />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Overview"
        description={`Welcome back, ${address ? formatAddress(address) : "—"}. Monitor policies, oracle feeds, and encrypted portfolio totals.`}
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {[
          { label: "Active", value: isLoading ? "—" : String(activeCount), color: "bg-umbra-success" },
          {
            label: "Triggered",
            value: isLoading ? "—" : String(triggeredCount),
            color: "bg-umbra-warning",
            highlight: triggeredCount > 0,
          },
          { label: "Total Policies", value: isLoading ? "—" : String(policies.length), color: "bg-umbra-blue" },
          { label: "Coverage", value: "Encrypted", encrypted: true },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className={`p-4 md:p-5 ${stat.highlight ? "border-umbra-warning/30 bg-umbra-warning/5" : ""}`}
            >
              <p className="text-[11px] uppercase tracking-wider text-umbra-muted mb-2">{stat.label}</p>
              {"encrypted" in stat && stat.encrypted ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-mono text-white/40 tracking-widest">████████</span>
                  <Lock className="w-3.5 h-3.5 text-umbra-violet" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stat.color}`} />
                  <span className="text-2xl font-bold text-white tabular-nums">{stat.value}</span>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mb-8">
        <QuickActions triggeredCount={triggeredCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <PrivatePortfolioCard />
          <ActivityFeed limit={8} />
        </div>
        <div className="space-y-6">
          <OracleTicker />
          <Card className="p-5">
            <p className="text-xs text-umbra-muted uppercase tracking-wider mb-2">How it works</p>
            <ol className="space-y-3 text-sm text-white/80">
              <li className="flex gap-2">
                <span className="text-umbra-cyan font-mono text-xs">01</span>
                Encrypt coverage, premium, and thresholds with CoFHE
              </li>
              <li className="flex gap-2">
                <span className="text-umbra-cyan font-mono text-xs">02</span>
                Chainlink oracle resolves against sealed ciphertexts
              </li>
              <li className="flex gap-2">
                <span className="text-umbra-cyan font-mono text-xs">03</span>
                Settle triggered policies — decrypt only in your session
              </li>
            </ol>
            <Link
              href="/dashboard/privacy"
              className="inline-flex items-center gap-1 text-xs text-umbra-blue hover:underline mt-4"
            >
              Open Privacy Lab
              <ArrowRight className="w-3 h-3" />
            </Link>
          </Card>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Recent Policies</h2>
              <p className="text-xs text-umbra-muted mt-0.5">Latest on-chain policies for your wallet</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info">{isLoading ? "…" : `${policies.length} total`}</Badge>
              {policies.length > 5 && (
                <Link href="/dashboard/policies">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <PolicyTable policies={recentPolicies} isLoading={isLoading} compact />
        </Card>
      </motion.div>
    </div>
  );
}
