import React, {useState, useMemo, useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import tw from 'twrnc';
import {ethers} from 'ethers';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import ChatWidget from '../components/Chat';
import ERC20Abi from '../constants/Contract';

export default function () {
  const [loading, setLoading] = useState(true);
  const [linkBalance, setLinkBalance] = useState(0);
  const {provider, address} = useWalletConnectModal();

  const web3Provider = useMemo(
    () => (provider ? new ethers.providers.Web3Provider(provider) : undefined),
    [provider],
  );

  useEffect(() => {
    (async () => {
      if (!web3Provider) {
        return;
      }

      // Get ERC20 balance for a token address
      try {
        let ABI: any = ERC20Abi;
        const tokenContract = '0x326C977E6efc84E512bB9C30f76E30c160eD06FB'; // LINK
        const contract = new ethers.Contract(tokenContract, ABI, web3Provider);
        const balance = await contract.balanceOf(address);

        const decimals = await contract.decimals();
        const balanceFormatted = balance.div(
          ethers.BigNumber.from(10).pow(decimals),
        );
        setLinkBalance(balanceFormatted.toString());
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    })();
  }, [address, web3Provider]);

  return (
    <View style={tw`flex-col items-center justify-center bg-white pt-10`}>
      <Text style={tw`text-5xl mb-5 font-bold text-red-700 ml-5`}>
        The relationship
      </Text>
      <View
        style={tw`flex-row justify-center items-center bg-red-100 rounded-md p-2 mx-2 mb-5 h-30`}>
        <TouchableOpacity
          onPress={() => {}}
          style={tw`flex-row justify-center items-center my-2 py-2 bg-red-600 pr-5 rounded-xl `}>
          <Text style={tw`text-sm text-white px-3 font-bold`}>
            + Create a relic
          </Text>
        </TouchableOpacity>
        <View style={tw`ml-5 flex-col justify-center items-start`}>
          <TouchableOpacity
            onPress={() => {}}
            style={tw`flex-row justify-center items-center my-2 py-2 bg-red-600 pr-5 rounded-2xl `}>
            <Text style={tw`text-sm text-white px-3 font-bold`}>
              + Add link tokens
            </Text>
          </TouchableOpacity>
          <View style={tw`flex-row items-start justify-center mx-5 mb-5`}>
            <Text style={tw`text-sm mb-1`}>Balance: </Text>
            <Text style={tw`text-sm mb-1`}>
              {loading ? 'Loading...' : linkBalance} LINK
            </Text>
          </View>
        </View>
      </View>

      <ChatWidget />
    </View>
  );
}
