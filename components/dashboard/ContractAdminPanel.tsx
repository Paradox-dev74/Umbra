"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  useContractOwner,
  useContractPaused,
  useOwnerAdmin,
} from "@/hooks/usePrivacyFeatures";
import { useAccount } from "wagmi";
import { isAddress } from "viem";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

export function ContractAdminPanel() {
  const { address } = useAccount();
  const { data: owner } = useContractOwner();
  const { data: paused } = useContractPaused();
  const { setPaused, setTrustedOracle, setPrivaraRouter, setOracleMaxStaleness, isPending } =
    useOwnerAdmin();

  const [oracle, setOracle] = useState("");
  const [router, setRouter] = useState("");
  const [staleness, setStaleness] = useState("3600");

  const isOwner =
    !!address && !!owner && (owner as string).toLowerCase() === address.toLowerCase();

  if (!isOwner) return null;

  return (
    <Card glass gradientBorder className="border-umbra-danger/20">
      <CardHeader>
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-umbra-warning" />
          Contract Admin (Owner)
        </h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-umbra-muted">Paused</span>
          <Button
            variant={paused ? "primary" : "outline"}
            size="sm"
            disabled={isPending}
            onClick={() =>
              toast.promise(setPaused(!paused), {
                loading: "Updating pause…",
                success: paused ? "Contract unpaused" : "Contract paused",
                error: "Failed",
              })
            }
          >
            {paused ? "Unpause" : "Pause"}
          </Button>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-umbra-muted">Trusted oracle</label>
          <input
            value={oracle}
            onChange={(e) => setOracle(e.target.value)}
            placeholder="0x…"
            className="w-full bg-umbra-bg border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white"
          />
          <Button
            variant="outline"
            size="sm"
            disabled={!isAddress(oracle) || isPending}
            onClick={() =>
              toast.promise(setTrustedOracle(oracle as `0x${string}`), {
                loading: "Updating oracle…",
                success: "Oracle updated",
                error: "Failed",
              })
            }
          >
            Set Oracle
          </Button>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-umbra-muted">Privara router</label>
          <input
            value={router}
            onChange={(e) => setRouter(e.target.value)}
            placeholder="0x…"
            className="w-full bg-umbra-bg border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white"
          />
          <Button
            variant="outline"
            size="sm"
            disabled={!isAddress(router) || isPending}
            onClick={() =>
              toast.promise(setPrivaraRouter(router as `0x${string}`), {
                loading: "Updating router…",
                success: "Router updated",
                error: "Failed",
              })
            }
          >
            Set Router
          </Button>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-umbra-muted">Oracle max staleness (seconds)</label>
          <input
            type="number"
            value={staleness}
            onChange={(e) => setStaleness(e.target.value)}
            className="w-full bg-umbra-bg border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white"
          />
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() =>
              toast.promise(setOracleMaxStaleness(BigInt(parseInt(staleness || "3600", 10))), {
                loading: "Updating staleness…",
                success: "Staleness updated",
                error: "Failed",
              })
            }
          >
            Set Staleness
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
