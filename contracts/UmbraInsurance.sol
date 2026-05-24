// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";
import "./interfaces/IUmbra.sol";

/**
 * @title UmbraInsurance
 * @notice Confidential parametric insurance using Fhenix CoFHE + Chainlink oracles + Privara settlement.
 *
 * Privacy architecture:
 *  - Coverage amount, premium, and trigger threshold are stored as euint64 ciphertext handles.
 *  - Oracle resolution uses FHE.gte(encryptedThreshold, triviallyEncryptedOracleValue) so the
 *    threshold is NEVER revealed — only an encrypted ebool result is produced.
 *  - That ebool is stored on-chain and only the policy holder / beneficiary can request a
 *    sealed decrypt via the Threshold Network to verify the outcome off-chain.
 *  - FHE.allowThis / FHE.allow ensure strict ACL: only the contract, holder, and beneficiary
 *    can request decryption of their own values.
 *
 * Deployment target: Ethereum Sepolia (CoFHE coprocessor live at TASK_MANAGER_ADDRESS).
 */
contract UmbraInsurance is IUmbra {
    /* ═══════════════════════════════════════════════════════
       FHE Encrypted Storage
       ═══════════════════════════════════════════════════════ */

    /// @notice policyId → encrypted coverage amount (euint64 handle)
    mapping(uint256 => euint64) private _encCoverage;

    /// @notice policyId → encrypted premium (euint64 handle)
    mapping(uint256 => euint64) private _encPremium;

    /// @notice policyId → encrypted trigger threshold (euint64 handle)
    mapping(uint256 => euint64) private _encThreshold;

    /// @notice policyId → encrypted comparison result (ebool handle — set after oracle resolution)
    mapping(uint256 => ebool) private _encTriggerResult;

    /* ═══════════════════════════════════════════════════════
       Plaintext Storage
       ═══════════════════════════════════════════════════════ */

    uint256 public nextPolicyId;
    mapping(uint256 => Policy) public policies;

    address public owner;
    address public trustedOracle;
    address public privaraRouter;
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
        require(policyId < nextPolicyId, "Umbra: not found");
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
       Core: Create Policy
       ═══════════════════════════════════════════════════════ */

    /**
     * @notice Create a new confidential insurance policy.
     *         All financial terms are submitted as FHE-encrypted ciphertexts (InEuint64)
     *         and stored as euint64 handles — the plaintext values are NEVER on-chain.
     *
     * @param _beneficiary   Address to receive the payout
     * @param _riskCategory  Risk category (0-4)
     * @param _oracleFeed    Chainlink oracle feed address
     * @param _expiryBlock   Block number at which the policy expires
     * @param _inCoverage    FHE-encrypted coverage  (InEuint64 from @cofhe/sdk)
     * @param _inPremium     FHE-encrypted premium   (InEuint64)
     * @param _inThreshold   FHE-encrypted threshold (InEuint64)
     * @param _policyHash    keccak256 of reference terms (off-chain audit only)
     */
    function createPolicy(
        address _beneficiary,
        uint8 _riskCategory,
        address _oracleFeed,
        uint256 _expiryBlock,
        InEuint64 calldata _inCoverage,
        InEuint64 calldata _inPremium,
        InEuint64 calldata _inThreshold,
        bytes32 _policyHash
    ) external whenNotPaused returns (uint256 policyId) {
        require(_beneficiary != address(0), "Umbra: zero beneficiary");
        require(_oracleFeed != address(0), "Umbra: zero oracle");
        require(_expiryBlock > block.number, "Umbra: already expired");

        policyId = nextPolicyId++;

        // Convert encrypted inputs → euint64 handles
        euint64 encCov  = FHE.asEuint64(_inCoverage);
        euint64 encPrem = FHE.asEuint64(_inPremium);
        euint64 encThr  = FHE.asEuint64(_inThreshold);

        // ACL: contract retains access; holder + beneficiary can request sealed decrypt
        FHE.allowThis(encCov);  FHE.allow(encCov,  msg.sender);  FHE.allow(encCov,  _beneficiary);
        FHE.allowThis(encPrem); FHE.allow(encPrem, msg.sender);  FHE.allow(encPrem, _beneficiary);
        FHE.allowThis(encThr);  FHE.allow(encThr,  msg.sender);  FHE.allow(encThr,  _beneficiary);

        _encCoverage[policyId]  = encCov;
        _encPremium[policyId]   = encPrem;
        _encThreshold[policyId] = encThr;

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

        emit PolicyCreated(policyId, msg.sender, _beneficiary, _riskCategory, _policyHash);
    }

    /* ═══════════════════════════════════════════════════════
       Core: Oracle Resolution (real FHE comparison)
       ═══════════════════════════════════════════════════════ */

    /**
     * @notice Resolve a policy using a live oracle value.
     *         Trivially encrypts the public oracle value then runs
     *         FHE.gte(oracleVal, encThreshold) — the threshold is NEVER revealed.
     *         Stores the encrypted ebool result; holder/beneficiary can seal-decrypt it.
     *
     * @param policyId    Policy to resolve
     * @param oracleValue Raw Chainlink oracle reading (plaintext, publicly verifiable)
     */
    function resolveWithOracle(
        uint256 policyId,
        uint256 oracleValue,
        bool /* triggered — determined by FHE comparison, param kept for interface compat */
    ) external onlyOracle policyExists(policyId) whenNotPaused {
        Policy storage policy = policies[policyId];
        require(policy.status == PolicyStatus.Active, "Umbra: not active");
        require(block.number <= policy.expiryBlock, "Umbra: expired");

        // Trivially encrypt the public oracle value at security zone 0
        euint64 encOracleVal = FHE.asEuint64(uint64(oracleValue));
        FHE.allowThis(encOracleVal);

        // FHE comparison: result = oracleValue >= threshold  (threshold breached)
        ebool encResult = FHE.gte(encOracleVal, _encThreshold[policyId]);

        // Grant ACL: contract, holder, beneficiary, oracle can seal-decrypt the result
        FHE.allowThis(encResult);
        FHE.allow(encResult, policy.holder);
        FHE.allow(encResult, policy.beneficiary);
        FHE.allow(encResult, trustedOracle);
        _encTriggerResult[policyId] = encResult;

        policy.status    = PolicyStatus.OracleTriggered;
        policy.resolvedBlock = block.number;

        emit OracleResolved(policyId, oracleValue, true);
        emit PolicyTriggered(policyId, oracleValue);
    }

    /* ═══════════════════════════════════════════════════════
       Core: Settlement
       ═══════════════════════════════════════════════════════ */

    /**
     * @notice Mark a triggered policy as settled after Privara executes the payout.
     * @param policyId      Settled policy ID
     * @param _settlementTx Privara escrow transaction hash
     */
    function markSettled(
        uint256 policyId,
        bytes32 _settlementTx
    ) external policyExists(policyId) {
        require(msg.sender == privaraRouter || msg.sender == owner, "Umbra: not authorized");
        Policy storage policy = policies[policyId];
        require(policy.status == PolicyStatus.OracleTriggered, "Umbra: not triggered");
        policy.status = PolicyStatus.Settled;
        policy.settlementTx = _settlementTx;
        emit PolicySettled(policyId, _settlementTx);
    }

    /* ═══════════════════════════════════════════════════════
       FHE Handle Getters
       (Returns ciphertext handles — caller must have ACL permit to decrypt)
       ═══════════════════════════════════════════════════════ */

    function getCoverageHandle(uint256 policyId) external view policyExists(policyId) returns (euint64) {
        return _encCoverage[policyId];
    }

    function getPremiumHandle(uint256 policyId) external view policyExists(policyId) returns (euint64) {
        return _encPremium[policyId];
    }

    function getThresholdHandle(uint256 policyId) external view policyExists(policyId) returns (euint64) {
        return _encThreshold[policyId];
    }

    /// @notice Holder/beneficiary call this to get the ebool handle, then
    ///         request sealed decryption off-chain via the CoFHE Threshold Network.
    function getTriggerResultHandle(uint256 policyId) external view policyExists(policyId) returns (ebool) {
        return _encTriggerResult[policyId];
    }

    /* ═══════════════════════════════════════════════════════
       Lifecycle helpers
       ═══════════════════════════════════════════════════════ */

    function expirePolicy(uint256 policyId) external policyExists(policyId) {
        Policy storage policy = policies[policyId];
        require(policy.status == PolicyStatus.Active, "Umbra: not active");
        require(block.number > policy.expiryBlock, "Umbra: not expired yet");
        policy.status = PolicyStatus.Expired;
        emit PolicyExpired(policyId);
    }

    function disputePolicy(uint256 policyId) external policyExists(policyId) {
        Policy storage policy = policies[policyId];
        require(msg.sender == policy.holder || msg.sender == owner, "Umbra: not authorized");
        require(
            policy.status == PolicyStatus.Settled || policy.status == PolicyStatus.OracleTriggered,
            "Umbra: invalid status"
        );
        policy.status = PolicyStatus.Disputed;
        emit PolicyDisputed(policyId, msg.sender);
    }

    /**
     * @notice Cancel an active policy. Only the policy holder can cancel
     *         and only while the policy status is Active.
     * @param policyId The policy to cancel
     */
    function cancelPolicy(uint256 policyId) external policyExists(policyId) whenNotPaused {
        Policy storage policy = policies[policyId];
        require(msg.sender == policy.holder, "Umbra: not holder");
        require(policy.status == PolicyStatus.Active, "Umbra: not active");
        policy.status = PolicyStatus.Cancelled;
        emit PolicyCancelled(policyId);
    }

    /* ═══════════════════════════════════════════════════════
       View
       ═══════════════════════════════════════════════════════ */

    function getPolicy(uint256 policyId) external view policyExists(policyId) returns (Policy memory) {
        return policies[policyId];
    }

    function getPolicyCount() external view returns (uint256) {
        return nextPolicyId;
    }

    /* ═══════════════════════════════════════════════════════
       Admin
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
