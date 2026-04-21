/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Policy Card (Dashboard)
   ═══════════════════════════════════════════════════════════ */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "./StatusBadge";
import { RISK_CATEGORIES } from "@/lib/constants";
import { formatAddress, formatRelativeTime } from "@/lib/utils";
import { ArrowRight, Lock } from "lucide-react";

interface PolicyCardProps {
  policy: {
    id: bigint;
    enterprise: `0x${string}`;
    beneficiary: `0x${string}`;
    riskCategory: number;
    status: number;
    oracleFeed: `0x${string}`;
    createdAt: bigint;
    policyReferenceHash: `0x${string}`;
  };
  index: number;
}

export function PolicyCard({ policy, index }: PolicyCardProps) {
  const category = RISK_CATEGORIES[policy.riskCategory];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      }}
    >
      <Link href={`/dashboard/policy/${Number(policy.id)}`}>
        <Card
          className="p-5 transition-all duration-200 group hover:border-umbra-blue/20"
          hover
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category?.icon ?? "📋"}</span>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  Policy #{Number(policy.id)}
                </h3>
                <p className="text-umbra-muted text-xs">
                  {category?.label ?? "Unknown"}
                </p>
              </div>
            </div>
            <StatusBadge status={policy.status} />
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-umbra-muted">Coverage</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-white/70 tracking-widest">
                  ████████
                </span>
                <Lock className="w-3 h-3 text-umbra-violet" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-umbra-muted">Threshold</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-white/70 tracking-widest">
                  ████████
                </span>
                <Lock className="w-3 h-3 text-umbra-violet" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-umbra-muted">Beneficiary</span>
              <span className="text-xs text-white/80 font-mono">
                {formatAddress(policy.beneficiary)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <span className="text-xs text-umbra-muted">
              {formatRelativeTime(policy.createdAt)}
            </span>
            <span className="text-xs text-umbra-blue flex items-center gap-1 group-hover:gap-2 transition-all">
              View
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
