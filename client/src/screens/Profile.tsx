import React, {useState, useEffect} from 'react';
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
import MasonryList from '@react-native-seoul/masonry-list';

export default function () {
  const [loading, setLoading] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState<any>([]);
  const [dataGroups, setDataGroups] = useState<any>([]);

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
        CryptoPunk #9999
      </Text>

      {/* NFT card with metadata*/}
      <View style={tw`flex-row items-start justify-center mx-5 mb-5`}>
        <Image
          style={tw`w-30 h-30 rounded-2xl`}
          source={require('../assets/cryptopunk.png')}
        />
        <View
          style={tw`flex-1 ml-5 items-start rounded-2xl justify-center bg-red-100 p-2 px-3`}>
          <Text style={tw`text-md mb-1`}>Owner: 0x1234567890</Text>
          <Text style={tw`text-md mb-1`}>Price: 0.1 ETH</Text>
          <Text style={tw`text-md mb-1`}>
            Description: This is a CryptoPunk
          </Text>
        </View>
      </View>

      <View
        style={tw`
        flex-row justify-center items-center bg-red-100 rounded-md p-2 mx-2 mb-5 h-30
      `}>
        <Text style={tw`text-sm mb-2 ml-4 font-bold text-zinc-600`}>
          Selected Preferences:
        </Text>
        <MasonryList
          style={tw`px-2`}
          horizontal={true}
          data={selectedPreferences}
          renderItem={(item: any) => (
            <View style={tw`bg-red-600 rounded-md p-2 m-2`}>
              <Text style={tw`text-sm mb-1 font-bold text-zinc-100`}>
                {JSON.stringify(item.item.item.name)}
              </Text>
            </View>
          )}
          keyExtractor={item => item.id}
        />
      </View>

      {loading ? (
        <FlatList
          style={tw`px-2`}
          data={dataGroups.groups}
          renderItem={(item: any) => (
            <TouchableOpacity
              onPress={() => {
                if (
                  selectedPreferences
                    .map((item: any) => JSON.stringify(item))
                    .includes(JSON.stringify(item))
                ) {
                  setSelectedPreferences(
                    selectedPreferences.filter((e: any) => e.id !== item.id),
                  );
                } else {
                  setSelectedPreferences([...selectedPreferences, item]);
                }
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
