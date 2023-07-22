import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import tw from 'twrnc';

export default function () {
  return (
    <View style={tw`flex-1 justify-center items-center bg-white mt-10`}>
      <Text style={tw`text-5xl font-bold text-red-600 mb-2`}>
        A list of all relationships of this use
      </Text>

      <ScrollView>
        <View style={tw`flex-1 justify-center items-start`}>
          <View
            style={tw`flex-1 flex-row justify-center items-center my-2 py-2 bg-red-600 pr-5 rounded-2xl `}>
            <View style={tw` ml-3`}>
              <Text style={tw`text-2xl text-white w-75 font-bold`}>
                0x1234567890
              </Text>
              <Text style={tw`text-lg text-white`}>Signer: 0x1234567890</Text>
              <Text style={tw`text-lg text-white`}>zkProof verified ✅</Text>
            </View>
          </View>

          <View
            style={tw`flex-1 flex-row justify-center items-center my-2 py-2 bg-red-600 pr-5 rounded-2xl `}>
            <View style={tw` ml-3`}>
              <Text style={tw`text-2xl text-white w-75 font-bold`}>
                0x1234567890
              </Text>
              <Text style={tw`text-lg text-white`}>Signer: 0x1234567890</Text>
              <Text style={tw`text-lg text-white`}>zkProof verified ✅</Text>
            </View>
          </View>

          <View
            style={tw`flex-1 flex-row justify-center items-center my-2 py-2 bg-red-600 pr-5 rounded-2xl `}>
            <View style={tw` ml-3`}>
              <Text style={tw`text-2xl text-white w-75 font-bold`}>
                0x1234567890
              </Text>
              <Text style={tw`text-lg text-white`}>Signer: 0x1234567890</Text>
              <Text style={tw`text-lg text-white`}>zkProof verified ✅</Text>
            </View>
          </View>

          <View
            style={tw`flex-1 flex-row justify-center items-center my-2 py-2 bg-red-600 pr-5 rounded-2xl `}>
            <View style={tw` ml-3`}>
              <Text style={tw`text-2xl text-white w-75 font-bold`}>
                0x1234567890
              </Text>
              <Text style={tw`text-lg text-white`}>Signer: 0x1234567890</Text>
              <Text style={tw`text-lg text-white`}>zkProof verified ✅</Text>
            </View>
          </View>

          <View
            style={tw`flex-1 flex-row justify-center items-center my-2 py-2 bg-red-600 pr-5 rounded-2xl `}>
            <View style={tw` ml-3`}>
              <Text style={tw`text-2xl text-white w-75 font-bold`}>
                0x1234567890
              </Text>
              <Text style={tw`text-lg text-white`}>Signer: 0x1234567890</Text>
              <Text style={tw`text-lg text-white`}>zkProof verified ✅</Text>
            </View>
          </View>

          <View
            style={tw`flex-1 flex-row justify-center items-center my-2 py-2 bg-red-600 pr-5 rounded-2xl `}>
            <View style={tw` ml-3`}>
              <Text style={tw`text-2xl text-white w-75 font-bold`}>
                0x1234567890
              </Text>
              <Text style={tw`text-lg text-white`}>Signer: 0x1234567890</Text>
              <Text style={tw`text-lg text-white`}>zkProof verified ✅</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
