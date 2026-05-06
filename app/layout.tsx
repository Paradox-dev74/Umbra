/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Root Layout + Providers
   ═══════════════════════════════════════════════════════════ */

import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import "./globals.css";

// Disable static generation for all pages — @cofhe/sdk, wagmi, and WalletConnect
// access window/indexedDB at module load time and crash during SSR/prerender.
export const dynamic = "force-dynamic";

const Providers = nextDynamic(() => import("@/components/Providers").then((m) => m.Providers), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Umbra Protocol — Invisible Risk Coverage",
  description:
    "Confidential parametric insurance powered by Fhenix FHE. Encrypt your trigger thresholds, evaluate oracle data homomorphically, settle silently via Privara.",
  keywords: [
    "parametric insurance",
    "FHE",
    "Fhenix",
    "Privara",
    "confidential",
    "enterprise",
    "blockchain",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-umbra-bg text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
