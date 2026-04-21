"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Plus, FlaskConical, Radio, ArrowRight } from "lucide-react";
import { PolicyStatus } from "@/lib/types";

interface QuickActionsProps {
  triggeredCount: number;
}

const actions = [
  {
    href: "/dashboard/create",
    icon: Plus,
    label: "Create Policy",
    description: "Encrypt and submit new coverage",
    accent: "from-umbra-blue/20 to-umbra-blue/5 border-umbra-blue/20 text-umbra-blue",
  },
  {
    href: "/dashboard/privacy",
    icon: FlaskConical,
    label: "Privacy Lab",
    description: "Test FHE encrypt pipeline",
    accent: "from-umbra-violet/20 to-umbra-violet/5 border-umbra-violet/20 text-umbra-violet",
  },
  {
    href: "/dashboard/oracle",
    icon: Radio,
    label: "Oracle Feeds",
    description: "Live Chainlink on Sepolia",
    accent: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400",
  },
] as const;

export function QuickActions({ triggeredCount }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {actions.map((action, i) => (
        <motion.div
          key={action.href}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <Link href={action.href}>
            <Card className="p-4 h-full hover:border-white/15 transition-all group cursor-pointer">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.accent} border flex items-center justify-center mb-3`}
              >
                <action.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-white group-hover:text-umbra-cyan transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-umbra-muted mt-0.5">{action.description}</p>
              <ArrowRight className="w-3.5 h-3.5 text-umbra-muted mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          </Link>
        </motion.div>
      ))}
      {triggeredCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="sm:col-span-3"
        >
          <Link href={`/dashboard/policies?status=${PolicyStatus.Triggered}`}>
            <Card className="p-4 border-umbra-warning/30 bg-umbra-warning/5 hover:bg-umbra-warning/10 transition-colors">
              <p className="text-sm font-medium text-umbra-warning">
                {triggeredCount} {triggeredCount === 1 ? "policy needs" : "policies need"} settlement
              </p>
              <p className="text-xs text-umbra-muted mt-0.5">Review triggered policies and execute payout →</p>
            </Card>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
