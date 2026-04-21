"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ComplianceHistoryLog } from "@/components/dashboard/ActivityFeed";
import {
  useContractOwner,
  useGrantGlobalExposureViewer,
} from "@/hooks/usePrivacyFeatures";
import { useAccount } from "wagmi";
import { isAddress } from "viem";
import { toast } from "sonner";
import { Shield, Globe, ScrollText } from "lucide-react";

export function CompliancePanel() {
  const { address } = useAccount();
  const { data: owner } = useContractOwner();
  const { grantGlobalViewer, isPending } = useGrantGlobalExposureViewer();
  const [viewer, setViewer] = useState("");

  const isOwner =
    !!address &&
    !!owner &&
    (owner as string).toLowerCase() === address.toLowerCase();

  const handleGrantGlobal = async () => {
    if (!isAddress(viewer)) {
      toast.error("Enter a valid reinsurer / auditor address");
      return;
    }
    try {
      await toast.promise(grantGlobalViewer(viewer as `0x${string}`), {
        loading: "Granting global exposure ACL…",
        success: "Reinsurer can sealed-decrypt protocol exposure",
        error: (e: unknown) => (e instanceof Error ? e.message : "Grant failed"),
      });
      setViewer("");
    } catch {
      /* toast */
    }
  };

  return (
    <div className="space-y-6">
      <Card glass gradientBorder className="border-umbra-blue/20">
        <CardHeader>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-umbra-blue" />
            Compliance &amp; Reinsurance ACL
          </h2>
          <p className="text-xs text-umbra-muted mt-1">
            Extended ACL with explicit proximity grants; historical log from chain events.
          </p>
        </CardHeader>
        <CardBody className="space-y-6">
          {isOwner ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-umbra-violet" />
                <span className="text-sm font-medium text-white">Grant Global Exposure Viewer</span>
              </div>
              <input
                type="text"
                value={viewer}
                onChange={(e) => setViewer(e.target.value)}
                placeholder="Reinsurer address (0x…)"
                className="w-full bg-umbra-bg/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-umbra-violet/40"
              />
              <Button variant="violet" onClick={handleGrantGlobal} disabled={isPending}>
                Grant Global Exposure ACL
              </Button>
            </div>
          ) : (
            <p className="text-xs text-umbra-muted">
              Connect the contract owner wallet to grant reinsurer global exposure access.
            </p>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-umbra-cyan" />
              <span className="text-sm font-medium text-white">ViewerAccessGranted History</span>
            </div>
            <ComplianceHistoryLog />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
