/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Utility Functions
   ═══════════════════════════════════════════════════════════ */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatUSDC(amount: number): string {
  return (amount / 1_000_000).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatBigUSDC(amount: bigint): string {
  return (Number(amount) / 1_000_000).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function generatePolicyHash(params: {
  name: string;
  enterprise: string;
  timestamp: number;
}): `0x${string}` {
  const data = `${params.name}:${params.enterprise}:${params.timestamp}`;
  const bytes = new TextEncoder().encode(data);
  let hex = "";
  for (let i = 0; i < bytes.length && hex.length < 64; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return `0x${hex.padEnd(64, "0")}` as `0x${string}`;
}

export function formatTimestamp(timestamp: bigint | number): string {
  const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(timestamp: bigint | number): string {
  const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  const now = Math.floor(Date.now() / 1000);
  const diff = now - ts;

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function blocksToDate(currentBlock: number, targetBlock: number, blockTime = 12): string {
  const blocksRemaining = targetBlock - currentBlock;
  const secondsRemaining = blocksRemaining * blockTime;
  const futureDate = new Date(Date.now() + secondsRemaining * 1000);
  return futureDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
