import * as PushAPI from '@pushprotocol/restapi';
import {ethers} from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

const env = 'staging';
const showAPIResponse = process.env.SHOW_API_RESPONSE;

// Addresses that will be used to
const signer = ethers.Wallet.createRandom();
const signerSecondAccount = ethers.Wallet.createRandom();

// generate some dummy wallets as well
const randomWallet1 = ethers.Wallet.createRandom().address;
const randomWallet2 = ethers.Wallet.createRandom().address;
const randomWallet3 = ethers.Wallet.createRandom().address;

// NFT Chat Data
const nnftChainId1 = process.env.NFT_CHAIN_ID_1;
const nnftContractAddress1 = process.env.NFT_CONTRACT_ADDRESS_1;
const nnftTokenId1 = process.env.NFT_TOKEN_ID_1;
const nnftHolderWalletPrivatekey1 = process.env.NFT_HOLDER_WALLET_PRIVATE_KEY_1;
const nnftSigner1 = new ethers.Wallet(`0x${nnftHolderWalletPrivatekey1}`);
const nnftAccount1 = `nft:eip155:${nnftChainId1}:${nnftContractAddress1}:${nnftTokenId1}`;
const nnftProfilePassword1 = process.env.NFT_PROFILE_PASSWORD_1;
const nnftChainId2 = process.env.NFT_CHAIN_ID_2;
const nnftContractAddress2 = process.env.NFT_CONTRACT_ADDRESS_2;
const nnftTokenId2 = process.env.NFT_TOKEN_ID_2;
const nnftHolderWalletPrivatekey2 = process.env.NFT_HOLDER_WALLET_PRIVATE_KEY_2;
const nnftSigner2 = new ethers.Wallet(`0x${nnftHolderWalletPrivatekey2}`);
const nnftAccount2 = `nft:eip155:${nnftChainId2}:${nnftContractAddress2}:${nnftTokenId2}`;
const nnftProfilePassword2 = process.env.NFT_PROFILE_PASSWORD_2;
//
const nnftAccount3 = `nft:eip155:${nnftChainId2}:${nnftContractAddress2}:3`;

// Push Chat - PushAPI.chat.send
// Will send a message to the user or chat request in case user hasn't approved them
export async function PushAPI_nft_chat_send(
  nftAccount1,
  nftSigner1,
  nftAccount2,
  env,
) {
  // Fetch user
  const user = await PushAPI.user.get({
    account: nftAccount1,
    env: env,
  });

  // Decrypt PGP Key
  const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    signer: nftSigner1,
  });

  // Actual api
  const response = await PushAPI.chat.send({
    messageContent: "Gm gm! It's me... Mary",
    messageType: 'Text', // can be "Text" | "Image" | "File" | "GIF"
    receiverAddress: nftAccount2,
    account: nftAccount1,
    signer: signer,
    pgpPrivateKey: pgpDecrpyptedPvtKey,
    env: env,
  });

  console.log('PushAPI_nft_chat_send | Response - 200 OK');
  //   if (!silent) {
  console.log(response);
  return new Promise(resolve => {
    resolve(response);
  });
  //   }
}

// Push Chat - PushAPI.user.get
async function PushAPI_nft_user_get(nftAccount1, env) {
  console.log('this is the nftAccount1', nftAccount1);
  const user = await PushAPI.user.get({
    account: nftAccount1,
    env: env,
  });

  console.log('PushAPI_nft_user_get | Response - 200 OK');

  return new Promise(resolve => {
    resolve(user);
  });
  //   if (!silent) {
  //     console.log(user);
  //   }
}

// Push Chat - PushAPI.user.create
export async function PushAPI_nft_user_create(
  nftAccount1,
  nftSigner1,
  env,
  nftProfilePassword1,
  nftAccount2,
  nftSigner2,
  nftProfilePassword2,
) {
  const user1 = await PushAPI.user.create({
    account: nftAccount1,
    signer: nftSigner1,
    env: env,
    additionalMeta: {
      NFTPGP_V1: {
        password: nftProfilePassword1,
      },
    },
  });

  const user2 = await PushAPI.user.create({
    account: nftAccount2,
    signer: nftSigner2,
    env: env,
    additionalMeta: {
      NFTPGP_V1: {
        password: nftProfilePassword2,
      },
    },
  });

  console.log('PushAPI_nft_user_create | Response - 200 OK');
  //   if (!silent) {
  //     console.log(user1);
  //     console.log(user2);
  //   }
}

