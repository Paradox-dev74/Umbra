# Umbra Protocol

**Confidential parametric insurance on Ethereum Sepolia — CoFHE encryption, Chainlink resolution, Privara settlement.**

Umbra V5 stores coverage, premium, thresholds, and payout math as encrypted on-chain ciphertexts. Oracle resolution uses verified Chainlink feeds inside the contract. Settlement routes through Privara (ReineiraOS) with escrow proof linking before `markSettled`.

---

## Architecture

```
Holder → CoFHE encrypt → UmbraInsurance V5 → Chainlink resolve → FHE trigger/payout
                              ↓
                    ACL + permits (audit/reinsurer)
                              ↓
              Privara escrow (create → fund → redeem) → markSettled
```

### What stays public vs encrypted

| Data | Visibility |
|------|------------|
| Policy existence, status, blocks | Public on-chain |
| Oracle feed address, Chainlink price at resolve | Public (parametric design) |
| Coverage, premium, threshold, payout | Encrypted (CoFHE) |
| Trigger result, proximity flag | Encrypted ebool — sealed decrypt only |
| Settlement amount via Privara | Confidential (ReineiraOS) |

See `lib/privacy-boundaries.ts` for the full classification.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Web3 | wagmi v2, viem v2, RainbowKit |
| FHE | `@cofhe/sdk`, `@cofhe/react` on Ethereum Sepolia |
| Oracle | Chainlink AggregatorV3 (Sepolia feeds in `lib/constants.ts`) |
| Settlement | `@reineira-os/sdk` (Privara / ReineiraOS testnet) |
| Contracts | Solidity 0.8.25, `@fhenixprotocol/cofhe-contracts` |

---

## Quick Start

```bash
pnpm install
cp .env.example .env.local
# Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID and contract address after deploy

pnpm run compile:contracts
pnpm run export:abi
pnpm run test:contracts
pnpm run test:acl
pnpm dev
```

### Deploy contract (Sepolia)

```bash
pnpm run deploy:sepolia
# Updates deployment.json — copy address into .env.local
```

---

## Operator Runbook

### Wallets

| Role | Purpose |
|------|---------|
| **Owner** | Pause, grant viewers, emergency `resolveWithOracle` (V5 owner-only) |
| **Trusted oracle** | `resolveWithChainlink`, refresh proximity |
| **Privara router** | Settlement authorization on-chain |
| **Holder / beneficiary** | Create policy, link escrow, mark settled |
| **Arbitrator** | Resolve disputes assigned per policy |

### Oracle resolution

1. Connect trusted oracle wallet (`NEXT_PUBLIC_UMBRA_ORACLE`).
2. Open policy → **Resolve with Oracle** → **Resolve via Chainlink**.
3. Contract reads feed on-chain; threshold stays encrypted.

### Settlement (V5)

1. Policy status must be **Triggered**.
2. Run **Settlement Wizard**: sealed decrypt → Privara escrow → link escrow → `markSettled`.
3. V5 requires `policyEscrowId` or settlement tx proof before marking settled.

### Audit permits

1. Holder opens **Audit Portal** → issue CoFHE sharing permit.
2. Auditor imports permit → sealed decrypt read-only handles.

---

## Deployed Contract (Sepolia V5)

| Field | Value |
|-------|-------|
| **Address** | `0x87c3a6c25e49563CFB5CC48600C820aa81b329B3` |
| **Network** | Ethereum Sepolia (11155111) |
| **Owner / Oracle / Router** | `0x5c56148a9a5E9FA1038243850b5B8242C8D4F1B1` |
| **Deploy tx** | [0xd874…97d5](https://sepolia.etherscan.io/tx/0xd87438550942c3b372b891eb83586e45878ca1f2995168fa1aa19b25a4c197d5) |
| **Explorer** | [Etherscan](https://sepolia.etherscan.io/address/0x87c3a6c25e49563CFB5CC48600C820aa81b329B3) |

Set in `.env.local`:

```env
NEXT_PUBLIC_UMBRA_CONTRACT=0x87c3a6c25e49563CFB5CC48600C820aa81b329B3
NEXT_PUBLIC_UMBRA_V5=true
NEXT_PUBLIC_UMBRA_VERSION=V5
NEXT_PUBLIC_UMBRA_ORACLE=0x5c56148a9a5E9FA1038243850b5B8242C8D4F1B1
```

---

## E2E Checklist (Sepolia)

- [x] Deploy V5 contract; set `NEXT_PUBLIC_UMBRA_CONTRACT`
- [ ] Connect holder wallet; create policy with encrypted terms
- [ ] Oracle wallet: `resolveWithChainlink` on active policy
- [ ] Holder: sealed decrypt trigger + payout in Settlement Wizard
- [ ] Privara: escrow funded and redeemed; escrow linked on Umbra
- [ ] `markSettled` succeeds; policy status = Settled
- [ ] Auditor permit: read-only decrypt of assigned handles
- [ ] Arbitrator: only assigned wallet resolves dispute
- [ ] Build gates: `compile:contracts`, `export:abi`, `test:contracts`, `test:acl`, `tsc --noEmit`, `build`

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm compile:contracts` | Hardhat compile |
| `pnpm export:abi` | Export ABI to `lib/abi.ts` |
| `pnpm test:contracts` | Hardhat tests |
| `pnpm test:acl` | ACL policy matrix unit tests |
| `pnpm deploy:sepolia` | Deploy to Sepolia |

---

## License

MIT
