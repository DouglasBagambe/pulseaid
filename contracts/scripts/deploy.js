async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from", deployer.address);

  const Badge = await ethers.getContractFactory("PulseAidBadge");
  const badge = await Badge.deploy();
  await badge.deployed();
  console.log("Badge deployed to:", badge.address);

  const Campaign = await ethers.getContractFactory("PulseAidCampaign");
  const camp = await Campaign.deploy();
  await camp.deployed();
  console.log("Campaign deployed to:", camp.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
