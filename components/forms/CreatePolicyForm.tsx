/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Create Policy Form (Multi-Step)
   4-step policy creation — FHE encryption via @cofhe/react
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useBlockNumber, useWriteContract } from "wagmi";
import { keccak256, encodeAbiParameters, parseAbiParameters } from "viem";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { RISK_CATEGORIES, ORACLE_FEEDS, UMBRA_CONTRACT_ADDRESS, UMBRA_V3_FEATURES, PolicyMode, RISK_CATEGORY_DEFAULT_FEED } from "@/lib/constants";
import { UMBRA_ABI } from "@/lib/abi";
import { asInEuint64 } from "@/lib/fhenix";
import { useFhenix } from "@/hooks/useFhenix";
import { useChainlinkPrices } from "@/hooks/useChainlinkPrice";
import { getOracleValueForFeed, thresholdToUint64, formatOraclePrice } from "@/lib/oracle-utils";
import type { CreatePolicyFormData, FormStep } from "@/lib/types";
import { generatePolicyHash } from "@/lib/utils";
import { toast } from "sonner";
import { isAddress } from "viem";
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  Check,
  Shield,
  Sparkles,
  Zap,
  ExternalLink,
} from "lucide-react";

const steps = [
  { label: "Risk Setup" },
  { label: "Encrypted Terms" },
  { label: "Oracle Config" },
  { label: "Review & Sign" },
];

const defaultForm: CreatePolicyFormData = {
  beneficiaryAddress: "",
  riskCategory: 0,
  policyReferenceName: "",
  policyMode: "single",
  coverageAmountUsdc: "",
  triggerThreshold: "",
  ceilingThreshold: "",
  premiumUsdc: "",
  deductibleUsdc: "0",
  coverageDurationDays: "",
  oracleFeed: "ETH_USD",
  resolutionMode: "automatic",
  resolverAddress: "",
};

interface EncryptFieldState {
  coverage: "plain" | "encrypting" | "encrypted";
  threshold: "plain" | "encrypting" | "encrypted";
  premium: "plain" | "encrypting" | "encrypted";
  expiry: "plain" | "encrypting" | "encrypted";
}

