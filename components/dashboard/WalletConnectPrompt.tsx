"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card } from "@/components/ui/Card";
import { Wallet, Shield, Zap } from "lucide-react";

interface WalletConnectPromptProps {
  title?: string;
  description?: string;
}

export function WalletConnectPrompt({
  title = "Connect your wallet",
  description = "Connect on Ethereum Sepolia to view policies, encrypt terms with CoFHE, and manage settlements.",
}: WalletConnectPromptProps) {
  return (
    <Card className="p-8 md:p-12 text-center border-dashed border-white/10">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-umbra-cyan/20 to-umbra-violet/20 flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10">
        <Wallet className="w-8 h-8 text-umbra-cyan" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm text-umbra-muted max-w-md mx-auto mb-8">{description}</p>
      <div className="flex justify-center mb-8">
        <ConnectButton />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
        {[
          { icon: Shield, label: "FHE-encrypted terms", sub: "Coverage stays sealed on-chain" },
          { icon: Zap, label: "Chainlink oracles", sub: "Live Sepolia price feeds" },
          { icon: Wallet, label: "Your keys only", sub: "Decrypt locally via CoFHE" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
            <Icon className="w-4 h-4 text-umbra-blue mb-2" />
            <p className="text-xs font-medium text-white">{label}</p>
            <p className="text-[10px] text-umbra-muted mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
