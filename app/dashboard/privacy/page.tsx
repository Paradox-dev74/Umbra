"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EncryptedValue } from "@/components/ui/EncryptedValue";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/Motion";
import { MeshBackground } from "@/components/ui/MeshBackground";
import { cn } from "@/lib/utils";
import { useCofheClient } from "@cofhe/react";
import { encryptComparisonInputs } from "@/lib/fhenix";
import { useFhenix } from "@/hooks/useFhenix";
import {
  useGlobalExposureHandle,
  useHolderExposureHandle,
  useMaxPremiumRatioDivisor,
} from "@/hooks/usePrivacyFeatures";
import { CompliancePanel } from "@/components/dashboard/CompliancePanel";
import { PrivacyAccessPanel } from "@/components/dashboard/PrivacyAccessPanel";
import {
  Shield,
  Lock,
  GitCompare,
  Layers,
  UserPlus,
  Minus,
  Check,
  Link2,
  Percent,
  Globe,
  Wallet,
  Sparkles,
} from "lucide-react";

const FHE_FEATURES = [
  {
    icon: Lock,
    title: "Encrypted Policy Terms",
    ops: ["Encryptable.uint64", "InEuint64", "createPolicyV2"],
    desc: "Coverage, premium, threshold, and deductible — all encrypted client-side before submission.",
    accent: "cyan",
  },
  {
    icon: Percent,
    title: "Homomorphic Premium Ratio",
    ops: ["FHE.div", "FHE.lte", "FHE.and"],
    desc: "Validates premium ≤ coverage÷20 without revealing either value. Blocks payout if ratio invalid.",
    accent: "violet",
  },
  {
    icon: Link2,
    title: "On-Chain Chainlink Resolution",
    ops: ["resolveWithChainlink", "FHE.asEuint64"],
    desc: "Contract reads Chainlink directly; only the public oracle value is plaintext — threshold stays encrypted.",
    accent: "success",
  },
  {
    icon: GitCompare,
    title: "Category-Aware Compare",
    ops: ["FHE.gte", "FHE.lte"],
    desc: "Supply chain uses gte; commodity price protection uses lte — all homomorphic.",
    accent: "warning",
  },
  {
    icon: Minus,
    title: "Net Payout Pipeline",
    ops: ["FHE.sub", "FHE.select", "FHE.and"],
    desc: "Payout = select(trigger ∧ ratioValid, coverage − deductible, 0).",
    accent: "cyan",
  },
  {
    icon: Layers,
    title: "Exposure Aggregation",
    ops: ["FHE.add", "getHolderExposureHandle", "getGlobalExposureHandle"],
    desc: "Per-holder and protocol-wide encrypted exposure sums for portfolio and reinsurance.",
    accent: "violet",
  },
  {
    icon: UserPlus,
    title: "Delegated ACL",
    ops: ["FHE.allow", "grantViewerAccess"],
    desc: "Share sealed-decrypt rights with auditors — no plaintext on-chain, ever.",
    accent: "blue",
  },
  {
    icon: Shield,
    title: "Sealed Decrypt + Auto-Lock",
    ops: ["decryptForView", "autoRelock 90s"],
    desc: "Values revealed only via CoFHE Threshold Network; UI auto-locks after 90 seconds.",
    accent: "success",
  },
];

const accentBorder: Record<string, string> = {
  cyan: "hover:border-umbra-cyan/30",
  violet: "hover:border-umbra-violet/30",
  success: "hover:border-umbra-success/30",
  warning: "hover:border-umbra-warning/30",
  blue: "hover:border-umbra-blue/30",
};

