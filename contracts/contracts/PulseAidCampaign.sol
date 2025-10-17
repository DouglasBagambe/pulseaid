// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PulseAidCampaign is Ownable {
    enum Mode {
        KINDNESS,
        ESCROW
    }

    struct Campaign {
        address payable owner;
        string ipfsProof; // pointer to metadata/proof in IPFS
        uint256 goal;
        uint256 raised;
        bool active;
        Mode mode;
        uint256 deadline;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public campaignCount;

    event CampaignCreated(uint256 id, address owner, uint256 goal, Mode mode);
    event Donated(uint256 id, address donor, uint256 amount);
    event FundsReleased(uint256 id, uint256 amount);
    event Refunded(uint256 id, uint256 amount);

    function createCampaign(
        string calldata ipfsProof,
        uint256 goal,
        Mode mode,
        uint256 deadline
    ) external {
        campaignCount++;
        campaigns[campaignCount] = Campaign(payable(msg.sender), ipfsProof, goal, 0, true, mode, deadline);
        emit CampaignCreated(campaignCount, msg.sender, goal, mode);
    }

    function donate(uint256 id) external payable {
        require(campaigns[id].active, "inactive");
        campaigns[id].raised += msg.value;
        emit Donated(id, msg.sender, msg.value);
    }

    // release must be called by contract owner (admin) after proof approval OR automatically for KINDNESS
    function releaseFunds(uint256 id) external onlyOwner {
        Campaign storage c = campaigns[id];
        uint256 amount = c.raised;
        c.raised = 0;
        c.active = false;
        c.owner.transfer(amount);
        emit FundsReleased(id, amount);
    }

    function refund(uint256 id, address payable recipient) external onlyOwner {
        // simple refund for demo (real implementation loops donors or uses escrow mapping)
        uint256 amount = campaigns[id].raised;
        campaigns[id].raised = 0;
        campaigns[id].active = false;
        recipient.transfer(amount);
        emit Refunded(id, amount);
    }

    receive() external payable {}
}


