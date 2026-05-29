"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Lock, Unlock, Shield, Ban } from "lucide-react";
import { useFhenix } from "@/hooks/useFhenix";
import { toast } from "sonner";
import type { AclRole, EncryptedField } from "@/lib/acl-policy";
import { decryptPathLabel, getAccessExplanation } from "@/lib/acl-policy";

type RevealState = "locked" | "denied" | "decrypting" | "revealed" | "error";
type FheValueType = "uint64" | "bool";

interface EncryptedValueProps {
  ctHash?: `0x${string}`;
  value?: string | null;
  unit?: string;
  valueType?: FheValueType;
  format?: (raw: bigint) => string;
  formatBool?: (raw: boolean) => string;
  className?: string;
  mono?: boolean;
  autoRelockMs?: number;
  compact?: boolean;
  /** ACL metadata — required when ctHash is set */
  field?: EncryptedField;
  policyStatus?: number;
  role?: AclRole;
  decryptPath?: "view" | "tx";
}

export function EncryptedValue({
  ctHash,
  value = null,
  unit = "",
  valueType = "uint64",
  format,
  formatBool,
  className,
  mono = true,
  autoRelockMs = 90_000,
  compact = false,
  field = "coverage",
  policyStatus = 0,
  role = "holder",
  decryptPath = "view",
}: EncryptedValueProps) {
  const { decryptForView, explainAccess, clientReady } = useFhenix();
  const [state, setState] = useState<RevealState>("locked");
  const [revealedText, setRevealedText] = useState("");
  const [decryptedValue, setDecryptedValue] = useState<string | null>(value);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const relockTimer = useRef<ReturnType<typeof setTimeout>>();

  const access = useMemo(
    () => explainAccess(role, policyStatus, field, decryptPath),
    [explainAccess, role, policyStatus, field, decryptPath]
  );

  useEffect(() => {
    if (ctHash && !access.allowed) {
      setState("denied");
    } else if (state === "denied" && access.allowed) {
      setState("locked");
    }
  }, [access.allowed, ctHash, state]);

  const lockAgain = useCallback(() => {
    setState(access.allowed ? "locked" : "denied");
    setRevealedText("");
    setDecryptedValue(null);
  }, [access.allowed]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (relockTimer.current) clearTimeout(relockTimer.current);
    };
  }, []);

  useEffect(() => {
    if (state === "revealed" && autoRelockMs > 0) {
      relockTimer.current = setTimeout(lockAgain, autoRelockMs);
      return () => {
        if (relockTimer.current) clearTimeout(relockTimer.current);
      };
    }
  }, [state, autoRelockMs, lockAgain]);

  const typewriterReveal = useCallback((text: string) => {
    let charIndex = 0;
    setRevealedText("");
    intervalRef.current = setInterval(() => {
      charIndex++;
      setRevealedText(text.slice(0, charIndex));
      if (charIndex >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setState("revealed");
      }
    }, 35);
  }, []);

  const handleDecrypt = useCallback(async () => {
    if (state !== "locked" && state !== "denied") return;

    if (!access.allowed) {
      setState("denied");
      toast.error(access.reason);
      return;
    }

    if (!ctHash) {
      if (value) {
        setState("decrypting");
        setTimeout(() => {
          setDecryptedValue(value);
          typewriterReveal(value);
        }, 600);
      }
      return;
    }

    if (!clientReady) {
      toast.error("CoFHE client not ready — connect wallet and wait a moment.");
      return;
    }

    setState("decrypting");
    try {
      if (valueType === "bool") {
        const raw = await decryptForView(role, policyStatus, field, ctHash, "bool");
        const text = formatBool ? formatBool(raw as boolean) : (raw as boolean) ? "Triggered" : "Not Triggered";
        setDecryptedValue(text);
        setTimeout(() => typewriterReveal(text), 400);
      } else {
        const raw = await decryptForView(role, policyStatus, field, ctHash, "uint64");
        const text = format ? format(raw as bigint) : (raw as bigint).toString();
        setDecryptedValue(text);
        setTimeout(() => typewriterReveal(text), 400);
      }
    } catch (err: unknown) {
      console.error("decryptForView failed:", err);
      setState("error");
      toast.error(
        err instanceof Error ? err.message : "Decrypt failed — verify ACL permit and CoFHE connection."
      );
    }
  }, [
    state,
    access,
    ctHash,
    value,
    clientReady,
    decryptForView,
    role,
    policyStatus,
    field,
    format,
    formatBool,
    valueType,
    typewriterReveal,
  ]);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {(state === "locked" || state === "denied") && (
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <span className={cn("encrypted-mask tracking-widest text-sm", mono && "font-mono")}>
                {valueType === "bool" ? "●●●●●●●●" : compact ? "████" : "████████"}
              </span>
              {unit && <span className="text-umbra-muted text-xs">{unit}</span>}
              {state === "denied" ? (
                <span title={access.reason}>
                  <Ban className="w-3.5 h-3.5 text-umbra-danger" aria-label={access.reason} />
                </span>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDecrypt}
                  className="p-1.5 rounded-lg border border-umbra-cyan/30 text-umbra-cyan bg-umbra-cyan/5 hover:bg-umbra-cyan/15 transition-colors"
                  aria-label={`Sealed decrypt via ${decryptPathLabel(decryptPath)}`}
                  title={`${decryptPathLabel(decryptPath)} · ${field}`}
                >
                  <Lock className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </motion.div>
          )}

          {state === "decrypting" && (
            <motion.div
              key="decrypting"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="relative w-4 h-4">
                <div className="absolute inset-0 rounded-full border-2 border-umbra-violet/20" />
                <div className="absolute inset-0 rounded-full border-2 border-t-umbra-violet animate-spin" />
              </div>
              <span className="text-umbra-violet text-xs animate-pulse flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {decryptPathLabel(decryptPath)}…
              </span>
            </motion.div>
          )}

          {state === "error" && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <span className="text-umbra-danger text-xs">ACL / CoFHE error</span>
              <button onClick={() => setState("locked")} className="text-xs text-umbra-muted hover:text-white underline">
                retry
              </button>
            </motion.div>
          )}

          {state === "revealed" && (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              className="flex items-center gap-2 reveal-unseal"
            >
              <span className={cn("text-white", mono && "font-mono")}>{revealedText || decryptedValue}</span>
              {unit && <span className="text-umbra-muted text-xs">{unit}</span>}
              <Unlock className="w-3.5 h-3.5 text-umbra-success" />
              {autoRelockMs > 0 && (
                <button onClick={lockAgain} className="text-[10px] text-umbra-muted hover:text-umbra-cyan underline">
                  lock
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {ctHash && (
        <p className={cn("text-[10px]", access.allowed ? "text-umbra-muted" : "text-umbra-danger/80")}>
          {access.allowed
            ? `${role} · ${decryptPathLabel(decryptPath)} · ${field}`
            : access.reason}
        </p>
      )}
    </div>
  );
}
