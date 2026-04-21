# Umbra Protocol

**Confidential Parametric Insurance — Fhenix FHE × Chainlink × Privara**

> On-chain parametric insurance where coverage amounts, premiums, and trigger thresholds remain fully encrypted using Fhenix Fully Homomorphic Encryption. Oracle resolution happens against sealed ciphertexts. Payouts route silently through Privara (ReineiraOS) — no financial data ever touches the public chain.

---

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Chainlink   │─────▶│  Umbra Core  │─────▶│   Privara   │
│  Oracle Feed │      │  (Fhenix FHE)│      │  Settlement │
└─────────────┘      └──────────────┘      └─────────────┘
     Public               Encrypted             Silent
   Price Data          Comparison (FHE)     Treasury Payout
```

### Flow

1. **Policy Creation** — Holder encrypts coverage, premium, and threshold using Fhenix's `BfheClient`. Encrypted ciphertexts are stored on-chain.
2. **Oracle Monitoring** — Chainlink price feeds provide public market data. The contract compares oracle values against FHE-encrypted thresholds.
3. **Trigger & Settlement** — When the threshold is breached, Privara (ReineiraOS) executes a silent payout to the beneficiary. No coverage amount is ever exposed on-chain.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Animation | Framer Motion 11 |
| Web3 | wagmi v2, viem v2 |
| FHE | Fhenix (coFHE SDK / BfheClient) |
| Oracle | Chainlink Price Feeds |
| Settlement | Privara (ReineiraOS SDK) |
| Smart Contract | Solidity 0.8.20 |
| Network | Fhenix Helium Testnet (Chain ID 8008135) |

---

## Project Structure

```
umbra/
├── app/
│   ├── globals.css
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   ├── dashboard/
│   │   ├── layout.tsx           # Dashboard sidebar layout
│   │   ├── page.tsx             # Dashboard overview
│   │   ├── create/
│   │   │   └── page.tsx         # Create new policy
│   │   └── policy/
│   │       └── [id]/
│   │           └── page.tsx     # Policy detail
│   └── settle/
│       └── [id]/
│           └── page.tsx         # Settlement execution
├── components/
│   ├── ui/                      # Design system primitives
│   ├── landing/                 # Landing page sections
│   ├── dashboard/               # Dashboard components
│   └── forms/                   # Policy & oracle forms
├── hooks/                       # React hooks (FHE, Privara, contract)
├── lib/                         # Types, constants, utils, SDK wrappers
├── contracts/
│   ├── UmbraInsurance.sol       # Main contract
│   └── interfaces/
│       └── IUmbra.sol           # Contract interface
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── postcss.config.mjs
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/umbra.git
cd umbra

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Fill in your API keys and contract addresses

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm build
pnpm start
```

---

## Smart Contract

The `UmbraInsurance.sol` contract is designed for the **Fhenix Helium testnet**.

### Key Functions

| Function | Description |
|----------|-------------|
| `createPolicy()` | Creates a new policy with FHE-encrypted terms |
| `resolveWithOracle()` | Oracle compares public value against encrypted threshold |
| `markSettled()` | Records Privara settlement transaction |
| `expirePolicy()` | Expires a policy past its expiry block |
| `disputePolicy()` | Flags a policy for dispute review |

### Deployment

```bash
# Using Hardhat or Foundry — deploy to Fhenix Helium
# Update NEXT_PUBLIC_UMBRA_CONTRACT in .env.local with the deployed address
```

---

## Key Features

- **Fully Encrypted Terms** — Coverage, premium, and threshold stored as FHE ciphertexts (euint64)
- **Sealed Comparison** — Oracle values compared against encrypted thresholds without decryption
- **Silent Settlement** — Payouts routed through Privara with zero on-chain financial exposure
- **Five Risk Categories** — Drought, Flood, Earthquake, Hurricane, Wildfire
- **Real-time Oracle Feeds** — Chainlink price feed integration with live monitoring
- **Animated Dashboard** — Full particle canvas, energy orb, animated transitions, count-up stats

---

## Design

The UI features a deep cosmic dark theme (`#020817` background) with:

- Blue (`#3B82F6`) and violet (`#8B5CF6`) accent system
- Glass-morphism nav bar with scroll-based opacity
- Animated particle canvas background
- Energy orb with orbital rings and traveling dots
- Encrypted value reveal animations (locked → decrypting → revealed)
- Spring-physics micro-interactions on all interactive elements

---

## Risk Categories

| Category | Oracle Feed | FHE Operator |
|----------|------------|--------------|
| Drought | Rainfall Index | `euint64.lt` (Below threshold) |
| Flood | Water Level | `euint64.gt` (Above threshold) |
| Earthquake | Seismic Index | `euint64.gt` (Above threshold) |
| Hurricane | Wind Speed | `euint64.gt` (Above threshold) |
| Wildfire | Heat Index | `euint64.gt` (Above threshold) |

---

## License

MIT

---

Built for the Fhenix × Chainlink hackathon.
