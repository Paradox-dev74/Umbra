const fs = require("fs");
const path = require("path");

const artifactPath = path.resolve(
  __dirname,
  "../artifacts/contracts/UmbraInsurance.sol/UmbraInsurance.json"
);
const outPath = path.resolve(__dirname, "../lib/abi.ts");

if (!fs.existsSync(artifactPath)) {
  throw new Error("Artifact not found. Run: npx hardhat compile --config hardhat.config.cjs");
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const content =
  "/* UmbraInsurance ABI from artifact */\n" +
  "export const UMBRA_ABI = " +
  JSON.stringify(artifact.abi, null, 2) +
  " as const;\n";

fs.writeFileSync(outPath, content);
console.log("Exported", artifact.abi.length, "ABI items to lib/abi.ts");
