pragma solidity ^0.8.13;

import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import {Functions, FunctionsClient} from "./dev/functions/FunctionsClient.sol";
import "./dev/interfaces/FunctionsBillingRegistryInterface.sol";
import "./utils/Bytecode.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./utils/UintToString.sol";
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
import "./interface/IERC6551Account.sol";
import "./interface/IRelics.sol";
import "@hyperlane-xyz/core/contracts/interfaces/middleware/IInterchainQueryRouter.sol";
import "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";
import "@hyperlane-xyz/core/contracts/interfaces/IInterchainGasPaymaster.sol";
import "./interface/IERC6551Account.sol";

contract Relationship is
  EtherPaymentFallback,
  Singleton,
  ModuleManager,
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
  struct SafeSetupParams {
    address[2] _owners;
    uint256 _threshold;
    address to;
    bytes data;
    address fallbackHandler;
    address paymentToken;
    uint256 payment;
    address payable paymentReceiver;
  }
  struct ExecuteTransactionParams {
    address to;
    uint256 value;
    bytes data;
    Enum.Operation operation;
    uint256 safeTxGas;
    uint256 baseGas;
    uint256 gasPrice;
    address gasToken;
    address payable refundReceiver;
    bytes[2] signatures;
  }
  struct RelicRequest {
    bytes secrets;
    string[] args;
    uint64 subscriptionId;
    uint32 gasLimit;
    bool exists;
  }
  struct StaticCall {
    bytes32 to;
    bytes data;
  }

  struct StaticCallWithCallback {
    StaticCall _call;
    bytes callback;
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
  mapping(uint => RelicRequest) public relicCreationRequest;
  bool public initialized;
  event RelicCreated(string uri);

  // Chainlink VRF variables
  mapping(uint256 => RequestStatus) public s_requests;
  uint64 public s_subscriptionId;
  uint256[] public requestIds;
  uint256 public lastRequestId;
  mapping(uint256 => bool) public randomnessUsed;

  // Chainlink Functions Variables
  uint32 public constant functionsFulfillGasLimit = 300000;
  uint public constant threshold = 2;

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
    address[2] owners,
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

  // Hyperlane varaibles
  IMailbox public constant mailbox = IMailbox(0xCC737a94FecaeC165AbCf12dED095BB13F037685);
  IInterchainGasPaymaster public constant igp = IInterchainGasPaymaster(0xF90cB82a76492614D07B82a7658917f3aC811Ac1);
  IInterchainQueryRouter public constant iqsRouter = IInterchainQueryRouter(0xD786eC480Da58792175c9DDEdD99802Badf1037E);

  // mapping(bytes32=>)public crossChainRegistry;

  constructor(
    string memory sourceCode,
    address _relics
  ) VRFConsumerBaseV2(address(COORDINATOR)) FunctionsClient(ORACLE_ADDRESS) {
    source = sourceCode;
    relics = IRelics(_relics);
  }

  modifier onlyOnce() {
    require(!initialized, "already initialized");
    _;
  }

  modifier onlyRelationship() {
    address[2] memory parents = getParents();
    require(msg.sender == parents[0] || msg.sender == parents[1], "only relationship can call this function");
    _;
  }

  // Initializer Function
  function initialize(address[2] memory owners) public onlyOnce {
    require(owners[0] != owners[1], "Invalid Owners");
    SafeSetupParams memory safeSetupParams = SafeSetupParams({
      _owners: owners,
      _threshold: 2,
      to: address(this),
      data: abi.encodeWithSignature("setup()"),
      fallbackHandler: address(this),
      paymentToken: address(0),
      payment: 0,
      paymentReceiver: payable(address(this))
    });
    _setup(safeSetupParams);
    _createNewSubscription();
    initialized = true;
  }

  // VRF Functions
  function _createNewSubscription() internal {
    s_subscriptionId = COORDINATOR.createSubscription();
    COORDINATOR.addConsumer(s_subscriptionId, address(this));
    emit VRFSubscriptionCreated();
  }

  function topUpVRFSubscription(uint256 amount) external {
    LINK_TOKEN.transferAndCall(address(COORDINATOR), amount, abi.encode(s_subscriptionId));
  }

  function _requestRandomWords() internal returns (uint256 requestId) {
    requestId = COORDINATOR.requestRandomWords(KEY_HASH, s_subscriptionId, 3, 100000, 1);
    s_requests[requestId] = RequestStatus({randomWords: new uint256[](1), exists: true, fulfilled: false});
    requestIds.push(requestId);
    emit RequestSent(requestId, 1);
    return requestId;
  }

  function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
    require(s_requests[_requestId].exists, "request not found");
    require(relicCreationRequest[_requestId].exists, "relic not found");
    RelicRequest memory relicRequest = relicCreationRequest[_requestId];
    Functions.Request memory req;
    relicRequest.args[1] = Strings.toString(_randomWords[0]);
    req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, source);
    if (relicRequest.secrets.length > 0) {
      req.addRemoteSecrets(relicRequest.secrets);
    }
    if (relicRequest.args.length > 0) req.addArgs(relicRequest.args);

    bytes32 assignedReqID = sendRequest(req, relicRequest.subscriptionId, relicRequest.gasLimit);
    latestRequestId = assignedReqID;
    s_requests[_requestId].fulfilled = true;
    s_requests[_requestId].randomWords = _randomWords;
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
    uint32 gasLimit
  ) public returns (bytes32) {
    uint requestId = _requestRandomWords();
    relicCreationRequest[requestId] = RelicRequest(secrets, args, subscriptionId, gasLimit, true);
    return bytes32(requestId);
  }

  function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
    if (response.length > 0) {
      string memory metadataUri = abi.decode(response, (string));
      IRelics(relics).mintRelic(metadataUri);
      emit RelicCreated(metadataUri);
    } else {
      emit FunctionsError(requestId, err);
    }
  }

  function topUpFunctionsSubscription(uint256 amount) external {
    LINK_TOKEN.transferAndCall(address(FUNCTIONS_REGISTRY), amount, abi.encode(s_subscriptionId));
  }

  function _setup(SafeSetupParams memory safeSetupParams) internal {
    // setupOwners(safeSetupParams._owners, safeSetupParams._threshold);

    emit SafeSetup(
      msg.sender,
      safeSetupParams._owners,
      safeSetupParams._threshold,
      safeSetupParams.to,
      safeSetupParams.fallbackHandler
    );
  }

  // function verifyExecutionFallback(address nftOwner)public {

  // }

  function execTransaction(
    ExecuteTransactionParams calldata executeTransactionParams
  ) public payable virtual returns (bool success) {
    require(executeTransactionParams.to != address(relics), "uncallable");

    bytes32 txHash;
    {
      bytes memory txHashData = encodeTransactionData(
        executeTransactionParams.to,
        executeTransactionParams.value,
        executeTransactionParams.data,
        executeTransactionParams.operation,
        executeTransactionParams.safeTxGas,
        // Payment info
        executeTransactionParams.baseGas,
        executeTransactionParams.gasPrice,
        executeTransactionParams.gasToken,
        executeTransactionParams.refundReceiver,
        // Signature info
        nonce
      );
      // Increase nonce and execute transaction.
      nonce++;
      txHash = keccak256(txHashData);
      // address[2] memory parents=getParents();
      // (uint chainId1,address tokenAddress1,uint tokenId1)=IERC6551Account(parents[0]).token();
      // (uint chainId2,address tokenAddress2,uint tokenId2)=IERC6551Account(parents[0]).token();
      // StaticCallWithCallback[] memory calls=new StaticCallWithCallback[]();

      // if(chainId1!=80001){
      //   calls.push(StaticCall(tokenAddress1,abi.encodePacked(IERC721(tokenAddress1).ownerOf.selector,tokenId1),abi.encodePacked(this.verifyExecutionFallback.selector,0)));
      // }

      // if(chainId2!=80001){
      //   calls.push(StaticCall(tokenAddress2,abi.encodePacked(IERC721(tokenAddress2).ownerOf.selector,tokenId2),abi.encodePacked(this.verifyExecutionFallback.selector,0)));

      // }

      // struct
      checkSignatures(txHash, txHashData, executeTransactionParams.signatures);
    }
    bytes memory _signatures = abi.encodePacked(
      executeTransactionParams.signatures[0],
      executeTransactionParams.signatures[1]
    );
    address guard = getGuard();
    {
      if (guard != address(0)) {
        Guard(guard).checkTransaction(
          // Transaction info
          executeTransactionParams.to,
          executeTransactionParams.value,
          executeTransactionParams.data,
          executeTransactionParams.operation,
          executeTransactionParams.safeTxGas,
          // Payment info
          executeTransactionParams.baseGas,
          executeTransactionParams.gasPrice,
          executeTransactionParams.gasToken,
          executeTransactionParams.refundReceiver,
          // Signature info
          _signatures,
          msg.sender
        );
      }
    }
    require(
      gasleft() >=
        ((executeTransactionParams.safeTxGas * 64) / 63).max(executeTransactionParams.safeTxGas + 2500) + 500,
      "GS010"
    );
    {
      uint256 gasUsed = gasleft();
      success = execute(
        executeTransactionParams.to,
        executeTransactionParams.value,
        executeTransactionParams.data,
        executeTransactionParams.operation,
        executeTransactionParams.gasPrice == 0 ? (gasleft() - 2500) : executeTransactionParams.safeTxGas
      );
      gasUsed = gasUsed.sub(gasleft());
      require(success || executeTransactionParams.safeTxGas != 0 || executeTransactionParams.gasPrice != 0, "GS013");
      uint256 payment = 0;
      if (executeTransactionParams.gasPrice > 0) {
        payment = handlePayment(
          gasUsed,
          executeTransactionParams.baseGas,
          executeTransactionParams.gasPrice,
          executeTransactionParams.gasToken,
          executeTransactionParams.refundReceiver
        );
      }
      if (success) emit ExecutionSuccess(txHash, payment);
      else emit ExecutionFailure(txHash, payment);
    }
    {
      if (guard != address(0)) {
        Guard(guard).checkAfterExecution(txHash, success);
      }
    }
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
    address[2] memory parents = getParents();

    for (i = 0; i < requiredSignatures; i++) {
      currentOwner = checkSignature(signatures[i], dataHash);
      require(isSigner(parents[i], currentOwner), "Invalid Sig");
    }
  }

  function isSigner(address parent, address owner) public view returns (bool) {
    return IERC6551Account(payable(parent)).owner() == owner;
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
      Bytecode.codeAt(address(this), length - 0x60, length),
      (address, address)
    );
    return [parent1, parent2];
  }

  function getVRFSubscriptionID() public view returns (uint64) {
    return s_subscriptionId;
  }
}
