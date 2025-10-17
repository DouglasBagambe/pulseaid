const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PulseAidCampaign", function () {
  let campaign, badge, escrow, owner, donor, beneficiary;

  beforeEach(async () => {
    [owner, donor, beneficiary] = await ethers.getSigners();
    
    const EscrowHelper = await ethers.getContractFactory("PulseAidEscrowHelper");
    escrow = await EscrowHelper.deploy();
    
    const Badge = await ethers.getContractFactory("PulseAidBadge");
    badge = await Badge.deploy();
    
    const Campaign = await ethers.getContractFactory("PulseAidCampaign");
    campaign = await Campaign.deploy(badge.address, escrow.address);
    await campaign.transferOwnership(owner.address);
  });

  it("Should create a campaign", async function () {
    await campaign.connect(beneficiary).createCampaign("ipfs://QmTest", 1000, 0, Math.floor(Date.now() / 1000) + 86400); // Kindness mode
    const camp = await campaign.campaigns(1);
    expect(camp.beneficiary).to.equal(beneficiary.address);
  });

  it("Should handle donation and release", async function () {
    await campaign.connect(beneficiary).createCampaign("ipfs://QmTest", 1000, 0, Math.floor(Date.now() / 1000) + 86400);
    await campaign.connect(donor).donate(1, { value: 500 });
    const camp = await campaign.campaigns(1);
    expect(camp.raised).to.equal(500);
    
    await campaign.connect(owner).approveCampaign(1);
    // Check beneficiary balance increased (simplified; use balance checks in full test)
  });

  // Add more tests for refund, badge mint, etc.
});