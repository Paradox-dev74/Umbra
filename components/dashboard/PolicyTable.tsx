/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Policy Table (Dashboard)
   ═══════════════════════════════════════════════════════════ */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { RISK_CATEGORIES, ORACLE_FEEDS } from "@/lib/constants";
import { formatAddress, formatRelativeTime } from "@/lib/utils";
import { ArrowRight, Lock } from "lucide-react";

interface PolicyTableProps {
  policies: Array<{
    id: bigint;
    enterprise: `0x${string}`;
    beneficiary: `0x${string}`;
    riskCategory: number;
    status: number;
    oracleFeed: `0x${string}`;
    createdAt: bigint;
    policyReferenceHash: `0x${string}`;
  }>;
}

export function PolicyTable({ policies }: PolicyTableProps) {
  if (policies.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          No policies yet
        </h3>
        <p className="text-umbra-muted text-sm mb-6">
          Create your first confidential parametric insurance policy.
        </p>
        <Link
          href="/dashboard/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-umbra-blue text-white rounded-full text-sm font-medium hover:shadow-blue-glow-sm transition-all"
        >
          Create Policy
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const getOracleName = (address: string): string => {
    const feed = Object.values(ORACLE_FEEDS).find(
      (f) => f.address.toLowerCase() === address.toLowerCase()
    );
    return feed?.name ?? formatAddress(address);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="text-left text-xs text-umbra-muted font-medium py-3 px-4">
              Policy ID
            </th>
            <th className="text-left text-xs text-umbra-muted font-medium py-3 px-4">
              Risk Category
            </th>
            <th className="text-left text-xs text-umbra-muted font-medium py-3 px-4">
              Status
            </th>
            <th className="text-left text-xs text-umbra-muted font-medium py-3 px-4">
              Coverage
            </th>
            <th className="text-left text-xs text-umbra-muted font-medium py-3 px-4">
              Threshold
            </th>
            <th className="text-left text-xs text-umbra-muted font-medium py-3 px-4">
              Oracle Feed
            </th>
            <th className="text-left text-xs text-umbra-muted font-medium py-3 px-4">
              Created
            </th>
            <th className="text-right text-xs text-umbra-muted font-medium py-3 px-4">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {policies.map((policy, i) => {
            const category = RISK_CATEGORIES[policy.riskCategory];
            return (
              <motion.tr
                key={Number(policy.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="border-b border-white/[0.03] hover:bg-white/[0.02] group transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-8 bg-transparent group-hover:bg-umbra-blue rounded-full transition-colors" />
                    <span className="text-white font-mono text-sm">
                      #{Number(policy.id)}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span>{category?.icon ?? "📋"}</span>
                    <span className="text-sm text-white">
                      {category?.label ?? "Unknown"}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <StatusBadge status={policy.status} />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-mono text-white/60 tracking-wider">
                      ████████
                    </span>
                    <Lock className="w-3 h-3 text-umbra-violet" />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-mono text-white/60 tracking-wider">
                      ████████
                    </span>
                    <Lock className="w-3 h-3 text-umbra-violet" />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-umbra-muted">
                    {getOracleName(policy.oracleFeed)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-umbra-muted">
                    {formatRelativeTime(policy.createdAt)}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <Link
                    href={`/dashboard/policy/${Number(policy.id)}`}
                    className="inline-flex items-center gap-1 text-sm text-umbra-blue hover:text-umbra-blue-light transition-colors"
                  >
                    View
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
