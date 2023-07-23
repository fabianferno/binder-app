import React, {useState, useMemo, useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import tw from 'twrnc';
import {ethers} from 'ethers';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import ChatWidget from '../components/Chat';
import {giveMeetingAttestation} from '../utils/EAS';
// import {
//   PushAPI_nft_chat_send,
//   PushAPI_nft_chat_get,
//   PushAPI_nft_chat_create,
//   PushAPI_nft_chat_approve,
//   PushAPI_nft_chat_history,
//   PushAPI_nft_chat_requests,
//   PushAPI_nft_chat_chats,
// } from '../utils/Push';
import ERC20Abi from '../constants/Contract';

export default function () {
  const [loading, setLoading] = useState(true);
  const [linkBalance, setLinkBalance] = useState(0);
  const {provider, address} = useWalletConnectModal();
  const [attestation, setAttestation] = useState<any>({});

  const web3Provider = useMemo(
    () => (provider ? new ethers.providers.Web3Provider(provider) : undefined),
    [provider],
  );

  const mySigner = web3Provider.getSigner();

  useEffect(() => {
    (async () => {
      if (!web3Provider) {
        return;
      } else {
        // let push_data: any = PushAPI_nft_chat_requests(
        //   address,
        //   'staging',
        //   mySigner,
        // );
        // console.log('push_data', push_data);
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
    <View style={tw`flex-col items-start justify-start bg-white pt-10`}>
      <Text style={tw`text-4xl mb-5 font-bold text-red-700 ml-5`}>
        Your relationship
      </Text>
      <View
        style={tw`flex-row justify-center items-center bg-red-100 rounded-md p-2 mb-5 h-30 w-100`}>
        <View style={tw`flex-col justify-center items-start`}>
          <TouchableOpacity
            onPress={() => {}}
            style={tw`flex-row justify-center items-center py-2 my-1 bg-orange-600 pr-5 rounded-xl `}>
            <Text style={tw`text-lg text-white px-3 font-bold`}>
              + Create a relic
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              giveMeetingAttestation(web3Provider, true, mySigner, address)
                .then(res => {
                  console.log('res', res);
                  setAttestation(res);
                })
                .catch(err => {
                  console.log('err', err);
                });
            }}
            style={tw`flex-row justify-center items-center py-2 my-1 bg-orange-600 pr-5 rounded-xl `}>
            <Text style={tw`text-lg text-white px-3 font-bold`}>
              + Meet & Attest {JSON.stringify(attestation)}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={tw`ml-5 flex-col justify-center items-start`}>
          <TouchableOpacity
            onPress={() => {}}
            style={tw`flex-row justify-center items-center my-2 py-2 bg-orange-600 pr-5 rounded-2xl `}>
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