export default function PrivacyLabPage() {
  const client = useCofheClient();
  const { clientReady } = useFhenix();
  const { data: globalExposure } = useGlobalExposureHandle();
  const { data: holderExposure } = useHolderExposureHandle();
  const { data: ratioDivisor } = useMaxPremiumRatioDivisor();
  const [demoOracle, setDemoOracle] = useState("3200");
  const [demoThreshold, setDemoThreshold] = useState("3000");
  const [demoStage, setDemoStage] = useState<"idle" | "encrypting" | "done">("idle");
  const [demoResult, setDemoResult] = useState<{ oracleHash: string; thresholdHash: string } | null>(null);

  const runDemo = async () => {
    if (!client) return;
    setDemoStage("encrypting");
    setDemoResult(null);
    try {
      const oracle = BigInt(Math.round(parseFloat(demoOracle)));
      const threshold = BigInt(Math.round(parseFloat(demoThreshold)));
      const result = await encryptComparisonInputs(client, oracle, threshold);
      setDemoResult({
        oracleHash: result.oracleHash || "encrypted",
        thresholdHash: result.thresholdHash || "encrypted",
      });
      setDemoStage("done");
    } catch {
      setDemoStage("idle");
    }
  };

  const maxPct = ratioDivisor ? (100 / Number(ratioDivisor)).toFixed(1) : "5";
  const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";

  return (
    <div className="relative p-6 md:p-8 max-w-6xl mx-auto space-y-10 pb-16">
      <MeshBackground intensity="medium" hex className="absolute inset-0 -z-10 rounded-none opacity-60" />

      <FadeIn>
        <div className="relative">
          <motion.div
            className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-umbra-violet/20 blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-gradient-to-br from-umbra-cyan/20 to-umbra-violet/20 border border-white/10">
              <Sparkles className="w-7 h-7 text-umbra-cyan" />
            </span>
            Privacy Lab
          </h1>
          <p className="text-umbra-muted text-sm mt-3 max-w-2xl leading-relaxed">
            Maximum-privacy parametric insurance — every financial term encrypted, every comparison homomorphic,
            every reveal sealed via CoFHE.
          </p>
          <p className="text-xs text-umbra-cyan mt-2 font-mono">
            Max premium ratio: {maxPct}% · divisor = {ratioDivisor?.toString() ?? "20"}
          </p>
        </div>
      </FadeIn>

      <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {holderExposure && holderExposure !== zeroHash && (
          <StaggerItem>
            <Card glass gradientBorder glow glowColor="cyan">
              <CardBody className="flex items-center gap-4">
                <Wallet className="w-8 h-8 text-umbra-cyan" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Your Encrypted Exposure</p>
                  <p className="text-xs text-umbra-muted">Homomorphic sum of your active coverage</p>
                </div>
                <EncryptedValue
                  ctHash={holderExposure as `0x${string}`}
                  unit="USDC"
                  format={(raw) => (Number(raw) / 1_000_000).toLocaleString()}
                  compact
                />
              </CardBody>
            </Card>
          </StaggerItem>
        )}
        {globalExposure && globalExposure !== zeroHash && (
          <StaggerItem>
            <Card glass gradientBorder glow glowColor="violet">
              <CardBody className="flex items-center gap-4">
                <Globe className="w-8 h-8 text-umbra-violet" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Protocol Encrypted Exposure</p>
                  <p className="text-xs text-umbra-muted">Global homomorphic aggregate (owner ACL)</p>
                </div>
                <EncryptedValue
                  ctHash={globalExposure as `0x${string}`}
                  unit="USDC"
                  format={(raw) => (Number(raw) / 1_000_000).toLocaleString()}
                  compact
                />
              </CardBody>
            </Card>
          </StaggerItem>
        )}
      </Stagger>

      <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FHE_FEATURES.map((f) => (
          <StaggerItem key={f.title}>
            <Card
              glass
              hover
              className={cn("h-full transition-all duration-300", accentBorder[f.accent])}
            >
              <CardBody className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <f.icon className="w-4 h-4 text-umbra-cyan" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                </div>
                <p className="text-xs text-umbra-muted leading-relaxed">{f.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {f.ops.map((op) => (
                    <code
                      key={op}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-black/40 text-umbra-cyan border border-umbra-cyan/10"
                    >
                      {op}
                    </code>
                  ))}
                </div>
              </CardBody>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <FadeIn delay={0.1}>
        <Card glass gradientBorder className="border-umbra-cyan/20">
          <CardHeader>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-umbra-violet" />
              Interactive FHE Encrypt Demo
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-umbra-muted">Oracle (public at resolve)</label>
                <input
                  type="number"
                  value={demoOracle}
                  onChange={(e) => setDemoOracle(e.target.value)}
                  className="w-full mt-1 bg-umbra-bg/80 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-mono focus:border-umbra-cyan/40 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-umbra-muted">Threshold (encrypted on-chain)</label>
                <input
                  type="number"
                  value={demoThreshold}
                  onChange={(e) => setDemoThreshold(e.target.value)}
                  className="w-full mt-1 bg-umbra-bg/80 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-mono focus:border-umbra-violet/40 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <Button variant="violet" onClick={runDemo} disabled={!clientReady || demoStage === "encrypting"}>
              {demoStage === "encrypting" ? "Encrypting via CoFHE…" : "Run FHE Encrypt Pipeline"}
            </Button>
            {demoResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 px-4 py-3 rounded-xl bg-umbra-success/10 border border-umbra-success/20"
              >
                <Check className="w-4 h-4 text-umbra-success mt-0.5 shrink-0" />
                <div className="text-sm text-umbra-success font-mono space-y-1">
                  <p>Oracle ciphertext submitted — comparison runs on-chain only.</p>
                  <p className="text-[10px] text-umbra-muted">Handles: oracle · threshold (sealed)</p>
                </div>
              </motion.div>
            )}
          </CardBody>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <CompliancePanel />
      </FadeIn>

      <FadeIn delay={0.2}>
        <PrivacyAccessPanel />
      </FadeIn>
    </div>
  );
}
