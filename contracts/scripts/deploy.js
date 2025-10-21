require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    
    if (!deployer) {
      throw new Error("No deployer account found. Check your DEPLOYER_PRIVATE_KEY in .env");
    }
    
    console.log("Deploying from:", deployer.address);

    const EscrowHelper = await ethers.getContractFactory("PulseAidEscrowHelper");
    const escrow = await EscrowHelper.deploy(deployer.address);
    await escrow.waitForDeployment();
    const escrowAddress = await escrow.getAddress();
    console.log("EscrowHelper deployed to:", escrowAddress);

    const Badge = await ethers.getContractFactory("PulseAidBadge");
    const badge = await Badge.deploy(deployer.address);
    await badge.waitForDeployment();
    const badgeAddress = await badge.getAddress();
    console.log("Badge deployed to:", badgeAddress);

    const Campaign = await ethers.getContractFactory("PulseAidCampaign");
    const campaign = await Campaign.deploy(badgeAddress, escrowAddress, deployer.address);
    await campaign.waitForDeployment();
    const campaignAddress = await campaign.getAddress();
    console.log("Campaign deployed to:", campaignAddress);

    // Transfer EscrowHelper ownership to Campaign contract
    console.log("\nTransferring EscrowHelper ownership to Campaign contract...");
    const transferTx = await escrow.transferOwnership(campaignAddress);
    await transferTx.wait();
    console.log("✅ EscrowHelper ownership transferred to Campaign");

    console.log("\n✅ Deployment successful!");
    console.log("Escrow:", escrowAddress);
    console.log("Badge:", badgeAddress);
    console.log("Campaign:", campaignAddress);
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exitCode = 1;
  }
}

main();