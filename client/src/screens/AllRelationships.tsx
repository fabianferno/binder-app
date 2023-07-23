import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, Image} from 'react-native';
import tw from 'twrnc';

export default function (props: any) {
  return (
    <View style={tw`justify-center items-start mx-5 bg-white mt-10`}>
      <Text style={tw`text-4xl font-bold text-red-600 mb-2`}>
        Here goes, all the relationships you made.
      </Text>

      <ScrollView>
        <View style={tw`flex-1 h-100 justify-center items-start`}>
          <View
            style={tw`flex-1 flex-row justify-center items-center my-2 py-2 bg-orange-600 pr-5 rounded-2xl `}>
            <Image
              style={tw`w-25 h-20 rounded-2xl shadow-xl`}
              source={{
                uri: 'https://d7hftxdivxxvm.cloudfront.net/?height=800&quality=80&resize_to=fit&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FZEQ2dmwihfVRTvrUP2A0Ow%2Fnormalized.jpg&width=800',
              }}
            />
            <View style={tw` ml-3`}>
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate('Relationship');
                }}>
                <Text style={tw`text-2xl text-white w-75 font-bold`}>
                  ApeCoin DAO #310
                </Text>
              </TouchableOpacity>
              <Text style={tw`text-lg text-white`}>zkProof verified ✅</Text>
            </View>
          </View>
          <View
            style={tw`flex-1 flex-row justify-center items-center my-2 py-2 bg-orange-600 pr-5 rounded-2xl `}>
            <Image
              style={tw`w-25 h-20 rounded-2xl shadow-xl`}
              source={{
                uri: 'https://brave.com/static-assets/images/optimized/nouns-dao/images/image3.webp',
              }}
            />
            <View style={tw` ml-3`}>
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate('Relationship');
                }}>
                <Text style={tw`text-2xl text-white w-75 font-bold`}>
                  Nouns DAO #827
                </Text>
              </TouchableOpacity>
              <Text style={tw`text-lg text-white`}>zkProof verified ✅</Text>
            </View>
          </View>
          <View
            style={tw`flex-1 flex-row justify-center items-center my-2 py-2 bg-orange-600 pr-5 rounded-2xl `}>
            <Image
              style={tw`w-25 h-20 rounded-2xl shadow-xl`}
              source={{
                uri: 'https://brave.com/static-assets/images/optimized/nouns-dao/images/image3.webp',
              }}
            />
            <View style={tw` ml-3`}>
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate('Relationship');
                }}>
                <Text style={tw`text-2xl text-white w-75 font-bold`}>
                  Nouns DAO #4352
                </Text>
              </TouchableOpacity>
              <Text style={tw`text-lg text-white`}>zkProof verified ✅</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
