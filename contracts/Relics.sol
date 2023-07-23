// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interface/IRelationshipRegistry.sol";

contract Relics is ERC721, ERC721URIStorage {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIdCounter;
  IRelationshipRegistry public relationshipRegistry;

  constructor() ERC721("Relics", "RSB") {}

  modifier onlyRelationship() {
    require(address(relationshipRegistry) != address(0), "Relationship registry not set");
    require(relationshipRegistry.isRelationship(msg.sender), "Only relationship");
    _;
  }

  function setRelationshipRegistry(IRelationshipRegistry _relationshipRegistry) public onlyRelationship {
    relationshipRegistry = _relationshipRegistry;
  }

  function mintRelic(string memory uri) public onlyRelationship {
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(msg.sender, tokenId);
    _setTokenURI(tokenId, uri);
  }

  function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
    super._burn(tokenId);
  }

  function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  function supportsInterface(bytes4 interfaceId) public view override(ERC721) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
