pragma solidity ^0.8.9;

import "@hyperlane-xyz/core/contracts/interfaces/middleware/IInterchainQueryRouter.sol";
import "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";
import "@hyperlane-xyz/core/contracts/interfaces/IInterchainGasPaymaster.sol";

contract TestingHyperlane {
  struct Receiver {
    bytes32 destinationReceiverAddress;
    uint relayerGas;
    bool isExists;
  }

  address public contractDeployer;
  IMailbox public constant mailbox = IMailbox(0xCC737a94FecaeC165AbCf12dED095BB13F037685);
  IInterchainGasPaymaster public constant igp = IInterchainGasPaymaster(0xF90cB82a76492614D07B82a7658917f3aC811Ac1);
  IInterchainQueryRouter public constant iqsRouter = IInterchainQueryRouter(0xD786eC480Da58792175c9DDEdD99802Badf1037E);

  mapping(uint32 => Receiver) public chains;

  constructor() {
    contractDeployer = msg.sender;
  }

  function addChain(uint32 destinationDomain, address destinationReceiver, uint relayerGas) public {
    require(msg.sender == contractDeployer, "Invalid");
    chains[destinationDomain] = Receiver(addressToBytes32(destinationReceiver), relayerGas, true);
  }

  function getQuotedPayment(uint32 destinationDomain) public view returns (uint256) {
    uint256 quotedPayment = igp.quoteGasPayment(destinationDomain, 200000);
    return quotedPayment;
  }

  function readNounsNFTOwner(uint256 tokenId, uint32 destinationDomain, address tokenAddress) public payable {
    bytes32 dispatchId = iqsRouter.query(
      destinationDomain,
      tokenAddress,
      abi.encodeWithSignature("ownerOf(uint256)", tokenId),
      abi.encodePacked(this.writeOwner.selector)
    );

    uint256 quotedPayment = getQuotedPayment(destinationDomain);
    igp.payForGas{value: quotedPayment}(dispatchId, destinationDomain, 200000, msg.sender);
  }

  address public latestOwner;

  function writeOwner(address _owner) public {
    latestOwner = _owner;
  }

  function getWriteOwnerSelector() public pure returns (bytes4) {
    return bytes4(keccak256("writeOwner(string,address)"));
  }

  function addressToBytes32(address _addr) internal pure returns (bytes32) {
    return bytes32(uint256(uint160(_addr)));
  }
}
