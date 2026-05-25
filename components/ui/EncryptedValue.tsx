"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Lock, Unlock, Shield } from "lucide-react";
import { useFhenix } from "@/hooks/useFhenix";
import { toast } from "sonner";

type RevealState = "locked" | "decrypting" | "revealed" | "error";
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
}: EncryptedValueProps) {
  const { decryptValue, decryptBool, clientReady } = useFhenix();
  const [state, setState] = useState<RevealState>("locked");
  const [revealedText, setRevealedText] = useState("");
  const [decryptedValue, setDecryptedValue] = useState<string | null>(value);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const relockTimer = useRef<ReturnType<typeof setTimeout>>();

  const lockAgain = useCallback(() => {
    setState("locked");
    setRevealedText("");
    setDecryptedValue(null);
  }, []);

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
    if (state !== "locked") return;

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
        const raw = await decryptBool(ctHash);
        const text = formatBool ? formatBool(raw) : raw ? "Triggered" : "Not Triggered";
        setDecryptedValue(text);
        setTimeout(() => typewriterReveal(text), 400);
      } else {
        const raw = await decryptValue(ctHash);
        const text = format ? format(raw) : raw.toString();
        setDecryptedValue(text);
        setTimeout(() => typewriterReveal(text), 400);
      }
    } catch (err: unknown) {
      console.error("decryptForView failed:", err);
      setState("error");
      toast.error("Decrypt failed — verify ACL permit and CoFHE connection.");
    }
  }, [
    state,
    ctHash,
    value,
    clientReady,
    decryptValue,
    decryptBool,
    format,
    formatBool,
    valueType,
    typewriterReveal,
  ]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <AnimatePresence mode="wait">
        {state === "locked" && (
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
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDecrypt}
              className="p-1.5 rounded-lg border border-umbra-cyan/30 text-umbra-cyan bg-umbra-cyan/5 hover:bg-umbra-cyan/15 transition-colors"
              aria-label="Sealed decrypt via CoFHE"
              title="Sealed decrypt via CoFHE Threshold Network"
            >
              <Lock className="w-3.5 h-3.5" />
            </motion.button>
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
              CoFHE decrypt…
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
            className="flex items-center gap-2"
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
  );
}
