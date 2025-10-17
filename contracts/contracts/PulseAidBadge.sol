// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PulseAidBadge is ERC721, Ownable {
    uint256 public tokenCount;
    string private _baseTokenURI;

    // tokenId => campaignId
    mapping(uint256 => uint256) public campaignIds;
    // tokenId => badge type (0: Kindness, 1: Escrow Hero)
    mapping(uint256 => uint8) public badgeTypes;

    constructor(address initialOwner) ERC721("PulseAidBadge", "PAB") Ownable(initialOwner) {
        _baseTokenURI = "ipfs://Qm.../metadata/"; // Replace with real IPFS base later
    }

    function setBaseURI(string calldata newBase) external onlyOwner {
        _baseTokenURI = newBase;
    }

    function mintBadge(
        address to,
        uint256 campaignId,
        uint8 badgeType
    ) external onlyOwner returns (uint256) {
        require(badgeType < 2, "Invalid badge type");
        tokenCount += 1;
        uint256 tokenId = tokenCount;
        _safeMint(to, tokenId);
        campaignIds[tokenId] = campaignId;
        badgeTypes[tokenId] = badgeType;
        return tokenId;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}