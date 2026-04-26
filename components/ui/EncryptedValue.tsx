/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Encrypted Value (Masked → Sealed Decrypt via CoFHE)
   Accepts a ctHash (euint64 handle as bytes32) and uses
   useFhenix().decryptValue to request sealed decryption from
   the CoFHE Threshold Network.
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Lock, Unlock } from "lucide-react";
import { useFhenix } from "@/hooks/useFhenix";

type RevealState = "locked" | "decrypting" | "revealed" | "error";

interface EncryptedValueProps {
  /** euint64 ciphertext handle (bytes32 hex) returned by getCoverageHandle() etc. */
  ctHash?: `0x${string}`;
  /** Fallback static value (displayed as-is, no decrypt needed) */
  value?: string | null;
  unit?: string;
  /** Optional format function applied to the raw BigInt after decryption */
  format?: (raw: bigint) => string;
  className?: string;
  mono?: boolean;
}

export function EncryptedValue({
  ctHash,
  value = null,
  unit = "",
  format,
  className,
  mono = true,
}: EncryptedValueProps) {
  const { decryptValue, clientReady } = useFhenix();
  const [state, setState] = useState<RevealState>("locked");
  const [revealedText, setRevealedText] = useState("");
  const [decryptedValue, setDecryptedValue] = useState<string | null>(value);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

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
    }, 40);
  }, []);

  const handleDecrypt = useCallback(async () => {
    if (state !== "locked") return;

    // If no ctHash, just reveal the static value immediately
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
      alert("CoFHE client not ready yet — please wait.");
      return;
    }

    setState("decrypting");
    try {
      const raw = await decryptValue(ctHash);
      const text = format ? format(raw) : raw.toString();
      setDecryptedValue(text);
      setTimeout(() => typewriterReveal(text), 400);
    } catch (err: unknown) {
      console.error("decryptForView failed:", err);
      setState("error");
    }
  }, [state, ctHash, value, clientReady, decryptValue, format, typewriterReveal]);

  if (state === "locked") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span
          className={cn(
            "text-white/70 tracking-widest",
            mono && "font-mono"
          )}
        >
          ████████
        </span>
        {unit && <span className="text-umbra-muted text-sm">{unit}</span>}
        <button
          onClick={handleDecrypt}
          className="ml-2 p-1.5 rounded-md border border-umbra-blue/30 text-umbra-blue hover:bg-umbra-blue/10 transition-colors"
          aria-label="Decrypt value"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (state === "decrypting") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="relative w-5 h-5">
          <div className="absolute inset-0 rounded-full border-2 border-umbra-violet/30" />
          <div className="absolute inset-0 rounded-full border-2 border-t-umbra-violet animate-spin" />
        </div>
        <span className="text-umbra-violet text-sm animate-pulse">
          Sealed decrypt via CoFHE Threshold Network...
        </span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-red-400 text-sm">Decrypt failed — check ACL permit</span>
        <button
          onClick={() => setState("locked")}
          className="text-xs text-umbra-muted hover:text-white underline"
        >
          retry
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("text-white", mono && "font-mono")}>
        {revealedText || decryptedValue}
      </span>
      {unit && <span className="text-umbra-muted text-sm">{unit}</span>}
      <Unlock className="w-3.5 h-3.5 text-umbra-success ml-1" />
    </div>
  );
}
