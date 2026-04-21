const assert = require("node:assert/strict");
const { ethers } = require("hardhat");

describe("UmbraInsurance V4", function () {
  it("deploys with owner, oracle, and router roles", async function () {
    const [owner, oracle, router] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("UmbraInsurance");
    const contract = await Factory.deploy(oracle.address, router.address);
    await contract.waitForDeployment();

    assert.equal(await contract.owner(), owner.address);
    assert.equal(await contract.trustedOracle(), oracle.address);
    assert.equal(await contract.privaraRouter(), router.address);
    assert.equal(await contract.getPolicyCount(), 0n);
  });

  it("exposes holder policy indexing getters", async function () {
    const [, oracle, router, holder] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("UmbraInsurance");
    const contract = await Factory.deploy(oracle.address, router.address);
    await contract.waitForDeployment();

    assert.equal(await contract.getHolderPolicyCount(holder.address), 0n);
  });

  it("allows owner to pause and unpause", async function () {
    const [, oracle, router] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("UmbraInsurance");
    const contract = await Factory.deploy(oracle.address, router.address);
    await contract.waitForDeployment();

    await contract.setPaused(true);
    assert.equal(await contract.paused(), true);
    await contract.setPaused(false);
    assert.equal(await contract.paused(), false);
  });
});
