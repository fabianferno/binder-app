pragma solidity ^0.8.13;

import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import {Functions, FunctionsClient} from "../dev/functions/FunctionsClient.sol";
import "../dev/interfaces/FunctionsBillingRegistryInterface.sol";
import "../utils/Bytecode.sol";
import "../utils/UintToString.sol";
import "@gnosis.pm/safe-contracts/contracts/base/ModuleManager.sol";
import "@gnosis.pm/safe-contracts/contracts/base/FallbackManager.sol";
import "@gnosis.pm/safe-contracts/contracts/base/GuardManager.sol";
import "@gnosis.pm/safe-contracts/contracts/common/EtherPaymentFallback.sol";
import "@gnosis.pm/safe-contracts/contracts/common/Singleton.sol";
import "@gnosis.pm/safe-contracts/contracts/common/SignatureDecoder.sol";
import "@gnosis.pm/safe-contracts/contracts/common/SecuredTokenTransfer.sol";
import "@gnosis.pm/safe-contracts/contracts/common/StorageAccessible.sol";
import "@gnosis.pm/safe-contracts/contracts/interfaces/ISignatureValidator.sol";
import "@gnosis.pm/safe-contracts/contracts/external/GnosisSafeMath.sol";
import "../interface/IERC6551Account.sol";
import "../interface/IRelics.sol";
import "../interface/IAttestations.sol";
import "../utils/CustomOwnerManager.sol";

