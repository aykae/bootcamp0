// contracts/PennFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PennFT is ERC721URIStorage, Ownable {
	uint256 numTokens = 0;

	constructor() ERC721("PennFT", "PFT") {}
    
	function MintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
    		_mint(recipient, numTokens);
    		_setTokenURI(numTokens, tokenURI);
    		numTokens++;

    		return numTokens;
	}
}