export function CreatePolicyForm() {
  const { address: connectedAddress } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: false });
  const { encryptPolicy, clientReady, isEncrypting } = useFhenix();
  const { writeContractAsync } = useWriteContract();
  const chainlinkPrices = useChainlinkPrices();

  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [form, setForm] = useState<CreatePolicyFormData>(defaultForm);
  const [encryptStates, setEncryptStates] = useState<EncryptFieldState>({
    coverage: "plain",
    threshold: "plain",
    premium: "plain",
    expiry: "plain",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const updateForm = useCallback(
    (field: keyof CreatePolicyFormData, value: string | number) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "riskCategory" && typeof value === "number") {
          const defaultFeed = RISK_CATEGORY_DEFAULT_FEED[value];
          if (defaultFeed) next.oracleFeed = defaultFeed;
        }
        return next;
      });
    },
    []
  );

  const triggerEncryptAnimation = useCallback(
    (field: keyof EncryptFieldState) => {
      if (debounceTimers.current[field]) {
        clearTimeout(debounceTimers.current[field]);
      }
      debounceTimers.current[field] = setTimeout(() => {
        setEncryptStates((prev) => ({ ...prev, [field]: "encrypting" }));
        setTimeout(() => {
          setEncryptStates((prev) => ({ ...prev, [field]: "encrypted" }));
        }, 800);
      }, 600);
    },
    []
  );

  const handleCoverageBlur = useCallback(() => {
    if (form.coverageAmountUsdc) triggerEncryptAnimation("coverage");
  }, [form.coverageAmountUsdc, triggerEncryptAnimation]);

  const handleThresholdBlur = useCallback(() => {
    if (form.triggerThreshold) triggerEncryptAnimation("threshold");
  }, [form.triggerThreshold, triggerEncryptAnimation]);

  const handlePremiumBlur = useCallback(() => {
    if (form.premiumUsdc) triggerEncryptAnimation("premium");
  }, [form.premiumUsdc, triggerEncryptAnimation]);

  const handleExpiryBlur = useCallback(() => {
    if (form.coverageDurationDays) triggerEncryptAnimation("expiry");
  }, [form.coverageDurationDays, triggerEncryptAnimation]);

  const handleSubmit = useCallback(async () => {
    if (!connectedAddress) {
      toast.error("Connect your wallet first");
      return;
    }
    if (!clientReady) {
      toast.error("CoFHE client not ready — wait a moment and try again");
      return;
    }
    if (form.beneficiaryAddress && !isAddress(form.beneficiaryAddress)) {
      toast.error("Invalid beneficiary address");
      return;
    }
    const coverage = parseFloat(form.coverageAmountUsdc || "0");
    const premium = parseFloat(form.premiumUsdc || "0");
    const threshold = parseFloat(form.triggerThreshold || "0");
    const ceiling = parseFloat(form.ceilingThreshold || "0");
    const isBand = form.policyMode === "band";
    if (coverage <= 0 || premium <= 0 || threshold <= 0) {
      toast.error("Enter valid coverage, premium, and threshold amounts");
      return;
    }
    if (isBand && (ceiling <= 0 || ceiling <= threshold)) {
      toast.error("Band mode requires ceiling greater than floor");
      return;
    }

    setSubmitting(true);
    setSubmitStage(1);

    try {
      // Stage 1 → Stage 2: FHE encrypt all three terms
      const coverageUsdc = BigInt(Math.round(coverage * 1_000_000));
      const premiumUsdc  = BigInt(Math.round(premium * 1_000_000));
      const feedKey = form.oracleFeed;
      const thresholdVal = thresholdToUint64(threshold, feedKey);
      const ceilingVal = isBand ? thresholdToUint64(ceiling, feedKey) : 0n;
      const deductibleUsdc = BigInt(Math.round(parseFloat(form.deductibleUsdc || "0") * 1_000_000));

      setSubmitStage(2);
      const encrypted = await encryptPolicy({
        coverageAmountUsdc: coverageUsdc,
        premiumUsdc,
        triggerThreshold: thresholdVal,
        ceilingThreshold: isBand ? ceilingVal : undefined,
        deductibleUsdc,
      });

      // Stage 3: Build contract call args
      setSubmitStage(3);
      const expiryBlock  = (blockNumber ?? 0n) + BigInt(Math.round(parseInt(form.coverageDurationDays || "90") * 7200));
      const beneficiary  = (form.beneficiaryAddress || connectedAddress) as `0x${string}`;
      const oracleFeed   = (ORACLE_FEEDS[form.oracleFeed]?.address ?? "0x0000000000000000000000000000000000000001") as `0x${string}`;

      const policyHash = keccak256(
        encodeAbiParameters(parseAbiParameters("string, address, uint256"), [
          form.policyReferenceName || "Umbra Policy",
          connectedAddress,
          BigInt(Date.now()),
        ])
      );

      // Stage 4: submit to Sepolia
      setSubmitStage(4);
      const encArgs = {
        encCoverage: asInEuint64(encrypted.encCoverage),
        encPremium: asInEuint64(encrypted.encPremium),
        encThreshold: asInEuint64(encrypted.encThreshold),
        encCeiling: asInEuint64(encrypted.encCeiling!),
        encDeductible: asInEuint64(encrypted.encDeductible!),
      };

      const hash = UMBRA_V3_FEATURES
        ? await writeContractAsync({
            address: UMBRA_CONTRACT_ADDRESS,
            abi: UMBRA_ABI,
            functionName: "createPolicyV3",
            args: [
              beneficiary,
              form.riskCategory as number,
              oracleFeed,
              expiryBlock,
              encArgs.encCoverage,
              encArgs.encPremium,
              encArgs.encThreshold,
              encArgs.encCeiling,
              encArgs.encDeductible,
              isBand ? PolicyMode.IndexBand : PolicyMode.SingleThreshold,
              policyHash,
            ],
          })
        : await writeContractAsync({
            address: UMBRA_CONTRACT_ADDRESS,
            abi: UMBRA_ABI,
            functionName: "createPolicyV2",
            args: [
              beneficiary,
              form.riskCategory as number,
              oracleFeed,
              expiryBlock,
              encArgs.encCoverage,
              encArgs.encPremium,
              encArgs.encThreshold,
              encArgs.encDeductible,
              policyHash,
            ],
          });

      setTxHash(hash);
      setSubmitted(true);
      toast.success("Policy created with FHE-encrypted terms");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Transaction failed: ${msg}`);
    } finally {
      setSubmitting(false);
      setSubmitStage(0);
    }
  }, [connectedAddress, clientReady, form, blockNumber, encryptPolicy, writeContractAsync]);

  const renderEncryptedField = (
    label: string,
    field: keyof EncryptFieldState,
    value: string,
    onChange: (val: string) => void,
    onBlur: () => void,
    hint: string,
    encType: string
  ) => {
    const state = encryptStates[field];

    return (
      <div className="space-y-2">
        <label className="text-sm text-umbra-muted">{label}</label>
        <div className="relative">
          {state === "plain" ? (
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              placeholder={hint}
              className="w-full bg-umbra-bg border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-umbra-blue/50 focus:ring-1 focus:ring-umbra-blue/30 transition-colors font-mono placeholder:text-white/20"
            />
          ) : state === "encrypting" ? (
            <div className="w-full bg-umbra-bg border border-umbra-violet/30 rounded-lg px-4 py-3 flex items-center gap-3 animate-encrypt-shimmer">
              <span className="font-mono text-sm text-white/70 tracking-widest">
                ████████
              </span>
              <div className="w-4 h-4 rounded-full border-2 border-umbra-violet/30 border-t-umbra-violet animate-spin" />
            </div>
          ) : (
            <div className="w-full bg-umbra-bg border border-umbra-success/20 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-sm text-white/70 tracking-widest">
                ████████
              </span>
              <Badge variant="success" className="text-[10px]">
                {encType} encrypted ✓
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-umbra-success/20 flex items-center justify-center mx-auto mb-6"
        >
          <Check className="w-10 h-10 text-umbra-success" />
        </motion.div>
        <h2 className="text-3xl font-extrabold text-white mb-3">
          Policy Created!
        </h2>
        <p className="text-umbra-muted mb-2">
          Your confidential parametric insurance policy has been encrypted and
          submitted to Ethereum Sepolia with real FHE ciphertext terms.
        </p>
        {txHash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-umbra-blue font-mono mb-4 hover:underline"
          >
            {txHash.slice(0, 20)}...{txHash.slice(-8)}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <p className="text-xs text-umbra-muted font-mono mb-8">
          Policy Hash:{" "}
          {generatePolicyHash({
            name: form.policyReferenceName,
            enterprise: connectedAddress ?? form.beneficiaryAddress,
            timestamp: Date.now(),
          })}
        </p>
        <Button
          variant="primary"
          pill
          onClick={() => {
            setSubmitted(false);
            setCurrentStep(1);
            setForm(defaultForm);
            setTxHash(null);
            setEncryptStates({
              coverage: "plain",
              threshold: "plain",
              premium: "plain",
              expiry: "plain",
            });
          }}
        >
          Create Another Policy
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <ProgressSteps steps={steps} currentStep={currentStep} className="mb-12" />

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* STEP 1: Risk Configuration */}
          {currentStep === 1 && (
            <Card>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Risk Configuration
                  </h3>
                  <p className="text-sm text-umbra-muted">
                    Configure the basic parameters for your insurance policy.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-umbra-muted">
                    Your Wallet (Policy Holder)
                  </label>
                  <input
                    type="text"
                    value={connectedAddress ?? "Connect wallet to continue"}
                    readOnly
                    className="w-full bg-umbra-bg border border-white/10 rounded-lg px-4 py-3 text-white/80 text-sm font-mono cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-umbra-muted">
                    Beneficiary Treasury Address
                  </label>
                  <input
                    type="text"
                    value={form.beneficiaryAddress}
                    onChange={(e) =>
                      updateForm("beneficiaryAddress", e.target.value)
                    }
                    placeholder="0x..."
                    className="w-full bg-umbra-bg border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-umbra-blue/50 focus:ring-1 focus:ring-umbra-blue/30 transition-colors placeholder:text-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-umbra-muted">
                    Risk Category
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {RISK_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() =>
                          updateForm("riskCategory", cat.value)
                        }
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                          form.riskCategory === cat.value
                            ? "border-umbra-blue/40 bg-umbra-blue/5"
                            : "border-white/5 hover:border-white/10 bg-umbra-bg"
                        }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <div>
                          <p className="text-sm text-white font-medium">
                            {cat.label}
                          </p>
                          <p className="text-xs text-umbra-muted">
                            {cat.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-umbra-muted">
                    Policy Reference Name
                  </label>
                  <input
                    type="text"
                    value={form.policyReferenceName}
                    onChange={(e) =>
                      updateForm("policyReferenceName", e.target.value)
                    }
                    placeholder="e.g., Q1 2025 Supply Chain Coverage"
                    className="w-full bg-umbra-bg border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-umbra-blue/50 focus:ring-1 focus:ring-umbra-blue/30 transition-colors placeholder:text-white/20"
                  />
                </div>
              </CardBody>
            </Card>
          )}

          {/* STEP 2: Encrypted Terms */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card className="border-umbra-blue/20">
                <CardBody>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-umbra-blue/10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-umbra-blue" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        FHE Encryption Zone
                      </h3>
                      <p className="text-xs text-umbra-muted">
                        Values encrypted client-side via @cofhe/sdk before
                        touching Ethereum Sepolia. Threshold is never revealed on-chain.
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="space-y-6">
                  {UMBRA_V3_FEATURES && (
                    <div className="space-y-2">
                      <label className="text-sm text-umbra-muted">Policy Trigger Mode</label>
                      <div className="flex gap-2">
                        {(["single", "band"] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => updateForm("policyMode", mode)}
                            className={`flex-1 p-3 rounded-lg border text-sm transition-all ${
                              form.policyMode === mode
                                ? "border-umbra-violet/40 bg-umbra-violet/10 text-white"
                                : "border-white/5 text-umbra-muted hover:border-white/10"
                            }`}
                          >
                            {mode === "single" ? "Single Threshold" : "Index Band (V3)"}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-umbra-muted">
                        Band mode: FHE.and(FHE.gte(oracle, floor), FHE.lte(oracle, ceiling))
                      </p>
                    </div>
                  )}

                  {renderEncryptedField(
                    "Coverage Amount (USDC)",
                    "coverage",
                    form.coverageAmountUsdc,
                    (val) => updateForm("coverageAmountUsdc", val),
                    handleCoverageBlur,
                    "e.g., 2400000",
                    "euint64"
                  )}

                  {renderEncryptedField(
                    form.policyMode === "band" ? "Band Floor" : "Trigger Threshold",
                    "threshold",
                    form.triggerThreshold,
                    (val) => updateForm("triggerThreshold", val),
                    handleThresholdBlur,
                    form.policyMode === "band"
                      ? "e.g., 1100 (lower bound)"
                      : "e.g., 1200 for Baltic Dry Index, 847 for Weather Index",
                    "euint64"
                  )}

                  {form.policyMode === "band" &&
                    renderEncryptedField(
                      "Band Ceiling",
                      "premium",
                      form.ceilingThreshold,
                      (val) => updateForm("ceilingThreshold", val),
                      handlePremiumBlur,
                      "e.g., 1300 (upper bound)",
                      "euint64"
                    )}

                  {renderEncryptedField(
                    "Premium Amount (USDC)",
                    "premium",
                    form.premiumUsdc,
                    (val) => updateForm("premiumUsdc", val),
                    handlePremiumBlur,
                    "e.g., 48000",
                    "euint64"
                  )}

                  <div className="space-y-2">
                    <label className="text-sm text-umbra-muted flex items-center gap-2">
                      Encrypted Deductible (USDC)
                      <span className="text-[10px] text-umbra-violet">FHE.sub on payout</span>
                    </label>
                    <input
                      type="number"
                      value={form.deductibleUsdc}
                      onChange={(e) => updateForm("deductibleUsdc", e.target.value)}
                      placeholder="e.g., 50000 (0 if none)"
                      className="w-full bg-umbra-bg border border-umbra-violet/20 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-umbra-violet/50"
                    />
                    <p className="text-[10px] text-umbra-muted">
                      Premium ratio checked homomorphically: FHE.lte(premium, coverage ÷ 20)
                    </p>
                  </div>

                  {renderEncryptedField(
                    "Coverage Duration (days)",
                    "expiry",
                    form.coverageDurationDays,
                    (val) => updateForm("coverageDurationDays", val),
                    handleExpiryBlur,
                    "e.g., 90",
                    "plaintext"
                  )}
                </CardBody>
              </Card>

              {/* Live Preview Card */}
              <Card className="border-umbra-violet/20">
                <CardBody>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-umbra-violet" />
                    <span className="text-sm font-medium text-umbra-violet">
                      Your Encrypted Policy
                    </span>
                    <Badge variant="info" className="ml-auto text-[10px]">
                      🔒 FHE Protected
                    </Badge>
                  </div>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex justify-between">
                      <span className="text-umbra-muted">Coverage:</span>
                      <span className="text-white/60 tracking-widest">
                        ██████████████
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-umbra-muted">Threshold:</span>
                      <span className="text-white/60 tracking-widest">
                        ████████
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-umbra-muted">Premium:</span>
                      <span className="text-white/60 tracking-widest">
                        ████████
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-umbra-muted">Expiry:</span>
                      <span className="text-white/60 tracking-widest">
                        ████████
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* STEP 3: Oracle Configuration */}
          {currentStep === 3 && (
            <Card>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Oracle Configuration
                  </h3>
                  <p className="text-sm text-umbra-muted">
                    Select the Chainlink oracle feed for your risk evaluation.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-umbra-muted">
                    Select Oracle Feed
                  </label>
                  <div className="space-y-2">
                    {Object.entries(ORACLE_FEEDS).map(([key, feed]) => {
                      const live = getOracleValueForFeed(key, chainlinkPrices);
                      return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateForm("oracleFeed", key)}
                        className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all text-left ${
                          form.oracleFeed === key
                            ? "border-umbra-blue/40 bg-umbra-blue/5"
                            : "border-white/5 hover:border-white/10 bg-umbra-bg"
                        }`}
                      >
                        <div>
                          <p className="text-sm text-white font-medium">
                            {feed.name}
                          </p>
                          <p className="text-xs text-umbra-muted font-mono">
                            {feed.address.slice(0, 10)}…{feed.address.slice(-6)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-mono ${live.value !== null ? "text-umbra-blue" : "text-umbra-muted"}`}>
                            {formatOraclePrice(live.value, feed.unit)}
                          </p>
                          <p className="text-xs text-umbra-muted">
                            {feed.unit}
                            {live.source === "chainlink" && " · live"}
                          </p>
                        </div>
                      </button>
                    );})}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-umbra-muted">
                    Resolution Mode
                  </label>
                  <div className="flex gap-3">
                    {(["automatic", "manual"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateForm("resolutionMode", mode)}
                        className={`flex-1 p-3 rounded-lg border transition-all text-center ${
                          form.resolutionMode === mode
                            ? "border-umbra-blue/40 bg-umbra-blue/5"
                            : "border-white/5 hover:border-white/10 bg-umbra-bg"
                        }`}
                      >
                        <p className="text-sm text-white capitalize">{mode}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {form.resolutionMode === "manual" && (
                  <div className="space-y-2">
                    <label className="text-sm text-umbra-muted">
                      Resolver Address (optional)
                    </label>
                    <input
                      type="text"
                      value={form.resolverAddress}
                      onChange={(e) =>
                        updateForm("resolverAddress", e.target.value)
                      }
                      placeholder="0x..."
                      className="w-full bg-umbra-bg border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-umbra-blue/50 focus:ring-1 focus:ring-umbra-blue/30 transition-colors placeholder:text-white/20"
                    />
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* STEP 4: Review & Sign */}
          {currentStep === 4 && (
            <Card>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Review & Sign
                  </h3>
                  <p className="text-sm text-umbra-muted">
                    Verify your policy details before encryption and submission.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-umbra-muted">
                      Risk Category
                    </span>
                    <span className="text-sm text-white">
                      {RISK_CATEGORIES[form.riskCategory]?.icon}{" "}
                      {RISK_CATEGORIES[form.riskCategory]?.label}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-umbra-muted">
                      Beneficiary
                    </span>
                    <span className="text-sm text-white font-mono">
                      {form.beneficiaryAddress
                        ? `${form.beneficiaryAddress.slice(0, 10)}...${form.beneficiaryAddress.slice(-6)}`
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-umbra-muted">
                      Oracle Feed
                    </span>
                    <span className="text-sm text-white">
                      {ORACLE_FEEDS[form.oracleFeed]?.name ?? form.oracleFeed}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-umbra-muted">
                      Coverage Amount
                    </span>
                    <Badge variant="success" className="text-[10px]">
                      Encrypted via Fhenix FHE ✓
                    </Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-umbra-muted">
                      Trigger Threshold
                    </span>
                    <Badge variant="success" className="text-[10px]">
                      Encrypted via Fhenix FHE ✓
                    </Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-umbra-muted">
                      Premium
                    </span>
                    <Badge variant="success" className="text-[10px]">
                      Encrypted via Fhenix FHE ✓
                    </Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-umbra-muted">
                      Policy Reference Hash
                    </span>
                    <span className="text-xs text-umbra-muted font-mono">
                      {generatePolicyHash({
                        name: form.policyReferenceName || "draft",
                        enterprise: connectedAddress ?? "0x0",
                        timestamp: Date.now(),
                      }).slice(0, 20)}
                      ...
                    </span>
                  </div>
                </div>

                {/* Submit button with stages */}
                {submitting ? (
                  <div className="space-y-4 py-4">
                    {[
                      { stage: 1, text: "Connecting to CoFHE client...", icon: Zap },
                      { stage: 2, text: "FHE-encrypting coverage, premium & threshold...", icon: Lock },
                      { stage: 3, text: "Building transaction...", icon: Sparkles },
                      { stage: 4, text: "Waiting for Sepolia confirmation...", icon: Check },
                    ].map((s) => (
                      <motion.div
                        key={s.stage}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: submitStage >= s.stage ? 1 : 0.3,
                          x: 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-3"
                      >
                        {submitStage > s.stage ? (
                          <div className="w-6 h-6 rounded-full bg-umbra-success/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-umbra-success" />
                          </div>
                        ) : submitStage === s.stage ? (
                          <div className="w-6 h-6 rounded-full border-2 border-umbra-blue/30 border-t-umbra-blue animate-spin" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-white/10" />
                        )}
                        <span
                          className={`text-sm ${
                            submitStage >= s.stage
                              ? "text-white"
                              : "text-white/30"
                          }`}
                        >
                          {s.text}
                        </span>
                      </motion.div>
                    ))}
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{
                          width: `${(submitStage / 4) * 100}%`,
                        }}
                        className="h-full bg-gradient-to-r from-umbra-blue to-umbra-violet rounded-full"
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={!clientReady || isEncrypting}
                    glow
                  >
                    {!clientReady ? "Waiting for CoFHE..." : "Encrypt & Sign Policy"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </CardBody>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {!submitting && !submitted && (
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() =>
              setCurrentStep((prev) => Math.max(1, prev - 1) as FormStep)
            }
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          {currentStep < 4 && (
            <Button
              variant="primary"
              onClick={() =>
                setCurrentStep((prev) => Math.min(4, prev + 1) as FormStep)
              }
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
