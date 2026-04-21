/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Create New Policy Page
   ═══════════════════════════════════════════════════════════ */

"use client";

import { CreatePolicyForm } from "@/components/forms/CreatePolicyForm";

export default function CreatePolicyPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold">
          <span className="text-white">Create New </span>
          <span className="text-umbra-blue">Confidential Policy</span>
        </h1>
        <p className="text-umbra-muted text-sm mt-2">
          Define your parametric insurance policy. All financial parameters will
          be encrypted using Fhenix FHE before touching the blockchain.
        </p>
      </div>

      <CreatePolicyForm />
    </div>
  );
}
