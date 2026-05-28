/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Deploy to Ethereum Sepolia
   
   Usage:
     DEPLOYER_PRIVATE_KEY=0x... SEPOLIA_RPC_URL=https://... node scripts/deploy.cjs
   
   The deployer address is used as the initial trustedOracle and privaraRouter
   so the contract is fully self-contained on testnet.
   ═══════════════════════════════════════════════════════════ */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";

  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY env var required");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deployer:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  // Load artifact compiled by Hardhat
  const artifactPath = path.resolve(
    __dirname,
    "../artifacts/contracts/UmbraInsurance.sol/UmbraInsurance.json"
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      "Artifact not found. Run: npx hardhat compile --config hardhat.config.cjs"
    );
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  console.log("Deploying UmbraInsurance...");

  // Use deployer as initial oracle + router (update after deployment)
  const contract = await factory.deploy(wallet.address, wallet.address);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const receipt = await provider.getTransactionReceipt(contract.deploymentTransaction().hash);

  console.log("\n✓ UmbraInsurance deployed!");
  console.log("  Address:    ", address);
  console.log("  Tx hash:    ", contract.deploymentTransaction().hash);
  console.log("  Block:      ", receipt?.blockNumber);
  console.log("  Gas used:   ", receipt?.gasUsed?.toString());
  console.log("\n  Explorer: https://sepolia.etherscan.io/address/" + address);

  // Write deployment info
  const deploymentInfo = {
    network: "sepolia",
    chainId: 11155111,
    contractAddress: address,
    contractVersion: "V5",
    deployer: wallet.address,
    trustedOracle: wallet.address,
    privaraRouter: wallet.address,
    txHash: contract.deploymentTransaction().hash,
    blockNumber: receipt?.blockNumber,
    timestamp: new Date().toISOString(),
  };

  const outPath = path.resolve(__dirname, "../deployment.json");
  fs.writeFileSync(outPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n  Saved to deployment.json");
  console.log('\n  Add to .env.local:\n  NEXT_PUBLIC_UMBRA_CONTRACT=' + address + '\n  NEXT_PUBLIC_UMBRA_V2=true\n  NEXT_PUBLIC_UMBRA_V3=true\n  NEXT_PUBLIC_UMBRA_V4=true\n  NEXT_PUBLIC_UMBRA_V5=true\n  NEXT_PUBLIC_UMBRA_VERSION=V5');
  console.log('\n  Deployer is trustedOracle — use this wallet to resolve policies.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
