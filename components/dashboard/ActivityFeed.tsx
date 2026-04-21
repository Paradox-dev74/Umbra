"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UMBRA_CONTRACT_ADDRESS } from "@/lib/constants";
import { UMBRA_ABI } from "@/lib/abi";
import { formatAddress } from "@/lib/utils";
import { Bell, ScrollText } from "lucide-react";
import { motion } from "framer-motion";

export interface ActivityEntry {
  type: string;
  policyId: bigint;
  label: string;
  blockNumber: bigint;
  txHash: `0x${string}`;
}

const EVENT_DEFS = [
  { name: "PolicyCreated", label: "Policy created" },
  { name: "PolicyResolved", label: "Oracle resolved" },
  { name: "PolicySettled", label: "Settled" },
  { name: "PolicyDisputed", label: "Disputed" },
  { name: "PolicyExpired", label: "Expired" },
  { name: "PolicyCancelled", label: "Cancelled" },
  { name: "ProximityFlagUpdated", label: "Proximity updated" },
] as const;

export function ActivityFeed({ limit = 12 }: { limit?: number }) {
  const client = usePublicClient();
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const currentBlock = await client.getBlockNumber();
        const fromBlock = currentBlock > 50000n ? currentBlock - 50000n : 0n;
        const all: ActivityEntry[] = [];

        for (const def of EVENT_DEFS) {
          const logs = await client.getContractEvents({
            address: UMBRA_CONTRACT_ADDRESS,
            abi: UMBRA_ABI,
            eventName: def.name,
            fromBlock,
            toBlock: "latest",
          });
          for (const log of logs) {
            const policyId = (log.args as { policyId?: bigint }).policyId;
            if (policyId === undefined) continue;
            all.push({
              type: def.name,
              policyId,
              label: def.label,
              blockNumber: log.blockNumber ?? 0n,
              txHash: log.transactionHash ?? ("0x" as `0x${string}`),
            });
          }
        }

        all.sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : 1));
        if (!cancelled) setEntries(all.slice(0, limit));
      } catch {
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [client, limit]);

  return (
    <Card glass gradientBorder className="border-umbra-cyan/15">
      <CardHeader>
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-umbra-cyan" />
          Protocol Activity
        </h3>
      </CardHeader>
      <CardBody>
        {loading ? (
          <p className="text-xs text-umbra-muted py-4 text-center">Loading events…</p>
        ) : entries.length === 0 ? (
          <p className="text-xs text-umbra-muted py-4 text-center border border-dashed border-white/10 rounded-xl">
            No recent events on this contract.
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {entries.map((e, i) => (
              <motion.a
                key={`${e.txHash}-${i}`}
                href={`https://sepolia.etherscan.io/tx/${e.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 hover:border-umbra-cyan/20 transition-colors"
              >
                <div>
                  <p className="text-xs text-white">{e.label}</p>
                  <p className="text-[10px] text-umbra-muted font-mono">
                    Policy #{e.policyId.toString()}
                  </p>
                </div>
                <Badge variant="info" className="text-[10px] shrink-0">
                  blk {e.blockNumber.toString()}
                </Badge>
              </motion.a>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function ComplianceHistoryLog() {
  const client = usePublicClient();
  const [entries, setEntries] = useState<
    Array<{ policyId: bigint; viewer: string; flags: string[]; blockNumber: bigint }>
  >([]);

  useEffect(() => {
    if (!client) return;
    (async () => {
      try {
        const currentBlock = await client.getBlockNumber();
        const fromBlock = currentBlock > 100000n ? currentBlock - 100000n : 0n;
        const logs = await client.getContractEvents({
          address: UMBRA_CONTRACT_ADDRESS,
          abi: UMBRA_ABI,
          eventName: "ViewerAccessGranted",
          fromBlock,
          toBlock: "latest",
        });
        const mapped = logs.map((log) => {
          const a = log.args as Record<string, boolean | bigint | string>;
          const flags: string[] = [];
          if (a.coverage) flags.push("cov");
          if (a.premium) flags.push("prem");
          if (a.threshold) flags.push("bound");
          if (a.deductible) flags.push("ded");
          if (a.ratioValid) flags.push("ratio");
          if (a.trigger) flags.push("trig");
          if (a.payout) flags.push("pay");
          if (a.proximity) flags.push("prox");
          return {
            policyId: a.policyId as bigint,
            viewer: formatAddress(a.viewer as `0x${string}`, 4),
            flags,
            blockNumber: log.blockNumber ?? 0n,
          };
        });
        mapped.sort((x, y) => (x.blockNumber > y.blockNumber ? -1 : 1));
        setEntries(mapped.slice(0, 30));
      } catch {
        setEntries([]);
      }
    })();
  }, [client]);

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {entries.length === 0 ? (
        <p className="text-xs text-umbra-muted py-4 text-center border border-dashed border-white/10 rounded-xl">
          No ACL grants indexed yet.
        </p>
      ) : (
        entries.map((e, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] font-mono"
          >
            <div className="flex justify-between text-umbra-muted mb-1">
              <span>Policy #{e.policyId.toString()}</span>
              <span>{e.viewer}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {e.flags.map((f) => (
                <Badge key={f} variant="info" className="text-[9px]">
                  {f}
                </Badge>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
