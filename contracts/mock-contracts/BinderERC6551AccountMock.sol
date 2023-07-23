pragma solidity ^0.8.13;

import "../interface/IERC6551Account.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "../utils/Bytecode.sol";
import "@sismo-core/sismo-connect-solidity/contracts/libs/SismoLib.sol";
import {ByteHasher} from "../utils/ByteHasher.sol";
import {IWorldID} from "../interface/IWorldID.sol";

contract BinderERC6551AccountMock is IERC165, IERC1271, IERC6551Account, SismoConnect {
  using SismoConnectHelper for SismoConnectVerifiedResult;
  using ByteHasher for bytes;

  uint256 private _nonce;

  receive() external payable {}

  // add your appId
  bytes16 private _appId = 0xb14aa2b855beee446a9685f4a38e612e;
  // use impersonated mode for testing
  bool private _isImpersonationMode = true;
  mapping(bytes16 => bool) public verifiedGroupIds;
  mapping(bytes16 => bool) public groupIdPreferences;

  event ZkProofsVerified(bytes16[] newGroupIds);

  event ZkPreferencesAdded(bytes16[] newPreferences);
  event WorldCoinVerified();

  function nonce() external view returns (uint256) {
    require(msg.sender == owner(), "Not token owner");
    return _nonce;
  }

  function initialize(
    bytes16[] memory zkProofgroupIds,
    bytes16[] memory zkPreferences,
    bytes memory zkProof,
    address signal,
    uint256 root,
    uint256 nullifierHash,
    uint256[8] memory worldCoinProof
  ) public {
    emit ZkPreferencesAdded(zkPreferences);
    emit ZkProofsVerified(zkProofgroupIds);
    emit WorldCoinVerified();
  }

  constructor() SismoConnect(buildConfig(_appId, _isImpersonationMode)) {}

  function _getClaimRequests(bytes16[] memory groupIds) internal view returns (ClaimRequest[] memory) {
    ClaimRequest[] memory requests = new ClaimRequest[](groupIds.length);
    for (uint i = 0; i < groupIds.length; i++) {
      requests[i] = buildClaim(groupIds[i]);
    }
    return requests;
  }

  function verifyzkProofs(bytes memory response, bytes16[] memory groupIds) public {
    emit ZkProofsVerified(groupIds);
  }

  function addzkPreferences(bytes16[] memory groupIds) public {
    for (uint i = 0; i < groupIds.length; i++) {
      groupIdPreferences[groupIds[i]] = true;
    }
    emit ZkPreferencesAdded(groupIds);
  }

  function executeCall(address to, uint256 value, bytes calldata data) external payable returns (bytes memory result) {
    require(msg.sender == owner(), "Not token owner");

    bool success;
    (success, result) = to.call{value: value}(data);

    if (!success) {
      assembly {
        revert(add(result, 32), mload(result))
      }
    }
  }

  function token() external view returns (uint256 chainId, address tokenContract, uint256 tokenId) {
    uint256 length = address(this).code.length;
    return abi.decode(Bytecode.codeAt(address(this), length - 0x60, length), (uint256, address, uint256));
  }

  function owner() public view returns (address) {
    (uint256 chainId, address tokenContract, uint256 tokenId) = this.token();
    if (chainId != block.chainid) return address(0);

    return IERC721(tokenContract).ownerOf(tokenId);
  }

  function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
    return (interfaceId == type(IERC165).interfaceId || interfaceId == type(IERC6551Account).interfaceId);
  }

  function isValidSignature(bytes32 hash, bytes memory signature) external view returns (bytes4 magicValue) {
    bool isValid = SignatureChecker.isValidSignatureNow(owner(), hash, signature);

    if (isValid) {
      return IERC1271.isValidSignature.selector;
    }

    return "";
  }
}
