import React, {useState, useMemo, useEffect} from 'react';
import {Text, View, ScrollView, Image, TouchableOpacity} from 'react-native';
import {profiles} from '../constants/Placeholders';
import tw from 'twrnc';
import {getAccountsForUser} from '../utils/Subgraphs';
import {getNFTsOwnedByWallet} from '../utils/Quicknode';

import {ethers} from 'ethers';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';

import {RequestModal} from '../components/RequestModal';

export default function () {
  const [rpcResponse, setRpcResponse] = useState<any>();
  const [rpcError, setRpcError] = useState<any>();
  const [ownedTBTs, setOwnedTBTs] = useState<any[]>(profiles);
  const [somethingLoading, setSomethingLoading] = useState<boolean>(false);
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>(profiles);

  const test_data: any = {
    implementation: '0x91fA0Ef4953Ab62DE0106f64c8A3705C3a487cc3',
    chainId: 80001,
    tokenContract: '0x87955eE700555911DbBFBEb38416E368Db7FfFD1',
    tokenId: 0,
    salt: 42069,
    initData:
      '0x7591dc980000000000000000000000000000000000000000000000000000000000000060311ece950f9ec55757eb95f3182ae5e2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b800000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000000000000000020b14aa2b855beee446a9685f4a38e612e00000000000000000000000000000000b8e2054f8a912367e38a22ce773328ff000000000000000000000000000000007369736d6f2d636f6e6e6563742d76312e31000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001a068796472612d73332e310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000004a0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010461a417b111783471c8dceec6b5daa151f44e4a9ff916046a724c80e5b7524800000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002c013c7026622b32717c6f9f76e332429fde11c71b34635fbbf19ed66074ca0198b0932ed1ce416f0932b81df5f7db06f2dbe0003f932141699298505faf7a103fa00cfed2f84948c42bfd7b20bddbe481486bcf8a5f8595cc842a348ad6ccfe8222aa28babdfed3425312bd33705146b2661202eedd1a5411fb50dbe62a63f2e2c1cdb7ee427090f5a086f36cd73e7466cdb7dec36a1e1d63a570ee78c31d836d504676be82ce685f27aad0456026f7f7a8092068e87af3e8f1f6554084f6c508c0ed2ed8dd6f05012bca38d7c256bc271a3c9b0a2cd219cbad62d89d19cedc7fd2ff708a4de136c95748c2b243219e351af441c7eaa86cd1ede1d24386dd0ab97000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001801b584700a740f9576cc7e83745895452edc518a9ce60b430e1272fc4eb93b057cf80de4f8dd3e4c56f948f40c28c3acbeca71ef9f825597bf8cc059f1238b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000461a417b111783471c8dceec6b5daa151f44e4a9ff916046a724c80e5b7524801431df73e5f41c250f2b4ccdfcb53f8b6ead6109e7f8d85c6dfa2c1c4ac5aff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c068796472612d73332e310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000004c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000311ece950f9ec55757eb95f3182ae5e2000000000000000000000000000000006c617465737400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002c02fb118aa39459bba12bd7176ee9a1de946dd5fdbac2412d7b3cf50b242e031a10e84b6c31acc220e79baf557f0604614d253bfc68b65e9dddccb6fcbe463f59525791231c00e31e21956fc0bea84e7d8e0388a4537ae78a7cdd150324c0e12d4039581201ac33920e44648b08293af10851c65fcf6793afd44e1d28c314ef6a11425e13ecfa2cd92cdbd670c245d07205e606b68bf9885fd4b0c2fda6547066a28e8a33e194401ed6b6912f2cfdb1c1bd3693b68351a4927ad2262fdbaadc0fc1e88ed18d174f1adce1e151c25c8ea676dabe702d9a9162af627179716b141f52fb560d666ce8a1d2fd6fe865c086bda89ab45c9195486d2906ea758ef88ef2c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001801b584700a740f9576cc7e83745895452edc518a9ce60b430e1272fc4eb93b057cf80de4f8dd3e4c56f948f40c28c3acbeca71ef9f825597bf8cc059f1238b1037de674a7fa938b3844f6d5330e29f79f1f789b65229342f90b3cab57de4ff10d2a0ba03f2c683c40e471038f167450a0ef7758268482716af525880a9f80d25eac68ab7637d950c616da7a4d09dacd7e992c0f76eb3c6a1dbdbcba13ea123000000000000000000000000000000000000000000000000000000000000000100ba80222e6d252d9f9b503c96a98d85442d8c1cf9ba8f6ebc1e0a6c0fffffff00000000000000000000000000000000000000000000000000000000000000000461a417b111783471c8dceec6b5daa151f44e4a9ff916046a724c80e5b7524801431df73e5f41c250f2b4ccdfcb53f8b6ead6109e7f8d85c6dfa2c1c4ac5aff00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028b64c959a715c6b10aa8372100071ca7000000000000000000000000000000006458d3872ba7b3daf9ec5adbb694d39300000000000000000000000000000000',
  };

  const {provider, address} = useWalletConnectModal();
  const web3Provider = useMemo(
    () => (provider ? new ethers.providers.Web3Provider(provider) : undefined),
    [provider],
  );

  const chainId = web3Provider?.getNetwork();

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const onModalClose = () => {
    setModalVisible(false);
    setLoading(false);
    setRpcResponse(undefined);
    setRpcError(undefined);
  };

  const createAccount = async (token: any) => {
    if (!web3Provider) {
      return;
    }

    setRpcResponse(undefined);
    setRpcError(undefined);
    setModalVisible(true);
    try {
      setLoading(true);
      // Get the signer from the UniversalProvider
      const signer = web3Provider.getSigner();

      let me = await signer.getAddress();
      console.log('signer is ' + me);

      const executeFunctionSelector = ethers.utils
        .id('createAccount(address,uint256,address,uint256,uint256,bytes)')
        .slice(0, 10);

      // Encode the parameters
      const encodedParams = ethers.utils.defaultAbiCoder.encode(
        ['address', 'uint256', 'address', 'uint256', 'uint256', 'bytes'],
        [
          token.implementation,
          token.chainId,
          token.tokenContract,
          token.tokenId,
          token.salt,
          token.initData,
        ],
      );
      const transactionData = executeFunctionSelector + encodedParams.slice(2);

      console.log('transactionData is ' + transactionData);
      // Send the transaction using the signer
      const txResponse = await signer.sendTransaction({
        to: '0x90450AA8370C284942f71B353fA46330Ad16C0E7',
        value: ethers.utils.parseEther('0'),
        data: transactionData,
      });

      const transactionHash = txResponse.hash;
      console.log('transactionHash is ' + transactionHash);

      // Wait for the transaction to be mined (optional)
      const receipt = await txResponse.wait();
      console.log('Transaction was mined in block:', receipt.blockNumber);

      setRpcResponse(txResponse);
      setRpcError(undefined);
    } catch (error: any) {
      console.error('RPC request failed:', error);
      setRpcResponse(undefined);
      setRpcError({error: error?.message});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      // let data: any = await getNFTsOwnedByWallet(address).catch(err => {
      //   console.log('error from Quicknode', err);
      // });
      // setOwnedNFTs(data);
      const {chainId} = await web3Provider.getNetwork();
      let tbt: any = await getAccountsForUser(
        [test_data.tokenContract],
        [test_data.tokenId],
        chainId.toString(),
      ).catch(err => {
        console.log('error from subgraph', err);
      });
      console.log('tbt', tbt);
      // setOwnedTBTs(tbt);
    })();
  }, [address]);

  return (
    <ScrollView>
      <View
        style={tw`flex flex-col items-start justify-center w-full h-full p-4 mt-8`}>
        <Text style={tw`text-4xl font-bold text-red-600 mb-2 text-left`}>
          Choose one of your 6551 accounts.
        </Text>
        <ScrollView style={[tw`bg-zinc-200 rounded-3xl`]} horizontal={true}>
          {ownedTBTs.length !== 0 ? (
            ownedTBTs.map((tbt, index) => {
              return (
                <TouchableOpacity
                  style={[tw`flex flex-col items-center justify-start p-4 `]}
                  onPress={() => {
                    setOwnedNFTs(profiles);
                    setOwnedTBTs(profiles);
                  }}>
                  <View key={index}>
                    <Image
                      style={tw`w-40 h-40 rounded-2xl shadow-xl`}
                      source={{
                        uri: tbt.image,
                      }}
                    />
                    <Text style={tw`font-bold text-slate-600 text-start`}>
                      {tbt.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={tw`text-2xl font-bold p-3 text-zinc-600 text-left`}>
              No accounts found.
            </Text>
          )}
        </ScrollView>
        <Text style={tw`mt-10 text-4xl font-bold text-red-600 text-left`}>
          Don't have one?
        </Text>
        <Text style={tw`text-xl text-slate-600 mb-4 text-left`}>
          Create one with NFTs you already own.
        </Text>

        <ScrollView style={[tw`bg-zinc-200 rounded-3xl`]} horizontal={true}>
          {!somethingLoading ? (
            ownedNFTs.map((nft, index) => {
              return (
                <TouchableOpacity
                  style={[tw`flex flex-col items-center justify-start p-4 `]}
                  onPress={() => {
                    // createAccount();
                    createAccount(test_data);
                  }}>
                  <View key={index}>
                    <Image
                      style={tw`w-40 h-40 rounded-2xl shadow-xl`}
                      source={{
                        uri: nft.image,
                      }}
                    />
                    <Text style={tw`font-bold text-slate-600 text-start`}>
                      {nft.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={tw`text-2xl font-bold p-3 text-zinc-600 text-left`}>
              No NFTs found.
            </Text>
          )}
        </ScrollView>
      </View>

      <RequestModal
        rpcResponse={rpcResponse}
        rpcError={rpcError}
        isLoading={loading}
        isVisible={modalVisible}
        onClose={onModalClose}
      />
    </ScrollView>
  );
}
