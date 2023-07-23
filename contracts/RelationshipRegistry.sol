pragma solidity ^0.8.17;

import "./interface/IERC6551Account.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import {ByteHasher} from "./helpers/ByteHasher.sol";
import "@sismo-core/sismo-connect-solidity/contracts/libs/SismoLib.sol";

contract RelationshipRegistry is SismoConnect {
  using ByteHasher for bytes;
  using SismoConnectHelper for SismoConnectVerifiedResult;
  mapping(address => bool) public registry;

  struct CreateRelationshipParams {
    address[2] parents;
    bytes[2] signatures;
    // bytes[2] zkProofs;
    // bytes16[2] groupIds;
    bytes32 dataHash;
    uint256 salt;
    bytes initData;
  }

  event RelationshipCreated(address indexed relationship, address indexed parent1, address indexed parent2);
  error InitializationFailed();
  // add your appId
  bytes16 private _appId = 0xb14aa2b855beee446a9685f4a38e612e;
  // use impersonated mode for testing
  bool private _isImpersonationMode = true;
  address public relationshipImplementation;

  constructor(address _relationshipImplementation) SismoConnect(buildConfig(_appId, _isImpersonationMode)) {
    relationshipImplementation = _relationshipImplementation;
  }

  function createRelationship(CreateRelationshipParams memory params) public returns (address) {
    checkSignatures(params.signatures, params.dataHash, params.parents);
    // validatezkProofs(params.zkProofs, params.groupIds, params.parents);
    return createRelationship(params.parents[0], params.parents[1], params.salt, params.initData);
  }

  function isRelationship(address relationship) public view returns (bool) {
    return registry[relationship];
  }

  function createRelationship(
    address parent1,
    address parent2,
    uint256 salt,
    bytes memory initData
  ) internal returns (address) {
    bytes memory code = _creationCode(relationshipImplementation, parent1, parent2, salt);
    address _relationship = Create2.computeAddress(bytes32(salt), keccak256(code));

    if (_relationship.code.length != 0) return _relationship;

    _relationship = Create2.deploy(0, bytes32(salt), code);

    if (initData.length != 0) {
      (bool success, ) = _relationship.call(initData);
      if (!success) revert InitializationFailed();
    }
    registry[_relationship] = true;

    emit RelationshipCreated(_relationship, parent1, parent2);

    return _relationship;
  }

  function _creationCode(
    address implementation_,
    address parent1,
    address parent2,
    uint256 salt_
  ) internal pure returns (bytes memory) {
    return
      abi.encodePacked(
        hex"3d60ad80600a3d3981f3363d3d373d3d3d363d73",
        implementation_,
        hex"5af43d82803e903d91602b57fd5bf3",
        abi.encode(salt_, parent1, parent2)
      );
  }

  function validatezkProofs(bytes[2] memory zkProofs, bytes16[2] memory groupIds, address[2] memory parents) internal {
    for (uint256 i = 0; i < 2; i++) {
      require(validatezkProof(zkProofs[i], groupIds[i], parents[i]), "Invalid zkProof");
    }
  }

  function validatezkProof(bytes memory zkProof, bytes16 groupId, address parent) internal returns (bool) {
    verify({responseBytes: zkProof, claim: buildClaim(groupId), auth: buildAuth({authType: AuthType.VAULT})});
    return true;
  }

  function checkSignatures(bytes[2] memory signatures, bytes32 dataHash, address[2] memory parents) internal view {
    for (uint256 i = 0; i < 2; i++) {
      require(checkSignature(signatures[i], dataHash, parents[i]), "Invalid signature");
    }
  }

  function owner(address account) public view returns (address) {
    return IERC6551Account(payable(account)).owner();
  }

  function checkSignature(bytes memory signature, bytes32 dataHash, address parent) internal view returns (bool) {
    bool result = _recoverSigner(_getEthSignedMessageHash(dataHash), signature) ==
      IERC6551Account(payable(parent)).owner();
    return result;
  }

  function _recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) internal pure returns (address) {
    (bytes32 r, bytes32 s, uint8 v) = _splitSignature(_signature);

    return ecrecover(_ethSignedMessageHash, v, r, s);
  }

  function _getEthSignedMessageHash(bytes32 _messageHash) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
  }

  function _splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
    require(sig.length == 65, "invalid signature length");

    assembly {
      r := mload(add(sig, 32))
      s := mload(add(sig, 64))
      v := byte(0, mload(add(sig, 96)))
    }
  }
}
