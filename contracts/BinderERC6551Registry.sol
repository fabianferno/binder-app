pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Create2.sol";
import "./interface/IERC6551Registry.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@hyperlane-xyz/core/contracts/interfaces/middleware/IInterchainQueryRouter.sol";
import "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";
import "@hyperlane-xyz/core/contracts/interfaces/IInterchainGasPaymaster.sol";

contract BinderERC6551Registry is IERC6551Registry {
  struct CreateAccountData {
    address caller;
    uint256 chainId;
    address tokenContract;
    uint256 tokenId;
    uint256 salt;
    bytes initData;
  }
  error InitializationFailed();
  address immutable i_implementation;
  mapping(address => CreateAccountData) public crossChainRegistry;

  IMailbox public constant mailbox = IMailbox(0xCC737a94FecaeC165AbCf12dED095BB13F037685);
  IInterchainGasPaymaster public constant igp = IInterchainGasPaymaster(0xF90cB82a76492614D07B82a7658917f3aC811Ac1);
  IInterchainQueryRouter public constant iqsRouter = IInterchainQueryRouter(0xD786eC480Da58792175c9DDEdD99802Badf1037E);

  constructor(address implementation) {
    i_implementation = implementation;
  }

  function createAccount(
    address implementation,
    uint256 chainId,
    address tokenContract,
    uint256 tokenId,
    uint256 salt,
    bytes memory initData
  ) external payable returns (address) {
    require(implementation == i_implementation, "Invalid implementation");

    if (chainId == 80001) {
      require(msg.sender == IERC721(tokenContract).ownerOf(tokenId), "Invalid owner");
      _createAccount(implementation, chainId, tokenContract, tokenId, salt, initData);
    } else {
      address accountAddress = _account(implementation, chainId, tokenContract, tokenId, salt);
      bytes32 dispatchId = iqsRouter.query(
        uint32(chainId),
        tokenContract,
        abi.encodeWithSignature("ownerOf(uint256)", tokenId),
        abi.encodePacked(this.createAccountFallback.selector, accountAddress)
      );
      crossChainRegistry[accountAddress] = CreateAccountData(
        msg.sender,
        chainId,
        tokenContract,
        tokenId,
        salt,
        initData
      );
      uint256 quotedPayment = getQuotedPayment(uint32(chainId));
      igp.payForGas{value: quotedPayment}(dispatchId, uint32(chainId), 200000, msg.sender);
    }
  }

  function createAccountFallback(address accountAddress, address nftOwner) public {
    require(msg.sender == address(iqsRouter), "only router");
    CreateAccountData memory data = crossChainRegistry[accountAddress];
    if (nftOwner != data.caller) {
      emit AccountCreationFailed(
        accountAddress,
        data.caller,
        data.chainId,
        data.tokenContract,
        data.tokenId,
        data.salt
      );
    } else {
      _createAccount(i_implementation, data.chainId, data.tokenContract, data.tokenId, data.salt, data.initData);
      emit AccountCreated(accountAddress, i_implementation, data.chainId, data.tokenContract, data.tokenId, data.salt);
    }
  }

  function _createAccount(
    address implementation,
    uint256 chainId,
    address tokenContract,
    uint256 tokenId,
    uint256 salt,
    bytes memory initData
  ) internal returns (address) {
    bytes memory code = _creationCode(implementation, chainId, tokenContract, tokenId, salt);
    address account_ = Create2.computeAddress(bytes32(salt), keccak256(code));

    if (account_.code.length != 0) return account_;

    account_ = Create2.deploy(0, bytes32(salt), code);

    if (initData.length != 0) {
      (bool success, ) = account_.call(initData);
      if (!success) revert InitializationFailed();
    }
    emit AccountCreated(account_, implementation, chainId, tokenContract, tokenId, salt);
    return account_;
  }

  function getQuotedPayment(uint32 destinationDomain) public view returns (uint256) {
    uint256 quotedPayment = igp.quoteGasPayment(destinationDomain, 200000);
    return quotedPayment;
  }

  function account(
    address implementation,
    uint256 chainId,
    address tokenContract,
    uint256 tokenId,
    uint256 salt
  ) external view returns (address) {
    bytes32 bytecodeHash = keccak256(_creationCode(implementation, chainId, tokenContract, tokenId, salt));

    return Create2.computeAddress(bytes32(salt), bytecodeHash);
  }

  function _account(
    address implementation,
    uint256 chainId,
    address tokenContract,
    uint256 tokenId,
    uint256 salt
  ) internal view returns (address) {
    bytes32 bytecodeHash = keccak256(_creationCode(implementation, chainId, tokenContract, tokenId, salt));

    return Create2.computeAddress(bytes32(salt), bytecodeHash);
  }

  function _creationCode(
    address implementation_,
    uint256 chainId_,
    address tokenContract_,
    uint256 tokenId_,
    uint256 salt_
  ) internal pure returns (bytes memory) {
    return
      abi.encodePacked(
        hex"3d60ad80600a3d3981f3363d3d373d3d3d363d73",
        implementation_,
        hex"5af43d82803e903d91602b57fd5bf3",
        abi.encode(salt_, chainId_, tokenContract_, tokenId_)
      );
  }
}
