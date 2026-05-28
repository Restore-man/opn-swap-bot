// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyNFT {
    string public name = "My First NFT";
    string public symbol = "MNFT";

    mapping(uint256 => address) public ownerOf;
    mapping(uint256 => string) public tokenText;
    uint256 public totalSupply;

    event Transfer(address indexed from, address indexed to, uint256 tokenId);

    function mint(string memory text) public returns (uint256) {
        totalSupply++;
        uint256 tokenId = totalSupply;
        ownerOf[tokenId] = msg.sender;
        tokenText[tokenId] = text;
        emit Transfer(address(0), msg.sender, tokenId);
        return tokenId;
    }
}
