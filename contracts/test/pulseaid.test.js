const { expect } = require("chai");

describe("PulseAid Contracts", function () {
  let badge, campaign, owner, donor;

  beforeEach(async function () {
    [owner, donor] = await ethers.getSigners();

    const Badge = await ethers.getContractFactory("PulseAidBadge");
    badge = await Badge.deploy();
    await badge.deployed();

    const Campaign = await ethers.getContractFactory("PulseAidCampaign");
    campaign = await Campaign.deploy();
    await campaign.deployed();
  });

  it("creates campaign and accepts donations", async function () {
    await campaign.createCampaign(
      "ipfs://cid123",
      1000,
      1,
      Math.floor(Date.now() / 1000) + 3600
    );
    await expect(
      campaign.connect(donor).donate(1, { value: ethers.utils.parseEther("1") })
    ).to.emit(campaign, "Donated");
  });

  it("releases funds by owner", async function () {
    await campaign.createCampaign(
      "ipfs://cid123",
      1000,
      1,
      Math.floor(Date.now() / 1000) + 3600
    );
    await campaign
      .connect(donor)
      .donate(1, { value: ethers.utils.parseEther("0.2") });
    await expect(campaign.releaseFunds(1)).to.emit(campaign, "FundsReleased");
  });
});
