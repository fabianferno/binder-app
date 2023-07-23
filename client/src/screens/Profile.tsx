import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import tw from 'twrnc';
import {sismoCall} from '../utils/Sismo';

import {ethers} from 'ethers';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';

export default function () {
  const {provider, address} = useWalletConnectModal();

  const [loading, setLoading] = useState(false);
  const [selectedPreference, setSelectedPreference] = useState<any>([]);
  const [dataGroups, setDataGroups] = useState<any>([]);

  const web3Provider = useMemo(
    () => (provider ? new ethers.providers.Web3Provider(provider) : undefined),
    [provider],
  );

  useEffect(() => {
    sismoCall()
      .then(data => {
        setDataGroups(data);
      })
      .then(() => {
        setLoading(true);
      });
  }, []);
  return (
    <View style={tw`flex-col items-start justify-center bg-white pt-10`}>
      <Text style={tw`text-5xl mb-5 font-bold text-red-700 ml-5`}>
        Nouns DAO #9979
      </Text>

      {/* NFT card with metadata*/}
      <View style={tw`flex-row items-start justify-center mx-5 mb-5`}>
        <Image
          style={tw`w-30 h-30 rounded-2xl`}
          source={require('../assets/nouns.png')}
        />
        <View
          style={tw`flex-1 ml-5 items-start rounded-2xl justify-center bg-red-100 p-2 px-3`}>
          <Text style={tw`text-md mb-1`}>Owner: 0x1234567890</Text>
          <Text style={tw`text-md mb-1`}>Price: 0.1 ETH</Text>
          <Text style={tw`text-md mb-1`}>Description: This is a Nouns DAO</Text>
        </View>
      </View>

      <View
        style={tw`
        flex-row justify-center items-center bg-red-100 w-100 rounded-md p-2 mx-2 mb-1 h-20
      `}>
        <Text style={tw`text-sm mb-2 ml-4 font-bold text-zinc-600`}>
          Selected Preferences:
        </Text>
        {selectedPreference?.item?.name && (
          <View style={tw`bg-orange-600 rounded-md p-2 m-2`}>
            <Text style={tw`text-sm mb-1 font-bold text-zinc-100`}>
              {JSON.stringify(selectedPreference.item.name)}
            </Text>
          </View>
        )}
      </View>
      {loading ? (
        <FlatList
          style={tw`px-2`}
          data={dataGroups.groups}
          renderItem={(item: any) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedPreference(item);
              }}>
              <View style={tw`border-2 border-gray-300 rounded-md p-2 m-2`}>
                <Text style={tw`text-2xl mb-2 font-bold text-zinc-600`}>
                  {item.item.name}
                </Text>
                <Text>{item.item.description}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
      ) : (
        <View style={tw`flex-1 items-center justify-center mt-24`}>
          <ActivityIndicator size={150} color="#dc2626" />
        </View>
      )}
    </View>
  );
}
