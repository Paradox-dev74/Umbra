// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IUmbra.sol";

/**
 * @title UmbraInsurance
 * @notice Confidential parametric insurance using Fhenix FHE + Chainlink oracles + Privara settlement
 * @dev All financial parameters (coverage, premium, threshold) are stored as encrypted FHE ciphertexts.
 *      Oracle resolution compares public oracle values against encrypted thresholds using FHE comparison.
 *      Settlement is routed through Privara (ReineiraOS) for silent treasury payouts.
 *
 *      This contract is designed for the Fhenix Helium testnet (chain ID 8008135).
 */
contract UmbraInsurance is IUmbra {
    /* ═══════════════════════════════════════════════════════
       Storage
       ═══════════════════════════════════════════════════════ */

    /// @notice Auto-incrementing policy counter
    uint256 public nextPolicyId;

    /// @notice Mapping of policy ID to Policy struct
    mapping(uint256 => Policy) public policies;

    /// @notice Mapping of policy ID to encrypted terms
    mapping(uint256 => EncryptedTerms) public encryptedTerms;

    /// @notice Owner of the contract (deployer)
    address public owner;

    /// @notice Trusted oracle address for resolving policies
    address public trustedOracle;

    /// @notice Privara settlement router address
    address public privaraRouter;

    /// @notice Whether the contract is paused
    bool public paused;

    /* ═══════════════════════════════════════════════════════
       Modifiers
       ═══════════════════════════════════════════════════════ */

    modifier onlyOwner() {
        require(msg.sender == owner, "Umbra: not owner");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == trustedOracle, "Umbra: not oracle");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Umbra: paused");
        _;
    }

    modifier policyExists(uint256 policyId) {
        require(policyId < nextPolicyId, "Umbra: policy does not exist");
        _;
    }

    /* ═══════════════════════════════════════════════════════
       Constructor
       ═══════════════════════════════════════════════════════ */

    constructor(address _trustedOracle, address _privaraRouter) {
        owner = msg.sender;
        trustedOracle = _trustedOracle;
        privaraRouter = _privaraRouter;
        nextPolicyId = 0;
    }

    /* ═══════════════════════════════════════════════════════
       Core Functions
       ═══════════════════════════════════════════════════════ */

    /**
     * @notice Create a new confidential insurance policy
     * @param _beneficiary Address to receive the payout
     * @param _riskCategory Category identifier (0=drought, 1=flood, etc.)
     * @param _oracleFeed Chainlink oracle feed address
     * @param _expiryBlock Block at which the policy expires
     * @param _encryptedCoverage FHE-encrypted coverage amount (euint64)
     * @param _encryptedPremium FHE-encrypted premium amount (euint64)
     * @param _encryptedThreshold FHE-encrypted trigger threshold (euint64)
     * @param _policyHash keccak256 hash of the plaintext terms (for off-chain verification)
     */
    function createPolicy(
        address _beneficiary,
        uint8 _riskCategory,
        address _oracleFeed,
        uint256 _expiryBlock,
        bytes calldata _encryptedCoverage,
        bytes calldata _encryptedPremium,
        bytes calldata _encryptedThreshold,
        bytes32 _policyHash
    ) external whenNotPaused returns (uint256 policyId) {
        require(_beneficiary != address(0), "Umbra: zero beneficiary");
        require(_oracleFeed != address(0), "Umbra: zero oracle feed");
        require(_expiryBlock > block.number, "Umbra: already expired");
        require(_encryptedCoverage.length > 0, "Umbra: empty coverage");
        require(_encryptedPremium.length > 0, "Umbra: empty premium");
        require(_encryptedThreshold.length > 0, "Umbra: empty threshold");

        policyId = nextPolicyId++;

        policies[policyId] = Policy({
            id: policyId,
            holder: msg.sender,
            beneficiary: _beneficiary,
            riskCategory: _riskCategory,
            oracleFeed: _oracleFeed,
            status: PolicyStatus.Active,
            createdBlock: block.number,
            expiryBlock: _expiryBlock,
            policyHash: _policyHash,
            resolvedBlock: 0,
            settlementTx: bytes32(0)
        });

        encryptedTerms[policyId] = EncryptedTerms({
            encryptedCoverage: _encryptedCoverage,
            encryptedPremium: _encryptedPremium,
            encryptedThreshold: _encryptedThreshold
        });

        emit PolicyCreated(
            policyId,
            msg.sender,
            _beneficiary,
            _riskCategory,
            _policyHash
        );
    }

    /**
     * @notice Oracle resolves a policy by comparing the public oracle value against the encrypted threshold
     * @dev In production, this would perform an FHE comparison (euint64.lt / euint64.gt)
     *      on the Fhenix coprocessor. For the hackathon, we simulate the encrypted comparison.
     * @param policyId The policy to resolve
     * @param oracleValue The current oracle value (public, from Chainlink)
     * @param triggered Whether the oracle value crossed the encrypted threshold
     */
    function resolveWithOracle(
        uint256 policyId,
        uint256 oracleValue,
        bool triggered
    ) external onlyOracle policyExists(policyId) whenNotPaused {
        Policy storage policy = policies[policyId];

        require(
            policy.status == PolicyStatus.Active,
            "Umbra: not active"
        );
        require(
            block.number <= policy.expiryBlock,
            "Umbra: policy expired"
        );

        if (triggered) {
            policy.status = PolicyStatus.OracleTriggered;
            policy.resolvedBlock = block.number;

            emit OracleResolved(policyId, oracleValue, true);
            emit PolicyTriggered(policyId, oracleValue);
        } else {
            emit OracleResolved(policyId, oracleValue, false);
        }
    }

    /**
     * @notice Mark a triggered policy as settled after Privara executes the payout
     * @dev Called by the Privara router or the owner after confirming settlement
     * @param policyId The policy that was settled
     * @param _settlementTx The Privara transaction hash
     */
    function markSettled(
        uint256 policyId,
        bytes32 _settlementTx
    ) external policyExists(policyId) {
        require(
            msg.sender == privaraRouter || msg.sender == owner,
            "Umbra: not authorized"
        );

        Policy storage policy = policies[policyId];

        require(
            policy.status == PolicyStatus.OracleTriggered,
            "Umbra: not triggered"
        );

        policy.status = PolicyStatus.Settled;
        policy.settlementTx = _settlementTx;

        emit PolicySettled(policyId, _settlementTx);
    }

    /**
     * @notice Expire a policy that has passed its expiry block
     * @param policyId The policy to expire
     */
    function expirePolicy(
        uint256 policyId
    ) external policyExists(policyId) {
        Policy storage policy = policies[policyId];

        require(
            policy.status == PolicyStatus.Active,
            "Umbra: not active"
        );
        require(
            block.number > policy.expiryBlock,
            "Umbra: not expired yet"
        );

        policy.status = PolicyStatus.Expired;

        emit PolicyExpired(policyId);
    }

    /**
     * @notice Dispute a settled policy (governance / manual review)
     * @param policyId The policy to dispute
     */
    function disputePolicy(
        uint256 policyId
    ) external policyExists(policyId) {
        Policy storage policy = policies[policyId];

        require(
            msg.sender == policy.holder || msg.sender == owner,
            "Umbra: not holder or owner"
        );
        require(
            policy.status == PolicyStatus.Settled ||
                policy.status == PolicyStatus.OracleTriggered,
            "Umbra: invalid status for dispute"
        );

        policy.status = PolicyStatus.Disputed;

        emit PolicyDisputed(policyId, msg.sender);
    }

    /* ═══════════════════════════════════════════════════════
       View Functions
       ═══════════════════════════════════════════════════════ */

    /**
     * @notice Get policy details
     */
    function getPolicy(
        uint256 policyId
    ) external view policyExists(policyId) returns (Policy memory) {
        return policies[policyId];
    }

    /**
     * @notice Get encrypted terms for a policy
     */
    function getEncryptedTerms(
        uint256 policyId
    ) external view policyExists(policyId) returns (EncryptedTerms memory) {
        return encryptedTerms[policyId];
    }

    /**
     * @notice Get the total number of policies
     */
    function getPolicyCount() external view returns (uint256) {
        return nextPolicyId;
    }

    /* ═══════════════════════════════════════════════════════
       Admin Functions
       ═══════════════════════════════════════════════════════ */

    function setTrustedOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Umbra: zero address");
        trustedOracle = _oracle;
    }

    function setPrivaraRouter(address _router) external onlyOwner {
        require(_router != address(0), "Umbra: zero address");
        privaraRouter = _router;
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Umbra: zero address");
        owner = newOwner;
    }
}
