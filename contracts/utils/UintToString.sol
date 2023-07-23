// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library UintToString {
  function uint256ToString(uint256 value) internal pure returns (string memory) {
    if (value == 0) {
      return "0";
    }

    uint256 tempValue = value;
    uint256 digits;

    while (tempValue != 0) {
      digits++;
      tempValue /= 10;
    }

    bytes memory buffer = new bytes(digits);
    while (value != 0) {
      digits -= 1;
      buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
      value /= 10;
    }

    return string(buffer);
  }
}
