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
        flex-row
      `}>
        <Text style={tw`text-2xl mb-2 font-bold text-zinc-600`}>
          Preferred Groups:
        </Text>
        <FlatList
          style={tw`px-2`}
          data={selectedPreferences}
          renderItem={({item}) => (
            <View style={tw`border-2 border-gray-300 rounded-md p-2 m-2`}>
              <Text style={tw`text-2xl mb-2 font-bold text-zinc-600`}>
                {item.name}
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
          renderItem={({item}) => (
            <TouchableOpacity>
              <View style={tw`border-2 border-gray-300 rounded-md p-2 m-2`}>
                <Text style={tw`text-2xl mb-2 font-bold text-zinc-600`}>
                  {item.name}
                </Text>
                <Text>{item.description}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
      ) : (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size={150} color="#dc2626" />
        </View>
      )}
    </View>
  );
}
