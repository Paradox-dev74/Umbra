/* ═══════════════════════════════════════════════════════════
   UmbraInsurance — Contract ABI
   Auto-derived from artifacts/contracts/UmbraInsurance.sol/UmbraInsurance.json
   ═══════════════════════════════════════════════════════════ */

export const UMBRA_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_trustedOracle", type: "address" },
      { internalType: "address", name: "_privaraRouter",  type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { internalType: "uint8", name: "got",      type: "uint8" },
      { internalType: "uint8", name: "expected", type: "uint8" },
    ],
    name: "InvalidEncryptedInput",
    type: "error",
  },
  {
    inputs: [{ internalType: "int32", name: "value", type: "int32" }],
    name: "SecurityZoneOutOfBounds",
    type: "error",
  },
  /* ── Events ── */
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: "uint256", name: "policyId",    type: "uint256" },
      { indexed: false, internalType: "uint256", name: "oracleValue", type: "uint256" },
      { indexed: false, internalType: "bool",    name: "triggered",   type: "bool"    },
    ],
    name: "OracleResolved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: "uint256", name: "policyId",    type: "uint256" },
      { indexed: true,  internalType: "address", name: "holder",      type: "address" },
      { indexed: true,  internalType: "address", name: "beneficiary", type: "address" },
      { indexed: false, internalType: "uint8",   name: "riskCategory",type: "uint8"   },
      { indexed: false, internalType: "bytes32", name: "policyHash",  type: "bytes32" },
    ],
    name: "PolicyCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "policyId",  type: "uint256" },
      { indexed: true, internalType: "address", name: "disputedBy",type: "address" },
    ],
    name: "PolicyDisputed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "uint256", name: "policyId", type: "uint256" }],
    name: "PolicyExpired",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: "uint256", name: "policyId",    type: "uint256" },
      { indexed: false, internalType: "bytes32", name: "settlementTx",type: "bytes32" },
    ],
    name: "PolicySettled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: "uint256", name: "policyId",    type: "uint256" },
      { indexed: false, internalType: "uint256", name: "oracleValue", type: "uint256" },
    ],
    name: "PolicyTriggered",
    type: "event",
  },
  /* ── Functions ── */
  {
    inputs: [
      { internalType: "address", name: "_beneficiary",   type: "address" },
      { internalType: "uint8",   name: "_riskCategory",  type: "uint8"   },
      { internalType: "address", name: "_oracleFeed",    type: "address" },
      { internalType: "uint256", name: "_expiryBlock",   type: "uint256" },
      {
        components: [
          { internalType: "uint256", name: "ctHash",       type: "uint256" },
          { internalType: "uint8",   name: "securityZone", type: "uint8"   },
          { internalType: "uint8",   name: "utype",        type: "uint8"   },
          { internalType: "bytes",   name: "signature",    type: "bytes"   },
        ],
        internalType: "struct InEuint64",
        name: "_inCoverage",
        type: "tuple",
      },
      {
        components: [
          { internalType: "uint256", name: "ctHash",       type: "uint256" },
          { internalType: "uint8",   name: "securityZone", type: "uint8"   },
          { internalType: "uint8",   name: "utype",        type: "uint8"   },
          { internalType: "bytes",   name: "signature",    type: "bytes"   },
        ],
        internalType: "struct InEuint64",
        name: "_inPremium",
        type: "tuple",
      },
      {
        components: [
          { internalType: "uint256", name: "ctHash",       type: "uint256" },
          { internalType: "uint8",   name: "securityZone", type: "uint8"   },
          { internalType: "uint8",   name: "utype",        type: "uint8"   },
          { internalType: "bytes",   name: "signature",    type: "bytes"   },
        ],
        internalType: "struct InEuint64",
        name: "_inThreshold",
        type: "tuple",
      },
      { internalType: "bytes32", name: "_policyHash", type: "bytes32" },
    ],
    name: "createPolicy",
    outputs: [{ internalType: "uint256", name: "policyId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "policyId", type: "uint256" }],
    name: "disputePolicy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "policyId", type: "uint256" }],
    name: "expirePolicy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "policyId", type: "uint256" }],
    name: "getCoverageHandle",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "policyId", type: "uint256" }],
    name: "getPolicy",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id",           type: "uint256" },
          { internalType: "address", name: "holder",       type: "address" },
          { internalType: "address", name: "beneficiary",  type: "address" },
          { internalType: "uint8",   name: "riskCategory", type: "uint8"   },
          { internalType: "address", name: "oracleFeed",   type: "address" },
          { internalType: "uint8",   name: "status",       type: "uint8"   },
          { internalType: "uint256", name: "createdBlock", type: "uint256" },
          { internalType: "uint256", name: "expiryBlock",  type: "uint256" },
          { internalType: "bytes32", name: "policyHash",   type: "bytes32" },
          { internalType: "uint256", name: "resolvedBlock",type: "uint256" },
          { internalType: "bytes32", name: "settlementTx", type: "bytes32" },
        ],
        internalType: "struct IUmbra.Policy",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPolicyCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "policyId", type: "uint256" }],
    name: "getPremiumHandle",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "policyId", type: "uint256" }],
    name: "getThresholdHandle",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "policyId", type: "uint256" }],
    name: "getTriggerResultHandle",
    outputs: [{ internalType: "ebool", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "policyId",    type: "uint256" },
      { internalType: "bytes32", name: "_settlementTx",type: "bytes32" },
    ],
    name: "markSettled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "nextPolicyId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "policies",
    outputs: [
      { internalType: "uint256", name: "id",           type: "uint256" },
      { internalType: "address", name: "holder",       type: "address" },
      { internalType: "address", name: "beneficiary",  type: "address" },
      { internalType: "uint8",   name: "riskCategory", type: "uint8"   },
      { internalType: "address", name: "oracleFeed",   type: "address" },
      { internalType: "uint8",   name: "status",       type: "uint8"   },
      { internalType: "uint256", name: "createdBlock", type: "uint256" },
      { internalType: "uint256", name: "expiryBlock",  type: "uint256" },
      { internalType: "bytes32", name: "policyHash",   type: "bytes32" },
      { internalType: "uint256", name: "resolvedBlock",type: "uint256" },
      { internalType: "bytes32", name: "settlementTx", type: "bytes32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "privaraRouter",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "policyId",    type: "uint256" },
      { internalType: "uint256", name: "oracleValue", type: "uint256" },
      { internalType: "bool",    name: "",            type: "bool"    },
    ],
    name: "resolveWithOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "_paused", type: "bool" }],
    name: "setPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_router", type: "address" }],
    name: "setPrivaraRouter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_oracle", type: "address" }],
    name: "setTrustedOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "trustedOracle",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  /* ── cancelPolicy (added in v2) ── */
  {
    inputs: [{ internalType: "uint256", name: "policyId", type: "uint256" }],
    name: "cancelPolicy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "uint256", name: "policyId", type: "uint256" }],
    name: "PolicyCancelled",
    type: "event",
  },
] as const;

/* ═══════════════════════════════════════════════════════════
   Chainlink AggregatorV3 ABI (for latestRoundData price reads)
   ═══════════════════════════════════════════════════════════ */
export const CHAINLINK_AGGREGATOR_ABI = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80",  name: "roundId",         type: "uint80"  },
      { internalType: "int256",  name: "answer",          type: "int256"  },
      { internalType: "uint256", name: "startedAt",       type: "uint256" },
      { internalType: "uint256", name: "updatedAt",       type: "uint256" },
      { internalType: "uint80",  name: "answeredInRound", type: "uint80"  },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
