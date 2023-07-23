// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;

import "../interface/IERC6551Account.sol";

/// @title OwnerManager - Manages a set of owners and a threshold to perform actions.
/// @author Stefan George - <stefan@gnosis.pm>
/// @author Richard Meissner - <richard@gnosis.pm>
contract CustomOwnerManager {
  event ChangedThreshold(uint256 threshold);

  address internal constant SENTINEL_OWNERS = address(0x1);

  uint256 internal threshold;

  address[2] public owners;

  /// @dev Setup function sets initial storage of contract.
  /// @param _threshold Number of required confirmations for a Safe transaction.
  function setupOwners(address[2] memory _owners, uint256 _threshold) internal {
    require(threshold == 0, "GS200");
    require(_threshold <= _owners.length, "GS201");
    require(_threshold >= 1, "GS202");
    owners = _owners;
    threshold = _threshold;
  }

  function changeThreshold(uint256 _threshold) public {
    require(isSigner(msg.sender), "GS300");
    // There has to be at least one Safe owner.
    require(_threshold >= 1, "GS202");
    threshold = _threshold;
    emit ChangedThreshold(threshold);
  }

  function getThreshold() public view returns (uint256) {
    return threshold;
  }

  function isSigner(address signer, address owner) public view returns (bool) {
    return IERC6551Account(payable(owner)).owner() == signer;
  }

  function isSigner(address signer) public view returns (bool) {
    return
      IERC6551Account(payable(owners[0])).owner() == signer || IERC6551Account(payable(owners[1])).owner() == signer;
  }

  /// @dev Returns array of owners.
  /// @return Array of Safe owners.
  function getOwners() public view returns (address[2] memory) {
    return owners;
  }
}
