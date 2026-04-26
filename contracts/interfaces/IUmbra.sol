// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {InEuint64} from "@fhenixprotocol/cofhe-contracts/ICofhe.sol";

/**
 * @title IUmbra
 * @notice Interface for the Umbra confidential parametric insurance protocol
 */
interface IUmbra {
    /* ═══════════════════════════════════════════════════════
       Enums
       ═══════════════════════════════════════════════════════ */

    enum PolicyStatus {
        Active,           // 0 — Policy is live, oracle monitoring
        OracleTriggered,  // 1 — Oracle threshold breached
        Settled,          // 2 — Payout completed via Privara
        Expired,          // 3 — Policy passed expiry block
        Disputed,         // 4 — Under dispute / review
        Cancelled         // 5 — Cancelled by holder before trigger
    }

    /* ═══════════════════════════════════════════════════════
       Structs
       ═══════════════════════════════════════════════════════ */

    struct Policy {
        uint256 id;
        address holder;
        address beneficiary;
        uint8 riskCategory;
        address oracleFeed;
        PolicyStatus status;
        uint256 createdBlock;
        uint256 expiryBlock;
        bytes32 policyHash;
        uint256 resolvedBlock;
        bytes32 settlementTx;
    }

    /* ═══════════════════════════════════════════════════════
       Events
       ═══════════════════════════════════════════════════════ */

    event PolicyCreated(
        uint256 indexed policyId,
        address indexed holder,
        address indexed beneficiary,
        uint8 riskCategory,
        bytes32 policyHash
    );

    event OracleResolved(
        uint256 indexed policyId,
        uint256 oracleValue,
        bool triggered
    );

    event PolicyTriggered(
        uint256 indexed policyId,
        uint256 oracleValue
    );

    event PolicySettled(
        uint256 indexed policyId,
        bytes32 settlementTx
    );

    event PolicyExpired(uint256 indexed policyId);

    event PolicyDisputed(
        uint256 indexed policyId,
        address indexed disputedBy
    );

    /* ═══════════════════════════════════════════════════════
       Core Functions
       ═══════════════════════════════════════════════════════ */

    function createPolicy(
        address _beneficiary,
        uint8 _riskCategory,
        address _oracleFeed,
        uint256 _expiryBlock,
        InEuint64 calldata _inCoverage,
        InEuint64 calldata _inPremium,
        InEuint64 calldata _inThreshold,
        bytes32 _policyHash
    ) external returns (uint256 policyId);

    function resolveWithOracle(
        uint256 policyId,
        uint256 oracleValue,
        bool triggered
    ) external;

    function markSettled(
        uint256 policyId,
        bytes32 _settlementTx
    ) external;

    function expirePolicy(uint256 policyId) external;

    function disputePolicy(uint256 policyId) external;

    /* ═══════════════════════════════════════════════════════
       View Functions
       ═══════════════════════════════════════════════════════ */

    function getPolicy(uint256 policyId) external view returns (Policy memory);
    function getPolicyCount() external view returns (uint256);
}
