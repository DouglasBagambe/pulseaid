// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PulseAidEscrowHelper is Ownable, ReentrancyGuard {
    mapping(uint256 => mapping(address => uint256)) public contributions;
    mapping(uint256 => address[]) private donors; // Off-chain indexable
    
    event ContributionRecorded(uint256 indexed campaignId, address donor, uint256 amount);
    event RefundClaimed(uint256 indexed campaignId, address donor, uint256 amount);
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    function recordContribution(uint256 campaignId, address donor, uint256 amount) external onlyOwner {
        contributions[campaignId][donor] += amount;
        donors[campaignId].push(donor);
        emit ContributionRecorded(campaignId, donor, amount);
    }
    
    function processRefunds(uint256 campaignId) external onlyOwner {
        for (uint i = 0; i < donors[campaignId].length; i++) {
            address donor = donors[campaignId][i];
            uint256 amount = contributions[campaignId][donor];
            if (amount > 0) {
                contributions[campaignId][donor] = 0;
                payable(donor).transfer(amount);
                emit RefundClaimed(campaignId, donor, amount);
            }
        }
        delete donors[campaignId];
    }
    
    function withdrawRefund(uint256 campaignId) external nonReentrant {
        uint256 amount = contributions[campaignId][msg.sender];
        require(amount > 0, "No refund available");
        contributions[campaignId][msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit RefundClaimed(campaignId, msg.sender, amount);
    }
}