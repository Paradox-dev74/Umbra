/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Settings Page
   ═══════════════════════════════════════════════════════════ */

"use client";

import { motion } from "framer-motion";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { UMBRA_CONTRACT_ADDRESS } from "@/lib/constants";
import { formatAddress } from "@/lib/utils";
import { Settings, Shield, ExternalLink, Copy } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { address, isConnected, chain } = useAccount();
  const [copied, setCopied] = useState(false);

  const copyAddress = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Settings</h1>
        <p className="text-umbra-muted text-sm mt-1">
          Wallet and network configuration
        </p>
      </div>

      <div className="space-y-4">
        {/* Wallet */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-white">Wallet</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {isConnected && address ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-umbra-muted">Address</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-mono">{formatAddress(address, 8)}</span>
                      <button
                        onClick={() => copyAddress(address)}
                        className="text-umbra-muted hover:text-white transition-colors"
                        title="Copy address"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-umbra-muted">Network</span>
                    <span className="text-sm text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-umbra-success" />
                      {chain?.name ?? "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-umbra-muted">Chain ID</span>
                    <span className="text-sm text-white font-mono">{chain?.id}</span>
                  </div>
                  {copied && (
                    <p className="text-xs text-umbra-success">Address copied!</p>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-umbra-muted text-sm mb-4">No wallet connected</p>
                  <ConnectButton />
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Contract */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-umbra-blue" />
                <h2 className="text-sm font-semibold text-white">Smart Contract</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-umbra-muted">UmbraInsurance</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-mono">
                    {formatAddress(UMBRA_CONTRACT_ADDRESS, 8)}
                  </span>
                  <a
                    href={`https://sepolia.etherscan.io/address/${UMBRA_CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-umbra-blue hover:text-white transition-colors"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-umbra-muted">Network</span>
                <span className="text-sm text-white">Ethereum Sepolia</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-umbra-muted">FHE Scheme</span>
                <span className="text-sm text-white">CoFHE (Fully Homomorphic)</span>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
