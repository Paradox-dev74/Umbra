"use client";

import { useAccount } from "wagmi";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EncryptedValue } from "@/components/ui/EncryptedValue";
import { useGlobalExposureHandle, useIsGlobalExposureViewer } from "@/hooks/usePrivacyFeatures";
import { Globe } from "lucide-react";

export default function ReinsurancePage() {
  const { address } = useAccount();
  const { data: globalExposure } = useGlobalExposureHandle();
  const { data: isViewer } = useIsGlobalExposureViewer(address);

  const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const canView =
    isViewer === true && globalExposure && globalExposure !== zeroHash;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Globe className="w-8 h-8 text-umbra-violet" />
          Reinsurance Portal
        </h1>
        <p className="text-sm text-umbra-muted mt-2">
          View protocol-wide encrypted exposure if granted via{" "}
          <code className="text-umbra-cyan">grantGlobalExposureViewer</code>.
        </p>
      </div>

      <Card glass gradientBorder className="border-umbra-violet/20">
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Global Encrypted Exposure</h2>
        </CardHeader>
        <CardBody>
          {!address ? (
            <p className="text-sm text-umbra-muted">Connect wallet to check viewer status.</p>
          ) : !isViewer ? (
            <p className="text-sm text-umbra-muted">
              Your wallet is not a global exposure viewer. Ask the contract owner to grant ACL on the Privacy Lab compliance panel.
            </p>
          ) : !canView ? (
            <p className="text-sm text-umbra-muted">Viewer ACL granted — no exposure accumulated yet.</p>
          ) : (
            <div className="flex items-center gap-4">
              <EncryptedValue
                ctHash={globalExposure as `0x${string}`}
                field="globalExposure"
                role="reinsurer"
                policyStatus={0}
                decryptPath="view"
                unit="USDC"
                format={(raw) => (Number(raw) / 1_000_000).toLocaleString()}
              />
              <p className="text-xs text-umbra-muted max-w-xs">
                Homomorphic sum of active coverage across all policies. Individual policy terms remain encrypted.
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
