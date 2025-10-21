// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./PulseAidBadge.sol";
import "./PulseAidEscrowHelper.sol";

contract PulseAidCampaign is Ownable, ReentrancyGuard {
    enum Mode { KINDNESS, ESCROW }
    
    struct Campaign {
        address payable beneficiary;
        string ipfsMetadata; // IPFS CID for story/proof
        uint256 goal;
        uint256 raised;
        uint256 deadline; // Unix timestamp
        Mode mode;
        bool active;
        bool approved; // ✅ NEW: Track if admin approved this campaign
    }
    
    mapping(uint256 => Campaign) public campaigns;
    uint256 public campaignCount;
    
    PulseAidBadge public badgeContract;
    PulseAidEscrowHelper public escrowHelper;
    
    event CampaignCreated(uint256 indexed id, address beneficiary, uint256 goal, Mode mode);
    event CampaignApproved(uint256 indexed id); // ✅ NEW EVENT
    event Donated(uint256 indexed id, address donor, uint256 amount);
    event FundsReleased(uint256 indexed id, uint256 amount);
    event Refunded(uint256 indexed id, address donor, uint256 amount);
    event ProofSubmitted(uint256 indexed id, string proofCid);
    event BadgeMinted(address to, uint256 tokenId, uint256 campaignId, uint8 badgeType);
    
    constructor(address _badgeAddress, address _escrowAddress, address initialOwner) Ownable(initialOwner) {
        badgeContract = PulseAidBadge(_badgeAddress);
        escrowHelper = PulseAidEscrowHelper(_escrowAddress);
    }
    
    function createCampaign(
        string calldata ipfsMetadata,
        uint256 goal,
        Mode mode,
        uint256 deadline
    ) external {
        require(deadline > block.timestamp, "Deadline must be in future");
        campaignCount++;
        campaigns[campaignCount] = Campaign({
            beneficiary: payable(msg.sender),
            ipfsMetadata: ipfsMetadata,
            goal: goal,
            raised: 0,
            deadline: deadline,
            mode: mode,
            active: false,  // ✅ Starts inactive until approved
            approved: false // ✅ Starts unapproved
        });
        emit CampaignCreated(campaignCount, msg.sender, goal, mode);
    }
    
    // ✅ NEW: Separate function to approve campaigns for donations
    function approveCampaign(uint256 id) external onlyOwner {
        Campaign storage camp = campaigns[id];
        require(!camp.approved, "Already approved");
        require(block.timestamp < camp.deadline, "Campaign expired");
        
        camp.approved = true;
        camp.active = true; // ✅ Now ready to accept donations
        
        emit CampaignApproved(id);
    }
    
    function donate(uint256 id) external payable nonReentrant {
        Campaign storage camp = campaigns[id];
        require(camp.active, "Campaign inactive");
        require(camp.approved, "Campaign not approved yet"); // ✅ Must be approved
        require(block.timestamp < camp.deadline, "Campaign expired");
        require(msg.value > 0, "Donation must be > 0");
        
        camp.raised += msg.value;
        escrowHelper.recordContribution(id, msg.sender, msg.value);
        emit Donated(id, msg.sender, msg.value);
    }
    
    function submitProof(uint256 id, string calldata proofCid) external {
        Campaign storage camp = campaigns[id];
        require(msg.sender == camp.beneficiary, "Only beneficiary can submit proof");
        emit ProofSubmitted(id, proofCid);
    }
    
    // ✅ RENAMED: This finalizes campaigns after deadline
    function finalizeCampaign(uint256 id) external onlyOwner {
        Campaign storage camp = campaigns[id];
        require(camp.approved, "Campaign not approved");
        require(camp.active, "Campaign inactive");
        require(block.timestamp >= camp.deadline, "Campaign not ended yet");
        
        if (camp.mode == Mode.ESCROW && camp.raised < camp.goal) {
            _triggerRefunds(id);
        } else {
            _releaseFunds(id);
        }
    }
    
    function _releaseFunds(uint256 id) internal {
        Campaign storage camp = campaigns[id];
        uint256 amount = camp.raised;
        camp.raised = 0;
        camp.active = false;
        camp.beneficiary.transfer(amount);
        emit FundsReleased(id, amount);
    }
    
    function _triggerRefunds(uint256 id) internal {
        escrowHelper.processRefunds(id);
        campaigns[id].active = false;
    }
    
    function mintBadgeForDonor(address donor, uint256 campaignId, uint8 badgeType) external onlyOwner {
        uint256 tokenId = badgeContract.mintBadge(donor, campaignId, badgeType);
        emit BadgeMinted(donor, tokenId, campaignId, badgeType);
    }
    
    receive() external payable {}
}