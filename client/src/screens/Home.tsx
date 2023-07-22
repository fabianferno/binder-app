import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import tw from 'twrnc';

function NavButton(props: any) {
  return (
    <TouchableOpacity
      style={tw`py-3 rounded-3xl mb-2`}
      onPress={() => {
        props.navigation.navigate(props.screenName);
      }}>
      <Text style={tw`text-white text-left text-2xl font-bold`}>
        {props.text} ▸
      </Text>
      <View
        style={{
          borderBottomColor: 'white',
          borderBottomWidth: 1,
        }}
      />
    </TouchableOpacity>
  );
}

export default function (props: any) {
  return (
    <View style={tw`flex-1 justify-center items-start px-6`}>
      <Text style={tw`text-5xl font-bold text-red-600 mb-2`}>
        Hello there ✨
      </Text>
      <Text style={tw`w-50 text-2xl text-slate-600 mb-20`}>
        Let's get started!
      </Text>
      <View style={tw`bg-red-600 pl-4 rounded-3xl w-100 h-auto py-2`}>
        <NavButton
          navigation={props.navigation}
          screenName="Swiper"
          text="😏 Start Swiping"
        />
        <NavButton
          navigation={props.navigation}
          screenName="Matches"
          text="☃️ Your matches"
        />
        <NavButton
          navigation={props.navigation}
          screenName="Profile"
          text="📜 Profile"
        />
        <NavButton
          navigation={props.navigation}
          screenName="CreateProfile"
          text="📜 Create Profile"
        />
        <NavButton
          navigation={props.navigation}
          screenName="AllRelationships"
          text="🪴 Your relationships"
        />
      </View>
    </View>
  );
}
