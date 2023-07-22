import React, {useState, useMemo} from 'react';
import {Text, View, ScrollView, Image, TouchableOpacity} from 'react-native';
import {profiles} from '../constants/Placeholders';
import tw from 'twrnc';
import type {FormattedRpcResponse} from '../types/methods';

import {ethers} from 'ethers';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';

import {RequestModal} from '../components/RequestModal';

export default function (props: any) {
  const [rpcResponse, setRpcResponse] = useState<FormattedRpcResponse>();
  const [rpcError, setRpcError] = useState<any>();
  const {provider, address} = useWalletConnectModal();
  const web3Provider = useMemo(
    () => (provider ? new ethers.providers.Web3Provider(provider) : undefined),
    [provider],
  );

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const onModalClose = () => {
    setModalVisible(false);
    setLoading(false);
    setRpcResponse(undefined);
    setRpcError(undefined);
  };

  const createAccount = async () => {
    if (!web3Provider) {
      return;
    }

    setRpcResponse(undefined);
    setRpcError(undefined);
    setModalVisible(true);
    try {
      setLoading(true);
      // TODO: Do the logic here
      // const result = await signedTransaction()
      // setRpcResponse(result);
      setRpcError(undefined);
    } catch (error: any) {
      console.error('RPC request failed:', error);
      setRpcResponse(undefined);
      setRpcError({error: error?.message});
    } finally {
      setLoading(false);
    }
  };

  const [ownedTBTs, setOwnedTBTs] = useState<any[]>(profiles);
  //   const [ownedTBTsLoading, setOwnedTBTsLoading] = useState<boolean>(false);
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>(profiles);

  function createWithNFT() {
    console.log(props.navigation);
    // props.navigation.navigate('Home');
  }

  return (
    <ScrollView>
      <View
        style={tw`flex flex-col items-start justify-center w-full h-full p-4 mt-8`}>
        <Text style={tw`text-4xl font-bold text-red-600 mb-2 text-left`}>
          Choose one of your 6551 accounts.
        </Text>
        <ScrollView style={[tw`bg-zinc-200 rounded-3xl`]} horizontal={true}>
          {ownedTBTs.map((tbt, index) => {
            return (
              <TouchableOpacity
                style={[tw`flex flex-col items-center justify-start p-4 `]}
                onPress={() => {
                  createWithNFT();
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
          })}
        </ScrollView>

        <Text style={tw`mt-10 text-4xl font-bold text-red-600 text-left`}>
          Don't have one?
        </Text>
        <Text style={tw`text-xl text-slate-600 mb-4 text-left`}>
          Create one with NFTs you already own.
        </Text>

        <ScrollView style={[tw`bg-zinc-200 rounded-3xl`]} horizontal={true}>
          {ownedNFTs.map((nft, index) => {
            return (
              <TouchableOpacity
                style={[tw`flex flex-col items-center justify-start p-4 `]}
                onPress={() => {
                  createWithNFT();
                  setOwnedNFTs(profiles);
                  setOwnedTBTs(profiles);
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
          })}
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
