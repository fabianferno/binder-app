import React, {useEffect, useState} from 'react';
import {View, Text, Image, ScrollView} from 'react-native';
import tw from 'twrnc';

export default function () {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      nft: 'Cryptopunks',
      image: 'https://picsum.photos/200/300',
      signer: 'sd98ys98hdcnidca;dincca9n8sdyah8schni asdjasca',
      zkProof: 'sd98ys98hdcnidca;dincca9n8sdyah8schni asdjasca',
    },
    {
      id: 2,
      nft: 'Bored Ape Yacht Club',
      image: 'https://picsum.photos/200/300',
      signer: 'sd98ys98hdcnidca;dincca9n8sdyah8schni asdjasca',
      zkProof: 'sd98ys98hdcnidca;dincca9n8sdyah8schni asdjasca',
    },
    {
      id: 3,
      nft: 'Nouns DAO',
      image: 'https://picsum.photos/200/300',
      signer: 'sd98ys98hdcnidca;dincca9n8sdyah8schni asdjasca',
      zkProof: 'sd98ys98hdcnidca;dincca9n8sdyah8schni asdjasca',
    },
  ]);

  useEffect(() => {
    setNotifications(notifications);
  }, [notifications]);

  return (
    <View style={tw`flex-1 justify-center items-start mt-5 p-5`}>
      <Text style={tw`text-5xl font-bold mt-5 text-red-600`}>Your matches</Text>
      <Text style={tw`text-xl mb-7 `}>Click to approve relationship</Text>

      <ScrollView>
        <View style={tw`flex-1 justify-center items-start`}>
          {notifications.map((notification, index) => {
            return (
              <View
                key={index}
                style={tw`flex-1 flex-row justify-center items-center my-2 py-2 bg-orange-600 pr-5 rounded-2xl `}>
                <Image
                  style={tw`w-25 h-20 rounded-2xl shadow-xl`}
                  source={{
                    uri: notification.image,
                  }}
                />
                <View style={tw` ml-3`}>
                  <Text style={tw`text-2xl text-white w-75 font-bold`}>
                    {notification.nft}
                  </Text>
                  <Text style={tw`text-lg text-white`}>
                    Signer: 0x{notification.signer.slice(0, 9)}...
                  </Text>
                  <Text style={tw`text-lg text-white`}>
                    zkProof verified ✅
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
