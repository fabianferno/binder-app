import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

export default function (props: any) {
  return (
    <View>
      <Text>Good day! What do you want to do today?</Text>
      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate('Notifications');
        }}>
        <Text>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate('NFTChat');
        }}>
        <Text>Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate('Profile');
        }}>
        <Text>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}
