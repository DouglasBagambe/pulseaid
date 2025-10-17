// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PulseAidBadge is ERC721, Ownable {
    uint256 public tokenCount;

    constructor() ERC721("PulseAidBadge", "PULSEBADGE") {}

    function mintBadge(address to) external onlyOwner returns (uint256) {
        tokenCount++;
        _safeMint(to, tokenCount);
        return tokenCount;
    }
}


