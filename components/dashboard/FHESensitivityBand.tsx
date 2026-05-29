"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EncryptedValue } from "@/components/ui/EncryptedValue";
import { useFhenix } from "@/hooks/useFhenix";
import { toast } from "sonner";
import { Radar, Lock } from "lucide-react";

import type { AclRole } from "@/lib/acl-policy";

interface FHESensitivityBandProps {
  proximityHandle?: `0x${string}`;
  operator?: "FHE.gte" | "FHE.lte";
  title?: string;
  embedded?: boolean;
  aclRole?: AclRole;
  policyStatus?: number;
}

/** On-chain proximity only — no client-side cleartext band math */
export function FHESensitivityBand({
  proximityHandle,
  operator = "FHE.gte",
  title = "FHE Proximity Flag",
  embedded = false,
  aclRole = "holder",
  policyStatus = 0,
}: FHESensitivityBandProps) {
  const { clientReady } = useFhenix();
  const [revealed, setRevealed] = useState(false);

  const inner = (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-umbra-violet/10 flex items-center justify-center">
          <Radar className="w-5 h-5 text-umbra-violet" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-umbra-muted">
            Contract-computed ebool — threshold never compared in cleartext on client
          </p>
        </div>
      </div>

      {!proximityHandle ? (
        <p className="text-xs text-umbra-muted">
          Oracle must refresh on-chain proximity first. No local band simulation.
        </p>
      ) : !revealed ? (
        <Button
          variant="violet"
          size="sm"
          onClick={() => setRevealed(true)}
          disabled={!clientReady}
        >
          <Lock className="w-3.5 h-3.5" />
          Reveal proximity flag (sealed decrypt)
        </Button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <EncryptedValue
            ctHash={proximityHandle}
            field="proximity"
            role={aclRole}
            policyStatus={policyStatus}
            decryptPath="view"
            valueType="bool"
            formatBool={(raw) =>
              raw
                ? "✓ Within encrypted trigger proximity"
                : "✗ Outside encrypted trigger proximity"
            }
          />
          <div className="flex items-center justify-between">
            <Badge variant="muted">{operator}</Badge>
            <Button variant="ghost" size="sm" onClick={() => setRevealed(false)}>
              Hide
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );

  if (embedded) return inner;

  return (
    <Card glass gradientBorder className="border-umbra-violet/20">
      <CardBody>{inner}</CardBody>
    </Card>
  );
}
