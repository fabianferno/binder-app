import React from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import tw from 'twrnc';

export default function (props: any) {
  return (
    <View style={tw`justify-center items-start mx-5 bg-white mt-10`}>
      <Text style={tw`text-4xl font-bold text-red-600 mb-2`}>
        Here goes, all the relationships you made.
      </Text>

      <ScrollView>
        <View style={tw`flex-1 justify-center items-start`}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('Relationship');
            }}>
            <View
              style={tw`flex-row justify-center items-center my-2 py-2 bg-red-600 pr-5 rounded-2xl `}>
              <View style={tw` ml-3`}>
                <Text style={tw`text-2xl text-white w-75 font-bold`}>
                  0x1234567890
                </Text>
                <Text style={tw`text-lg text-white`}>Signer: 0x1234567890</Text>
                <Text style={tw`text-lg text-white`}>zkProof verified ✅</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('Relationship');
            }}>
            <View
              style={tw`flex-row justify-center items-center my-2 py-2 bg-red-600 pr-5 rounded-2xl `}>
              <View style={tw` ml-3`}>
                <Text style={tw`text-2xl text-white w-75 font-bold`}>
                  0x1234567890
                </Text>
                <Text style={tw`text-lg text-white`}>Signer: 0x1234567890</Text>
                <Text style={tw`text-lg text-white`}>zkProof verified ✅</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('Relationship');
            }}>
            <View
              style={tw`flex-row justify-center items-center my-2 py-2 bg-red-600 pr-5 rounded-2xl `}>
              <View style={tw` ml-3`}>
                <Text style={tw`text-2xl text-white w-75 font-bold`}>
                  0x1234567890
                </Text>
                <Text style={tw`text-lg text-white`}>Signer: 0x1234567890</Text>
                <Text style={tw`text-lg text-white`}>zkProof verified ✅</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('Relationship');
            }}>
            <View
              style={tw`flex-row justify-center items-center my-2 py-2 bg-red-600 pr-5 rounded-2xl `}>
              <View style={tw` ml-3`}>
                <Text style={tw`text-2xl text-white w-75 font-bold`}>
                  0x1234567890
                </Text>
                <Text style={tw`text-lg text-white`}>Signer: 0x1234567890</Text>
                <Text style={tw`text-lg text-white`}>zkProof verified ✅</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
