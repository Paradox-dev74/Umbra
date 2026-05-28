// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";
import "./interfaces/IUmbra.sol";
import "./interfaces/Chainlink.sol";

/**
 * @title UmbraInsurance V5
 * @notice Parametric insurance via Fhenix CoFHE — settlement escrow proofs, private resolution events, premium lifecycle.
 */
contract UmbraInsurance is IUmbra {
    mapping(uint256 => euint64) private _encCoverage;
    mapping(uint256 => euint64) private _encPremium;
    mapping(uint256 => euint64) private _encThreshold;
    mapping(uint256 => euint64) private _encFloor;
    mapping(uint256 => euint64) private _encCeiling;
    mapping(uint256 => ebool) private _encTriggerResult;
    mapping(uint256 => euint64) private _encPayoutAmount;
    mapping(uint256 => euint64) private _encDeductible;
    mapping(uint256 => ebool) private _encPremiumRatioValid;
    mapping(uint256 => ebool) private _encProximityFlag;

    mapping(address => euint64) private _encHolderExposure;
    euint64 private _encGlobalExposure;

    mapping(address => uint256[]) private _holderPolicyIds;
    mapping(uint256 => address) public disputeArbitrator;

    address[] private _globalExposureViewers;
    mapping(address => bool) public isGlobalExposureViewer;

    mapping(uint256 => bytes32) public policyEscrowId;
    mapping(uint256 => bool) public premiumLocked;

    uint256 public nextPolicyId;
    mapping(uint256 => Policy) public policies;

    address public owner;
    address public trustedOracle;
    address public privaraRouter;
    bool public paused;

    uint64 public maxPremiumRatioDivisor = 20;
    uint256 public oracleMaxStaleness = 3600;

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

    constructor(address _trustedOracle, address _privaraRouter) {
        owner = msg.sender;
        trustedOracle = _trustedOracle;
        privaraRouter = _privaraRouter;
        nextPolicyId = 0;
    }

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
        euint64 encZero = FHE.asEuint64(0);
        FHE.allowThis(encZero);
        return _createPolicyCore(
            _beneficiary,
            _riskCategory,
            _oracleFeed,
            _expiryBlock,
            _inCoverage,
            _inPremium,
            _inThreshold,
            encZero,
            encZero,
            false,
            PolicyMode.SingleThreshold,
            _policyHash
        );
    }

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
    ) external whenNotPaused returns (uint256 policyId) {
        euint64 encDed = FHE.asEuint64(_inDeductible);
        FHE.allowThis(encDed);
        euint64 encZero = FHE.asEuint64(0);
        FHE.allowThis(encZero);
        return _createPolicyCore(
            _beneficiary,
            _riskCategory,
            _oracleFeed,
            _expiryBlock,
            _inCoverage,
            _inPremium,
            _inThreshold,
            encZero,
            encDed,
            true,
            PolicyMode.SingleThreshold,
            _policyHash
        );
    }

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
    ) external whenNotPaused returns (uint256 policyId) {
        euint64 encDed = FHE.asEuint64(_inDeductible);
        FHE.allowThis(encDed);
        euint64 encCeil = FHE.asEuint64(_inCeiling);
        FHE.allowThis(encCeil);
        policyId = _createPolicyCore(
            _beneficiary,
            _riskCategory,
            _oracleFeed,
            _expiryBlock,
            _inCoverage,
            _inPremium,
            _inFloorOrThreshold,
            encCeil,
            encDed,
            true,
            _policyMode,
            _policyHash
        );
        emit PolicyCreatedV3(policyId, uint8(_policyMode));
    }

    function _createPolicyCore(
        address _beneficiary,
        uint8 _riskCategory,
        address _oracleFeed,
        uint256 _expiryBlock,
        InEuint64 calldata _inCoverage,
        InEuint64 calldata _inPremium,
        InEuint64 calldata _inFloorOrThreshold,
        euint64 encCeiling,
        euint64 encDed,
        bool hasDeductible,
        PolicyMode _policyMode,
        bytes32 _policyHash
    ) private returns (uint256 policyId) {
        require(_beneficiary != address(0), "Umbra: zero beneficiary");
        require(_oracleFeed != address(0), "Umbra: zero oracle");
        require(_expiryBlock > block.number, "Umbra: already expired");

        policyId = nextPolicyId++;

        euint64 encCov = FHE.asEuint64(_inCoverage);
        euint64 encPrem = FHE.asEuint64(_inPremium);
        euint64 encBound = FHE.asEuint64(_inFloorOrThreshold);

        FHE.allowThis(encCov);
        FHE.allow(encCov, msg.sender);
        FHE.allow(encCov, _beneficiary);
        FHE.allowThis(encPrem);
        FHE.allow(encPrem, msg.sender);
        FHE.allow(encPrem, _beneficiary);
        FHE.allowThis(encBound);
        FHE.allow(encBound, msg.sender);
        FHE.allow(encBound, _beneficiary);

        if (_policyMode == PolicyMode.IndexBand) {
            _encFloor[policyId] = encBound;
            _encCeiling[policyId] = encCeiling;
            FHE.allow(encCeiling, msg.sender);
            FHE.allow(encCeiling, _beneficiary);
            if (hasDeductible) {
                FHE.allow(encDed, msg.sender);
                FHE.allow(encDed, _beneficiary);
                _encDeductible[policyId] = encDed;
            }
        } else {
            _encThreshold[policyId] = encBound;
            if (hasDeductible) {
                FHE.allow(encDed, msg.sender);
                FHE.allow(encDed, _beneficiary);
                _encDeductible[policyId] = encDed;
            }
        }

        ebool encRatioValid = _validatePremiumRatio(encPrem, encCov);
        FHE.allowThis(encRatioValid);
        FHE.allow(encRatioValid, msg.sender);
        FHE.allow(encRatioValid, _beneficiary);

        _encCoverage[policyId] = encCov;
        _encPremium[policyId] = encPrem;
        _encPremiumRatioValid[policyId] = encRatioValid;

        _accumulateHolderExposure(msg.sender, encCov);
        _accumulateGlobalExposure(encCov);

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
            settlementTx: bytes32(0),
            policyMode: _policyMode
        });

        _holderPolicyIds[msg.sender].push(policyId);

        premiumLocked[policyId] = true;

        emit PolicyCreated(policyId, msg.sender, _beneficiary, _riskCategory, _policyHash);
    }

    function _refundPremium(uint256 policyId) private {
        if (premiumLocked[policyId]) {
            premiumLocked[policyId] = false;
            emit PremiumRefunded(policyId);
        }
    }

    function getHolderPolicyCount(address holder) external view returns (uint256) {
        return _holderPolicyIds[holder].length;
    }

    function getHolderPolicyId(address holder, uint256 index) external view returns (uint256) {
        require(index < _holderPolicyIds[holder].length, "Umbra: index OOB");
        return _holderPolicyIds[holder][index];
    }

    function _validatePremiumRatio(euint64 encPrem, euint64 encCov) private returns (ebool) {
        euint64 encDivisor = FHE.asEuint64(maxPremiumRatioDivisor);
        FHE.allowThis(encDivisor);
        euint64 encMaxPrem = FHE.div(encCov, encDivisor);
        FHE.allowThis(encMaxPrem);
        return FHE.lte(encPrem, encMaxPrem);
    }

    function _accumulateHolderExposure(address holder, euint64 encCov) private {
        euint64 prev = _encHolderExposure[holder];
        euint64 newTotal = FHE.isInitialized(prev) ? FHE.add(prev, encCov) : encCov;
        FHE.allowThis(newTotal);
        FHE.allow(newTotal, holder);
        _encHolderExposure[holder] = newTotal;
    }

    function _accumulateGlobalExposure(euint64 encCov) private {
        euint64 prev = _encGlobalExposure;
        euint64 newTotal = FHE.isInitialized(prev) ? FHE.add(prev, encCov) : encCov;
        FHE.allowThis(newTotal);
        FHE.allow(newTotal, owner);
        _syncGlobalExposureViewers(newTotal);
        _encGlobalExposure = newTotal;
    }

    function _subtractExposure(address holder, uint256 policyId) private {
        euint64 encCov = _encCoverage[policyId];
        euint64 prevH = _encHolderExposure[holder];
        if (FHE.isInitialized(prevH)) {
            euint64 newH = FHE.sub(prevH, encCov);
            FHE.allowThis(newH);
            FHE.allow(newH, holder);
            _encHolderExposure[holder] = newH;
        }
        euint64 prevG = _encGlobalExposure;
        if (FHE.isInitialized(prevG)) {
            euint64 newG = FHE.sub(prevG, encCov);
            FHE.allowThis(newG);
            FHE.allow(newG, owner);
            _syncGlobalExposureViewers(newG);
            _encGlobalExposure = newG;
        }
    }

    function _syncGlobalExposureViewers(euint64 encTotal) private {
        uint256 len = _globalExposureViewers.length;
        for (uint256 i = 0; i < len; i++) {
            FHE.allow(encTotal, _globalExposureViewers[i]);
        }
    }

    function _readChainlinkOracle(address feedAddr) private view returns (uint256) {
        AggregatorV3Interface feed = AggregatorV3Interface(feedAddr);
        (, int256 answer, , uint256 updatedAt, ) = feed.latestRoundData();
        require(answer > 0, "Umbra: negative oracle");
        require(block.timestamp - updatedAt <= oracleMaxStaleness, "Umbra: stale feed");
        return uint256(answer);
    }

    /// @notice Emergency manual oracle resolution — owner only (V5); prefer resolveWithChainlink.
    function resolveWithOracle(
        uint256 policyId,
        uint256 oracleValue,
        bool
    ) external onlyOwner policyExists(policyId) whenNotPaused {
        _resolvePolicy(policyId, oracleValue);
    }

    function resolveWithChainlink(uint256 policyId)
        external
        onlyOracle
        policyExists(policyId)
        whenNotPaused
    {
        Policy storage policy = policies[policyId];
        require(policy.status == PolicyStatus.Active, "Umbra: not active");

        uint256 oracleValue = _readChainlinkOracle(policy.oracleFeed);
        emit ChainlinkResolved(policyId, policy.oracleFeed);
        _resolvePolicy(policyId, oracleValue);
    }

    /// @notice Oracle-only proximity preview — reads Chainlink on-chain (no caller-supplied value).
    function refreshProximityFromChainlink(uint256 policyId)
        external
        onlyOracle
        policyExists(policyId)
        whenNotPaused
    {
        Policy storage policy = policies[policyId];
        require(policy.status == PolicyStatus.Active, "Umbra: not active");

        uint256 oracleValue = _readChainlinkOracle(policy.oracleFeed);
        _updateProximityFlag(policyId, oracleValue);
    }

    /// @dev Legacy entrypoint — restricted to oracle; prefer refreshProximityFromChainlink.
    function refreshProximityFlag(uint256 policyId, uint256 oracleValue)
        external
        onlyOracle
        policyExists(policyId)
        whenNotPaused
    {
        Policy storage policy = policies[policyId];
        require(policy.status == PolicyStatus.Active, "Umbra: not active");
        _updateProximityFlag(policyId, oracleValue);
    }

    function _updateProximityFlag(uint256 policyId, uint256 oracleValue) private {
        Policy storage policy = policies[policyId];

        euint64 encOracleVal = FHE.asEuint64(uint64(oracleValue));
        FHE.allowThis(encOracleVal);

        ebool encProx = _evaluateTrigger(policyId, policy.riskCategory, encOracleVal);
        FHE.allowThis(encProx);
        FHE.allow(encProx, policy.holder);
        FHE.allow(encProx, policy.beneficiary);
        address arb = disputeArbitrator[policyId];
        if (arb != address(0)) {
            FHE.allow(encProx, arb);
        }

        _encProximityFlag[policyId] = encProx;
        emit ProximityFlagUpdated(policyId);
    }

    function _resolvePolicy(uint256 policyId, uint256 oracleValue) private {
        Policy storage policy = policies[policyId];
        require(policy.status == PolicyStatus.Active, "Umbra: not active");
        require(block.number <= policy.expiryBlock, "Umbra: expired");

        euint64 encOracleVal = FHE.asEuint64(uint64(oracleValue));
        FHE.allowThis(encOracleVal);

        ebool encResult = _evaluateTrigger(policyId, policy.riskCategory, encOracleVal);

        ebool encRatioValid = _encPremiumRatioValid[policyId];
        ebool encFinalTrigger = FHE.and(encResult, encRatioValid);

        euint64 encGross = _encCoverage[policyId];
        euint64 encDed = _encDeductible[policyId];
        euint64 encNet = FHE.isInitialized(encDed) ? FHE.sub(encGross, encDed) : encGross;
        FHE.allowThis(encNet);

        euint64 encZero = FHE.asEuint64(0);
        FHE.allowThis(encZero);
        euint64 encPayout = FHE.select(encFinalTrigger, encNet, encZero);

        FHE.allowThis(encFinalTrigger);
        FHE.allow(encFinalTrigger, policy.holder);
        FHE.allow(encFinalTrigger, policy.beneficiary);
        FHE.allow(encFinalTrigger, trustedOracle);

        FHE.allowThis(encPayout);
        FHE.allow(encPayout, policy.holder);
        FHE.allow(encPayout, policy.beneficiary);
        FHE.allow(encPayout, privaraRouter);

        _encTriggerResult[policyId] = encFinalTrigger;
        _encPayoutAmount[policyId] = encPayout;
        _encProximityFlag[policyId] = encFinalTrigger;

        policy.status = PolicyStatus.OracleTriggered;
        policy.resolvedBlock = block.number;

        emit PolicyResolvedPrivate(policyId, policy.oracleFeed);
        emit PolicyResolved(policyId);
    }

    function _evaluateTrigger(
        uint256 policyId,
        uint8 riskCategory,
        euint64 encOracleVal
    ) private returns (ebool) {
        Policy storage policy = policies[policyId];
        if (policy.policyMode == PolicyMode.IndexBand) {
            ebool gteFloor = FHE.gte(encOracleVal, _encFloor[policyId]);
            ebool lteCeil = FHE.lte(encOracleVal, _encCeiling[policyId]);
            return FHE.and(gteFloor, lteCeil);
        }
        euint64 encThreshold = _encThreshold[policyId];
        if (riskCategory == 1) {
            return FHE.lte(encOracleVal, encThreshold);
        }
        return FHE.gte(encOracleVal, encThreshold);
    }

    function linkSettlementEscrow(uint256 policyId, bytes32 escrowId)
        external
        policyExists(policyId)
        whenNotPaused
    {
        Policy storage policy = policies[policyId];
        require(policy.status == PolicyStatus.OracleTriggered, "Umbra: not triggered");
        require(
            msg.sender == policy.holder ||
                msg.sender == policy.beneficiary ||
                msg.sender == privaraRouter ||
                msg.sender == owner,
            "Umbra: not authorized"
        );
        require(escrowId != bytes32(0), "Umbra: zero escrow");
        policyEscrowId[policyId] = escrowId;
        emit PolicyEscrowLinked(policyId, escrowId);
    }

    function getPolicyEscrowId(uint256 policyId)
        external
        view
        policyExists(policyId)
        returns (bytes32)
    {
        return policyEscrowId[policyId];
    }

    function markSettled(uint256 policyId, bytes32 _settlementTx)
        external
        policyExists(policyId)
        whenNotPaused
    {
        Policy storage policy = policies[policyId];
        require(policy.status == PolicyStatus.OracleTriggered, "Umbra: not triggered");
        require(
            msg.sender == privaraRouter ||
                msg.sender == owner ||
                msg.sender == policy.holder ||
                msg.sender == policy.beneficiary,
            "Umbra: not authorized"
        );
        require(
            policyEscrowId[policyId] != bytes32(0) || _settlementTx != bytes32(0),
            "Umbra: no settlement proof"
        );
        policy.status = PolicyStatus.Settled;
        policy.settlementTx = _settlementTx;
        _subtractExposure(policy.holder, policyId);
        emit PolicySettled(policyId, _settlementTx);
    }

    function getCoverageHandle(uint256 policyId) external view policyExists(policyId) returns (euint64) {
        return _encCoverage[policyId];
    }

    function getPremiumHandle(uint256 policyId) external view policyExists(policyId) returns (euint64) {
        return _encPremium[policyId];
    }

    function getThresholdHandle(uint256 policyId) external view policyExists(policyId) returns (euint64) {
        return _encThreshold[policyId];
    }

    function getFloorHandle(uint256 policyId) external view policyExists(policyId) returns (euint64) {
        return _encFloor[policyId];
    }

    function getCeilingHandle(uint256 policyId) external view policyExists(policyId) returns (euint64) {
        return _encCeiling[policyId];
    }

    function getTriggerResultHandle(uint256 policyId) external view policyExists(policyId) returns (ebool) {
        return _encTriggerResult[policyId];
    }

    function getPayoutHandle(uint256 policyId) external view policyExists(policyId) returns (euint64) {
        return _encPayoutAmount[policyId];
    }

    function getDeductibleHandle(uint256 policyId) external view policyExists(policyId) returns (euint64) {
        return _encDeductible[policyId];
    }

    function getPremiumRatioValidHandle(uint256 policyId) external view policyExists(policyId) returns (ebool) {
        return _encPremiumRatioValid[policyId];
    }

    function getProximityFlagHandle(uint256 policyId) external view policyExists(policyId) returns (ebool) {
        return _encProximityFlag[policyId];
    }

    function getHolderExposureHandle(address holder) external view returns (euint64) {
        return _encHolderExposure[holder];
    }

    function getGlobalExposureHandle() external view returns (euint64) {
        return _encGlobalExposure;
    }

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
    ) external policyExists(policyId) whenNotPaused {
        require(viewer != address(0), "Umbra: zero viewer");
        Policy storage policy = policies[policyId];
        require(msg.sender == policy.holder, "Umbra: not holder");

        if (allowCoverage) FHE.allow(_encCoverage[policyId], viewer);
        if (allowPremium) FHE.allow(_encPremium[policyId], viewer);
        if (allowThreshold && policy.policyMode == PolicyMode.SingleThreshold) {
            FHE.allow(_encThreshold[policyId], viewer);
        }
        if (policy.policyMode == PolicyMode.IndexBand && allowThreshold) {
            FHE.allow(_encFloor[policyId], viewer);
            FHE.allow(_encCeiling[policyId], viewer);
        }
        if (allowDeductible && FHE.isInitialized(_encDeductible[policyId])) {
            FHE.allow(_encDeductible[policyId], viewer);
        }
        if (allowRatioValid && FHE.isInitialized(_encPremiumRatioValid[policyId])) {
            FHE.allow(_encPremiumRatioValid[policyId], viewer);
        }
        if (allowTrigger && FHE.isInitialized(_encTriggerResult[policyId])) {
            FHE.allow(_encTriggerResult[policyId], viewer);
        }
        if (allowPayout && FHE.isInitialized(_encPayoutAmount[policyId])) {
            FHE.allow(_encPayoutAmount[policyId], viewer);
        }
        if (allowProximity && FHE.isInitialized(_encProximityFlag[policyId])) {
            FHE.allow(_encProximityFlag[policyId], viewer);
        }

        emit ViewerAccessGranted(
            policyId,
            viewer,
            allowCoverage,
            allowPremium,
            allowThreshold,
            allowDeductible,
            allowRatioValid,
            allowTrigger,
            allowPayout,
            allowProximity
        );
    }

    function grantGlobalExposureViewer(address viewer) external onlyOwner whenNotPaused {
        require(viewer != address(0), "Umbra: zero viewer");
        if (!isGlobalExposureViewer[viewer]) {
            isGlobalExposureViewer[viewer] = true;
            _globalExposureViewers.push(viewer);
        }
        if (FHE.isInitialized(_encGlobalExposure)) {
            FHE.allow(_encGlobalExposure, viewer);
        }
        emit GlobalExposureViewerGranted(viewer);
    }

    function revokeGlobalExposureViewer(address viewer) external onlyOwner whenNotPaused {
        require(isGlobalExposureViewer[viewer], "Umbra: not viewer");
        isGlobalExposureViewer[viewer] = false;

        uint256 len = _globalExposureViewers.length;
        for (uint256 i = 0; i < len; i++) {
            if (_globalExposureViewers[i] == viewer) {
                _globalExposureViewers[i] = _globalExposureViewers[len - 1];
                _globalExposureViewers.pop();
                break;
            }
        }
    }

    function getGlobalExposureViewerCount() external view returns (uint256) {
        return _globalExposureViewers.length;
    }

    function expirePolicy(uint256 policyId) external policyExists(policyId) whenNotPaused {
        Policy storage policy = policies[policyId];
        require(policy.status == PolicyStatus.Active, "Umbra: not active");
        require(block.number > policy.expiryBlock, "Umbra: not expired yet");
        policy.status = PolicyStatus.Expired;
        _subtractExposure(policy.holder, policyId);
        _refundPremium(policyId);
        emit PolicyExpired(policyId);
    }

    function disputePolicy(uint256 policyId, address arbitrator)
        external
        policyExists(policyId)
        whenNotPaused
    {
        Policy storage policy = policies[policyId];
        require(msg.sender == policy.holder, "Umbra: not holder");
        require(
            policy.status == PolicyStatus.Settled || policy.status == PolicyStatus.OracleTriggered,
            "Umbra: invalid status"
        );
        require(arbitrator != address(0), "Umbra: zero arbitrator");

        policy.status = PolicyStatus.Disputed;
        disputeArbitrator[policyId] = arbitrator;

        if (FHE.isInitialized(_encTriggerResult[policyId])) {
            FHE.allow(_encTriggerResult[policyId], arbitrator);
        }
        if (FHE.isInitialized(_encPayoutAmount[policyId])) {
            FHE.allow(_encPayoutAmount[policyId], arbitrator);
        }
        if (FHE.isInitialized(_encPremiumRatioValid[policyId])) {
            FHE.allow(_encPremiumRatioValid[policyId], arbitrator);
        }
        if (FHE.isInitialized(_encProximityFlag[policyId])) {
            FHE.allow(_encProximityFlag[policyId], arbitrator);
        }

        emit PolicyDisputed(policyId, msg.sender, arbitrator);
    }

    function resolveDispute(uint256 policyId, bool uphold)
        external
        policyExists(policyId)
        whenNotPaused
    {
        Policy storage policy = policies[policyId];
        require(policy.status == PolicyStatus.Disputed, "Umbra: not disputed");
        require(
            msg.sender == disputeArbitrator[policyId] || msg.sender == owner,
            "Umbra: not arbitrator"
        );

        policy.status = uphold ? PolicyStatus.Settled : PolicyStatus.OracleTriggered;
        emit DisputeResolved(policyId, uphold);
    }

    function cancelPolicy(uint256 policyId) external policyExists(policyId) whenNotPaused {
        Policy storage policy = policies[policyId];
        require(msg.sender == policy.holder, "Umbra: not holder");
        require(policy.status == PolicyStatus.Active, "Umbra: not active");
        policy.status = PolicyStatus.Cancelled;
        _subtractExposure(policy.holder, policyId);
        _refundPremium(policyId);
        emit PolicyCancelled(policyId);
    }

    function getPolicy(uint256 policyId) external view policyExists(policyId) returns (Policy memory) {
        return policies[policyId];
    }

    function getPolicyCount() external view returns (uint256) {
        return nextPolicyId;
    }

    function setTrustedOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Umbra: zero address");
        trustedOracle = _oracle;
    }

    function setPrivaraRouter(address _router) external onlyOwner {
        require(_router != address(0), "Umbra: zero address");
        privaraRouter = _router;
    }

    function setMaxPremiumRatioDivisor(uint64 _divisor) external onlyOwner {
        require(_divisor >= 4, "Umbra: ratio too high");
        maxPremiumRatioDivisor = _divisor;
    }

    function setOracleMaxStaleness(uint256 _seconds) external onlyOwner {
        oracleMaxStaleness = _seconds;
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Umbra: zero address");
        owner = newOwner;
    }
}
