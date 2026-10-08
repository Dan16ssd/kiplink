const fs = require("fs");
const path = require("path");
const { ethers, network } = require("hardhat");

// Deploys MockUSDT + RemittanceEscrow and writes addresses to deployments/<network>.json.
// OFFRAMP_ADDRESS (env) is the payout address; falls back to the second signer on a local node.
async function main() {
  const [deployer, second] = await ethers.getSigners();
  const offRamp = process.env.OFFRAMP_ADDRESS || (second && second.address);
  if (!offRamp) throw new Error("Set OFFRAMP_ADDRESS");

  const token = await ethers.deployContract("MockUSDT");
  await token.waitForDeployment();
  const escrow = await ethers.deployContract("RemittanceEscrow", [token.target, offRamp]);
  await escrow.waitForDeployment();

  const out = { network: network.name, deployer: deployer.address, offRamp, token: token.target, escrow: escrow.target };
  const dir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${network.name}.json`), JSON.stringify(out, null, 2));
  console.log(out);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
