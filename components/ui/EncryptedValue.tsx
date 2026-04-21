/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Encrypted Value (Masked → Decrypt Reveal)
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Lock, Unlock } from "lucide-react";

type RevealState = "locked" | "decrypting" | "revealed";

interface EncryptedValueProps {
  value: string | null;
  unit?: string;
  onDecryptRequest: () => Promise<string>;
  className?: string;
  mono?: boolean;
}

export function EncryptedValue({
  value,
  unit = "",
  onDecryptRequest,
  className,
  mono = true,
}: EncryptedValueProps) {
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

    setState("decrypting");

    try {
      const result = await onDecryptRequest();
      setDecryptedValue(result);

      setTimeout(() => {
        typewriterReveal(result);
      }, 1200);
    } catch {
      setState("locked");
    }
  }, [state, onDecryptRequest, typewriterReveal]);

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
          Decrypting via FHE...
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "text-white",
          mono && "font-mono"
        )}
      >
        {revealedText || decryptedValue}
      </span>
      {unit && <span className="text-umbra-muted text-sm">{unit}</span>}
      <Unlock className="w-3.5 h-3.5 text-umbra-success ml-1" />
    </div>
  );
}
