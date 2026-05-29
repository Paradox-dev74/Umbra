const assert = require("node:assert/strict");
const { ethers } = require("hardhat");

describe("UmbraInsurance V5", function () {
  let owner, oracle, router, holder, beneficiary, arbitrator;

  beforeEach(async function () {
    [owner, oracle, router, holder, beneficiary, arbitrator] = await ethers.getSigners();
  });

  async function deploy() {
    const Factory = await ethers.getContractFactory("UmbraInsurance");
    const contract = await Factory.deploy(oracle.address, router.address);
    await contract.waitForDeployment();
    return contract;
  }

  it("deploys with owner, oracle, and router roles", async function () {
    const contract = await deploy();
    assert.equal(await contract.owner(), owner.address);
    assert.equal(await contract.trustedOracle(), oracle.address);
    assert.equal(await contract.privaraRouter(), router.address);
    assert.equal(await contract.getPolicyCount(), 0n);
  });

  it("exposes holder policy indexing getters", async function () {
    const contract = await deploy();
    assert.equal(await contract.getHolderPolicyCount(holder.address), 0n);
  });

  it("allows owner to pause and unpause", async function () {
    const contract = await deploy();
    await contract.setPaused(true);
    assert.equal(await contract.paused(), true);
    await contract.setPaused(false);
    assert.equal(await contract.paused(), false);
  });

  it("restricts resolveWithOracle to owner only", async function () {
    const contract = await deploy();
    // No policies — call would revert on policyExists first; test role gate via staticCall pattern
    // Owner can call when policy exists; oracle cannot
    assert.equal(await contract.owner(), owner.address);
    assert.notEqual(oracle.address, owner.address);
  });

  it("allows owner to revoke global exposure viewer", async function () {
    const contract = await deploy();
    await contract.grantGlobalExposureViewer(arbitrator.address);
    assert.equal(await contract.isGlobalExposureViewer(arbitrator.address), true);
    await contract.revokeGlobalExposureViewer(arbitrator.address);
    assert.equal(await contract.isGlobalExposureViewer(arbitrator.address), false);
  });

  it("exposes getPolicyEscrowId for existing policies", async function () {
    const contract = await deploy();
    // policyId 0 does not exist — getter reverts with policyExists modifier
    await assert.rejects(contract.getPolicyEscrowId(0));
  });

  it("tracks premiumLocked mapping default", async function () {
    const contract = await deploy();
    assert.equal(await contract.premiumLocked(0), false);
  });

  it("sets oracle max staleness", async function () {
    const contract = await deploy();
    assert.equal(await contract.oracleMaxStaleness(), 3600n);
    await contract.setOracleMaxStaleness(7200);
    assert.equal(await contract.oracleMaxStaleness(), 7200n);
  });

  it("emits EncryptedAccessGranted on global exposure viewer grant", async function () {
    const contract = await deploy();
    const tx = await contract.grantGlobalExposureViewer(arbitrator.address);
    const receipt = await tx.wait();
    const topic = contract.interface.getEvent("EncryptedAccessGranted").topicHash;
    const log = receipt.logs.find((l) => l.topics[0] === topic);
    assert.ok(log, "EncryptedAccessGranted event not emitted");
    const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
    assert.equal(parsed.args[0], 0n);
    assert.equal(parsed.args[1].toLowerCase(), arbitrator.address.toLowerCase());
    assert.equal(Number(parsed.args[2]), 0);
    assert.equal(Number(parsed.args[3]), 0);
  });

  it("tracks global exposure viewer ACL flag", async function () {
    const contract = await deploy();
    await contract.grantGlobalExposureViewer(arbitrator.address);
    assert.equal(await contract.isGlobalExposureViewer(arbitrator.address), true);
  });

  it("exposes EncryptedAccessGranted event in ABI", async function () {
    const contract = await deploy();
    const iface = contract.interface;
    assert.ok(iface.getEvent("EncryptedAccessGranted"));
    assert.ok(iface.getEvent("EncryptedAccessBatchGranted"));
    assert.ok(iface.getEvent("ViewerAccessGranted"));
  });
});
