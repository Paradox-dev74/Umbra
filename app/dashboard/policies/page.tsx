/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — My Policies Page
   ═══════════════════════════════════════════════════════════ */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PolicyTable } from "@/components/dashboard/PolicyTable";
import { useUserPolicies } from "@/hooks/useUmbraContract";
import { Plus, RefreshCw } from "lucide-react";

export default function PoliciesPage() {
  const { policies, isLoading, refetch } = useUserPolicies();

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Policies</h1>
          <p className="text-umbra-muted text-sm mt-1">
            All policies you hold on-chain
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg text-umbra-muted hover:text-white border border-white/10 hover:bg-white/5 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Link href="/dashboard/create">
            <Button variant="primary" pill>
              <Plus className="w-4 h-4" />
              New Policy
            </Button>
          </Link>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">All Policies</h2>
            <Badge variant="info">
              {isLoading ? "Loading…" : `${policies.length} total`}
            </Badge>
          </div>
          {isLoading ? (
            <div className="text-center py-16 text-umbra-muted">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" />
              Loading policies from chain…
            </div>
          ) : (
            <PolicyTable policies={policies} />
          )}
        </Card>
      </motion.div>
    </div>
  );
}
