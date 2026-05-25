"use client";

import { motion } from "framer-motion";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EncryptedValue } from "@/components/ui/EncryptedValue";
import { usePrivatePortfolio } from "@/hooks/usePrivatePortfolio";
import { useHolderExposureHandle } from "@/hooks/usePrivacyFeatures";
import { useUserPolicies } from "@/hooks/useUmbraContract";
import { useReadContracts } from "wagmi";
import { UMBRA_CONTRACT_ADDRESS } from "@/lib/constants";
import { UMBRA_ABI } from "@/lib/abi";
import { formatBigUSDC } from "@/lib/utils";
import { Lock, Unlock, Layers, Eye } from "lucide-react";

export function PrivatePortfolioCard() {
  const { policies, isLoading } = useUserPolicies();
  const { decryptPortfolio, isDecrypting, totals, error, reset, clientReady } =
    usePrivatePortfolio();
  const { data: exposureHandle } = useHolderExposureHandle();

  const activePolicies = policies.filter((p) => p.status === 0);
  const policyIds = activePolicies.map((p) => Number(p.id));

  const { data: handleResults } = useReadContracts({
    contracts: policyIds.flatMap((id) => [
      {
        address: UMBRA_CONTRACT_ADDRESS as `0x${string}`,
        abi: UMBRA_ABI,
        functionName: "getCoverageHandle" as const,
        args: [BigInt(id)],
      },
      {
        address: UMBRA_CONTRACT_ADDRESS as `0x${string}`,
        abi: UMBRA_ABI,
        functionName: "getPremiumHandle" as const,
        args: [BigInt(id)],
      },
    ]),
    query: { enabled: policyIds.length > 0 },
  });

  const handleRunDecrypt = () => {
    const enriched = activePolicies.map((p, i) => ({
      id: Number(p.id),
      status: p.status,
      coverageHandle: handleResults?.[i * 2]?.result as `0x${string}` | undefined,
      premiumHandle: handleResults?.[i * 2 + 1]?.result as `0x${string}` | undefined,
    }));
    decryptPortfolio(enriched);
  };

  return (
    <Card glass gradientBorder glow glowColor="violet" className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-umbra-violet" />
          <h2 className="text-lg font-semibold text-white">Private Portfolio</h2>
        </div>
        <p className="text-xs text-umbra-muted mt-1">
          Sealed-decrypt your active policies locally — totals never leave your session
        </p>
      </CardHeader>
      <CardBody className="space-y-4">
        {!totals ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <StatBlock label="Active Policies" value={isLoading ? "—" : String(activePolicies.length)} masked={false} />
              <StatBlock label="Total Coverage" value="████████" masked />
            </div>

            {exposureHandle &&
              exposureHandle !==
                "0x0000000000000000000000000000000000000000000000000000000000000000" && (
              <div className="rounded-lg border border-umbra-blue/20 bg-umbra-blue/5 px-4 py-3 space-y-2">
                <p className="text-xs text-umbra-blue font-medium flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  On-chain homomorphic exposure (FHE.add)
                </p>
                <EncryptedValue
                  ctHash={exposureHandle as `0x${string}`}
                  unit="USDC"
                  format={(raw) => formatBigUSDC(raw)}
                />
              </div>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}

            <Button
              variant="primary"
              className="w-full"
              onClick={handleRunDecrypt}
              disabled={!clientReady || isDecrypting || activePolicies.length === 0}
            >
              <Lock className="w-4 h-4" />
              {isDecrypting ? "Decrypting portfolio…" : "Reveal My Portfolio Totals"}
            </Button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <StatBlock
                label="Total Coverage"
                value={formatBigUSDC(totals.totalCoverageUsdc)}
                masked={false}
                highlight
              />
              <StatBlock
                label="Total Premiums"
                value={formatBigUSDC(totals.totalPremiumUsdc)}
                masked={false}
              />
            </div>
            <p className="text-xs text-umbra-muted text-center">
              Decrypted {totals.policyCount} active {totals.policyCount === 1 ? "policy" : "policies"} via CoFHE Threshold Network
            </p>
            <Button variant="ghost" className="w-full" onClick={reset}>
              <Unlock className="w-4 h-4" />
              Hide totals
            </Button>
          </motion.div>
        )}
      </CardBody>
    </Card>
  );
}

function StatBlock({
  label,
  value,
  masked,
  highlight,
}: {
  label: string;
  value: string;
  masked: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-4">
      <p className="text-xs text-umbra-muted mb-1">{label}</p>
      <p
        className={`text-lg font-bold ${
          masked ? "font-mono text-white/40 tracking-widest" : highlight ? "text-umbra-success" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