// Push Chat - Approve
export async function PushAPI_nft_chat_approve(
  nftAccount2,
  env,
  nftSigner2,
  nftAccount1,
) {
  // Fetch user
  const user = await PushAPI.user.get({
    account: nftAccount2,
    env: env,
  });

  // Decrypt PGP Key
  const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    // @ts-ignore
    signer: nftSigner2,
  });

  // Actual api
  const approve = await PushAPI.chat.approve({
    status: 'Approved',
    senderAddress: nftAccount1, // receiver's address or chatId of a group
    account: nftAccount2,
    signer: nftSigner2,
    pgpPrivateKey: pgpDecrpyptedPvtKey,
    env: env,
  });

  //console.log('PushAPI_nft_chat_approve | Response - 200 OK')
  //if (!silent) {
  console.log(approve);
  //}
  return new Promise(resolve => {
    resolve(approve);
  });
}

// Push Chat - PushAPI.chat.history
export async function PushAPI_nft_chat_history(
  nftAccount1,
  env,
  nftSigner1,
  nftAccount2,
) {
  // Fetch user
  const user = await PushAPI.user.get({
    account: nftAccount1,
    env: env,
  });

  // Decrypt PGP Key
  const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    signer: nftSigner1,
  });

  // Fetch conversation hash
  // conversation hash are also called link inside chat messages
  const conversationHash = await PushAPI.chat.conversationHash({
    account: nftAccount1,
    conversationId: nftAccount2, // 2nd address
    env: env,
  });

  // Actual API
  const response = await PushAPI.chat.history({
    // @ts-ignore
    threadhash: conversationHash.threadHash, // get conversation hash from conversationHash function and send the response threadhash here
    account: nftAccount1,
    limit: 5,
    toDecrypt: true,
    pgpPrivateKey: pgpDecrpyptedPvtKey,
    env: env,
  });

  //   console.log("PushAPI_nft_chat_history | Response - 200 OK");
  //   if (!silent) {
  console.log(response);
  return new Promise(resolve => {
    resolve(response);
  });
  //   }
}

// Push Chat - PushAPI.chat.requests
export async function PushAPI_nft_chat_requests(nftAccount1, env, nftSigner1) {
  // Fetch user
  const user = await PushAPI.user.get({
    account: nftAccount1,
    env: env,
  });

  // Decrypt PGP Key
  const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    // @ts-ignore
    signer: nftSigner1,
  });

  // Actual api
  const response = await PushAPI.chat.requests({
    account: nftAccount1,
    toDecrypt: true,
    pgpPrivateKey: pgpDecrpyptedPvtKey,
    env: env,
  });

  // console.log('PushAPI_nft_chat_requests | Response - 200 OK')
  // if (!silent) {
  console.log(response);
  // }
  return new Promise(resolve => {
    resolve(response);
  });
}

export async function PushAPI_nft_chat_chats(nftAccount1, env, nftSigner1) {
  // Fetch user
  const user = await PushAPI.user.get({
    account: nftAccount1,
    env: env,
  });

  // Decrypt PGP Key
  const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    // @ts-ignore
    signer: nftSigner1,
  });

  // Actual api
  const response = await PushAPI.chat.chats({
    account: nftAccount1,
    toDecrypt: true,
    pgpPrivateKey: pgpDecrpyptedPvtKey,
    env: env,
  });

  console.log('PushAPI_nft_chat_chats | Response - 200 OK');
  //if (!silent) {
  console.log(response);
  return new Promise(resolve => {
    resolve(response);
  });
  //}
}

await PushAPI_nft_user_create(
  nnftAccount1,
  nnftSigner1,
  env,
  nnftProfilePassword1,
  nnftAccount2,
  nnftSigner2,
  nnftProfilePassword2,
);

console.log('PushAPI.user.get');
await PushAPI_nft_user_get(nnftAccount1, env);
console.log('PushAPI.chat.requests');
await PushAPI_nft_chat_requests(nnftAccount1, env, nnftSigner1);
console.log('PushAPI.chat.send');
await PushAPI_nft_chat_send(nnftAccount1, nnftSigner1, nnftAccount2, env);
console.log('PushAPI.chat.approve');
await PushAPI_nft_chat_approve(nnftAccount2, env, nnftSigner2, nnftAccount1);
console.log('PushAPI_chat_history');
await PushAPI_nft_chat_history(nnftAccount1, env, nnftSigner1, nnftAccount2);
// get all of the chats one NFT has with other NFTs

console.log('PushAPI.chat.send');
await PushAPI_nft_chat_send(nnftAccount2, nnftSigner2, nnftAccount3, env);
console.log('PushAPI.chat.chats');
await PushAPI_nft_chat_chats(nnftAccount2, env, nnftSigner2);