contract RelationshipMock is
  EtherPaymentFallback,
  Singleton,
  ModuleManager,
  CustomOwnerManager,
  SignatureDecoder,
  SecuredTokenTransfer,
  ISignatureValidatorConstants,
  FallbackManager,
  StorageAccessible,
  GuardManager,
  VRFConsumerBaseV2,
  FunctionsClient
{
  using Functions for Functions.Request;
  using UintToString for uint256;
  using GnosisSafeMath for uint256;
  string public constant VERSION = "1.0.0";

  struct RequestStatus {
    bool exists;
    bool fulfilled;
    uint256[] randomWords;
  }

  address public relationshipRegistry;
  LinkTokenInterface public constant LINK_TOKEN = LinkTokenInterface(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
  VRFCoordinatorV2Interface public constant COORDINATOR =
    VRFCoordinatorV2Interface(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed);
  bytes32 public constant KEY_HASH = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;
  FunctionsBillingRegistryInterface public constant FUNCTIONS_REGISTRY =
    FunctionsBillingRegistryInterface(0xEe9Bf52E5Ea228404bB54BCFbbDa8c21131b9039);
  address public constant ORACLE_ADDRESS = 0xeA6721aC65BCeD841B8ec3fc5fEdeA6141a0aDE4;
  // Relationship variables

  IRelics public relics;
  IAttestations public attestations;

  event RelicCreated(string uri);
  event AttestationCreated();

  // Chainlink VRF variables

  mapping(uint256 => RequestStatus) public s_requests;
  uint64 public s_subscriptionId;
  uint256[] public requestIds;
  uint256 public lastRequestId;
  mapping(uint256 => bool) public randomnessUsed;

  // Chainlink Functions Variables
  uint32 public constant functionsFulfillGasLimit = 300000;

  bytes32 public latestRequestId;
  bytes public latestResponse;
  bytes public latestError;

  string public source;

  // Gnosis Safe Variables
  bytes32 private constant DOMAIN_SEPARATOR_TYPEHASH =
    0x47e79534a245952e8b16893a336b85a3d9ea9fa8c573f3d803afb92a79469218;

  bytes32 private constant SAFE_TX_TYPEHASH = 0xbb8310d486368db6bd6f849402fdd73ad53d316b5a4b2644ad6efe0f941286d8;

  uint256 public nonce;
  bytes32 private _deprecatedDomainSeparator;
  mapping(bytes32 => uint256) public signedMessages;
  mapping(address => mapping(bytes32 => uint256)) public approvedHashes;

  event SafeSetup(
    address indexed initiator,
    address[] owners,
    uint256 threshold,
    address initializer,
    address fallbackHandler
  );
  event ApproveHash(bytes32 indexed approvedHash, address indexed owner);
  event SignMsg(bytes32 indexed msgHash);
  event ExecutionFailure(bytes32 txHash, uint256 payment);
  event ExecutionSuccess(bytes32 txHash, uint256 payment);

  // Chainlink VRF varibales
  event RequestSent(uint256 requestId, uint32 numWords);
  event RequestFulfilled(uint256 requestId, uint256[] randomWords);
  event FunctionsError(bytes32 requestId, bytes error);
  event VRFSubscriptionCreated();

  constructor(
    string memory sourceCode,
    address _relics,
    address _attestations,
    address _relationshipRegistry
  ) VRFConsumerBaseV2(address(COORDINATOR)) FunctionsClient(ORACLE_ADDRESS) {
    source = sourceCode;
    relics = IRelics(_relics);
    attestations = IAttestations(_attestations);
    relationshipRegistry = _relationshipRegistry;
  }

  modifier onlyRelationshipRegistry() {
    require(msg.sender == relationshipRegistry, "uncallable");
    _;
  }

  modifier onlyRelationship() {
    address[2] memory parents = getParents();
    require(msg.sender == parents[0] || msg.sender == parents[1], "only relationship can call this function");
    _;
  }

  // Initializer Function
  // onlyRelationshipRegistry
  function initialize(address[] memory owners) public {
    _setup(owners, 2, address(0), "0x", address(0), address(0), 0, payable(address(0)));
    _createNewSubscription();
  }

  // VRF Functions
  function _createNewSubscription() internal {
    emit VRFSubscriptionCreated();
  }

  function topUpVRFSubscription(uint256 amount) external {
    LINK_TOKEN.transferAndCall(address(COORDINATOR), amount, abi.encode(s_subscriptionId));
  }

  function requestRandomWords() public returns (uint256 requestId) {
    emit RequestSent(requestId, 1);
    return requestId;
  }

  function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
    emit RequestFulfilled(_requestId, _randomWords);
  }

  function getRequestStatus(uint256 _requestId) external view returns (bool fulfilled, uint256[] memory randomWords) {
    require(s_requests[_requestId].exists, "request not found");
    RequestStatus memory request = s_requests[_requestId];
    return (request.fulfilled, request.randomWords);
  }

  function getVRFSubscriptionBalance() external view returns (uint96 balance) {
    (balance, , , ) = COORDINATOR.getSubscription(s_subscriptionId);
  }

  function withdraw(uint256 amount, address to) external onlyRelationship {
    LINK_TOKEN.transfer(to, amount);
  }

  function createRelic(
    bytes calldata secrets,
    string[] memory args,
    uint64 subscriptionId,
    uint256 requestId,
    uint32 gasLimit
  ) public returns (bytes32) {
    // Functions.Request memory req;
    // require(randomnessUsed[requestId] == false, "randomness already used");
    // randomnessUsed[requestId] = true;
    // args[0] = s_requests[requestId].randomWords[0].uint256ToString();
    // req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, source);
    // if (secrets.length > 0) {
    //   req.addRemoteSecrets(secrets);
    // }
    // if (args.length > 0) req.addArgs(args);

    // bytes32 assignedReqID = sendRequest(req, subscriptionId, gasLimit);
    // latestRequestId = assignedReqID;
    string memory uri = "54254";
    emit RelicCreated(uri);
    return bytes32(0);
  }

  function createAttestation(bytes memory easData) public {
    emit AttestationCreated();
  }

  function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
    if (response.length > 0) {
      //   address[2] memory parents = getParents();
      string memory metadataUri = abi.decode(response, (string));
      emit RelicCreated(metadataUri);
    } else {
      emit FunctionsError(requestId, err);
    }
  }

  function topUpFunctionsSubscription(uint256 amount) external {
    LINK_TOKEN.transferAndCall(address(FUNCTIONS_REGISTRY), amount, abi.encode(s_subscriptionId));
  }

  function _setup(
    address[] memory _owners,
    uint256 _threshold,
    address to,
    bytes memory data,
    address fallbackHandler,
    address paymentToken,
    uint256 payment,
    address payable paymentReceiver
  ) internal {
    emit SafeSetup(msg.sender, _owners, _threshold, to, fallbackHandler);
  }

  function execTransaction(
    address to,
    uint256 value,
    bytes calldata data,
    Enum.Operation operation,
    uint256 safeTxGas,
    uint256 baseGas,
    uint256 gasPrice,
    address gasToken,
    address payable refundReceiver,
    bytes[2] memory signatures
  ) public payable virtual returns (bool success) {
    success = value == 1;
    if (success) emit ExecutionSuccess(bytes32(abi.encodePacked(uint256(1))), 0);
    else emit ExecutionFailure(bytes32(abi.encodePacked(uint256(2))), 0);
  }

  function handlePayment(
    uint256 gasUsed,
    uint256 baseGas,
    uint256 gasPrice,
    address gasToken,
    address payable refundReceiver
  ) private returns (uint256 payment) {
    // solhint-disable-next-line avoid-tx-origin
    address payable receiver = refundReceiver == address(0) ? payable(tx.origin) : refundReceiver;
    if (gasToken == address(0)) {
      payment = gasUsed.add(baseGas).mul(gasPrice < tx.gasprice ? gasPrice : tx.gasprice);
      require(receiver.send(payment), "GS011");
    } else {
      payment = gasUsed.add(baseGas).mul(gasPrice);
      require(transferToken(gasToken, receiver, payment), "GS012");
    }
  }

  function checkSignatures(bytes32 dataHash, bytes memory data, bytes[2] memory signatures) public view {
    uint256 _threshold = threshold;
    require(_threshold > 0, "GS001");
    checkNSignatures(dataHash, data, signatures, _threshold);
  }

  function checkNSignatures(
    bytes32 dataHash,
    bytes memory data,
    bytes[2] memory signatures,
    uint256 requiredSignatures
  ) public view {
    require(signatures.length == requiredSignatures.mul(65), "GS020");
    address currentOwner;
    uint256 i;
    for (i = 0; i < requiredSignatures; i++) {
      currentOwner = checkSignature(signatures[i], dataHash);
      require(isSigner(currentOwner), "Invalid Sig");
    }
  }

  function checkSignature(bytes memory signature, bytes32 dataHash) public pure returns (address) {
    return _recoverSigner(_getEthSignedMessageHash(dataHash), signature);
  }

  function _recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) public pure returns (address) {
    (bytes32 r, bytes32 s, uint8 v) = _splitSignature(_signature);

    return ecrecover(_ethSignedMessageHash, v, r, s);
  }

  function _getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
    return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
  }

  function _splitSignature(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v) {
    require(sig.length == 65, "invalid signature length");

    assembly {
      r := mload(add(sig, 32))
      s := mload(add(sig, 64))
      v := byte(0, mload(add(sig, 96)))
    }
  }

  function requiredTxGas(
    address to,
    uint256 value,
    bytes calldata data,
    Enum.Operation operation
  ) external returns (uint256) {
    uint256 startGas = gasleft();
    require(execute(to, value, data, operation, gasleft()));
    uint256 requiredGas = startGas - gasleft();
    revert(string(abi.encodePacked(requiredGas)));
  }

  function getChainId() public view returns (uint256) {
    uint256 id;
    // solhint-disable-next-line no-inline-assembly
    assembly {
      id := chainid()
    }
    return id;
  }

  function domainSeparator() public view returns (bytes32) {
    return keccak256(abi.encode(DOMAIN_SEPARATOR_TYPEHASH, getChainId(), this));
  }

  function encodeTransactionData(
    address to,
    uint256 value,
    bytes calldata data,
    Enum.Operation operation,
    uint256 safeTxGas,
    uint256 baseGas,
    uint256 gasPrice,
    address gasToken,
    address refundReceiver,
    uint256 _nonce
  ) public view returns (bytes memory) {
    bytes32 safeTxHash = keccak256(
      abi.encode(
        SAFE_TX_TYPEHASH,
        to,
        value,
        keccak256(data),
        operation,
        safeTxGas,
        baseGas,
        gasPrice,
        gasToken,
        refundReceiver,
        _nonce
      )
    );
    return abi.encodePacked(bytes1(0x19), bytes1(0x01), domainSeparator(), safeTxHash);
  }

  function getTransactionHash(
    address to,
    uint256 value,
    bytes calldata data,
    Enum.Operation operation,
    uint256 safeTxGas,
    uint256 baseGas,
    uint256 gasPrice,
    address gasToken,
    address refundReceiver,
    uint256 _nonce
  ) public view returns (bytes32) {
    return
      keccak256(
        encodeTransactionData(
          to,
          value,
          data,
          operation,
          safeTxGas,
          baseGas,
          gasPrice,
          gasToken,
          refundReceiver,
          _nonce
        )
      );
  }

  function getParents() public view returns (address[2] memory) {
    uint256 length = address(this).code.length;
    (address parent1, address parent2) = abi.decode(
      Bytecode.codeAt(address(this), length - 0x40, length),
      (address, address)
    );
    return [parent1, parent2];
  }

  function getVRFSubscriptionID() public view returns (uint64) {
    return s_subscriptionId;
  }
}
