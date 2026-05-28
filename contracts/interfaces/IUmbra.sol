// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {InEuint64} from "@fhenixprotocol/cofhe-contracts/ICofhe.sol";

interface IUmbra {
    enum PolicyStatus {
        Active,
        OracleTriggered,
        Settled,
        Expired,
        Disputed,
        Cancelled
    }

    enum PolicyMode {
        SingleThreshold,
        IndexBand
    }

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
        PolicyMode policyMode;
    }

    event PolicyCreated(
        uint256 indexed policyId,
        address indexed holder,
        address indexed beneficiary,
        uint8 riskCategory,
        bytes32 policyHash
    );

    event PolicyCreatedV3(uint256 indexed policyId, uint8 policyMode);

    /// @notice Resolution complete — no public oracle value (V5)
    event PolicyResolved(uint256 indexed policyId);

    event PolicyResolvedPrivate(uint256 indexed policyId, address indexed feed);

    event ChainlinkResolved(uint256 indexed policyId, address indexed feed);

    event PolicyEscrowLinked(uint256 indexed policyId, bytes32 escrowId);

    event PremiumRefunded(uint256 indexed policyId);

    event PolicySettled(uint256 indexed policyId, bytes32 settlementTx);

    event PolicyExpired(uint256 indexed policyId);

    event PolicyDisputed(
        uint256 indexed policyId,
        address indexed disputedBy,
        address indexed arbitrator
    );

    event PolicyCancelled(uint256 indexed policyId);

    event DisputeResolved(uint256 indexed policyId, bool upheld);

    event ViewerAccessGranted(
        uint256 indexed policyId,
        address indexed viewer,
        bool coverage,
        bool premium,
        bool threshold,
        bool deductible,
        bool ratioValid,
        bool trigger,
        bool payout,
        bool proximity
    );

    event GlobalExposureViewerGranted(address indexed viewer);

    event ProximityFlagUpdated(uint256 indexed policyId);

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

    function createPolicyV2(
        address _beneficiary,
        uint8 _riskCategory,
        address _oracleFeed,
        uint256 _expiryBlock,
        InEuint64 calldata _inCoverage,
        InEuint64 calldata _inPremium,
        InEuint64 calldata _inThreshold,
        InEuint64 calldata _inDeductible,
        bytes32 _policyHash
    ) external returns (uint256 policyId);

    function createPolicyV3(
        address _beneficiary,
        uint8 _riskCategory,
        address _oracleFeed,
        uint256 _expiryBlock,
        InEuint64 calldata _inCoverage,
        InEuint64 calldata _inPremium,
        InEuint64 calldata _inFloorOrThreshold,
        InEuint64 calldata _inCeiling,
        InEuint64 calldata _inDeductible,
        PolicyMode _policyMode,
        bytes32 _policyHash
    ) external returns (uint256 policyId);

    function resolveWithOracle(
        uint256 policyId,
        uint256 oracleValue,
        bool triggered
    ) external;

    function resolveWithChainlink(uint256 policyId) external;

    function refreshProximityFromChainlink(uint256 policyId) external;

    function markSettled(uint256 policyId, bytes32 _settlementTx) external;

    function grantViewerAccess(
        uint256 policyId,
        address viewer,
        bool allowCoverage,
        bool allowPremium,
        bool allowThreshold,
        bool allowDeductible,
        bool allowRatioValid,
        bool allowTrigger,
        bool allowPayout,
        bool allowProximity
    ) external;

    function grantGlobalExposureViewer(address viewer) external;

    function revokeGlobalExposureViewer(address viewer) external;

    function linkSettlementEscrow(uint256 policyId, bytes32 escrowId) external;

    function getPolicyEscrowId(uint256 policyId) external view returns (bytes32);

    function disputePolicy(uint256 policyId, address arbitrator) external;

    function resolveDispute(uint256 policyId, bool uphold) external;

    function getHolderPolicyCount(address holder) external view returns (uint256);

    function getHolderPolicyId(address holder, uint256 index) external view returns (uint256);
}
