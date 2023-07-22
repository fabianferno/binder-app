import {Chat, MessageType} from '@flyerhq/react-native-chat-ui';
import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import tw from 'twrnc';
import {SafeAreaProvider} from 'react-native-safe-area-context';

// For the testing purposes, you should probably use https://github.com/uuidjs/uuid
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r % 4) + 8;
    return v.toString(16);
  });
};

export default function () {
  const [messages, setMessages] = useState<MessageType.Any[]>([]);
  const user = {id: '06c33e8b-e835-4736-80f4-63f44b66666c'};

  const addMessage = (message: MessageType.Any) => {
    setMessages([message, ...messages]);
  };

  const handleSendPress = (message: MessageType.PartialText) => {
    const textMessage: MessageType.Text = {
      author: user,
      createdAt: Date.now(),
      id: uuidv4(),
      text: message.text,
      type: 'text',
    };
    addMessage(textMessage);
  };

  return (
    <ScrollView>
      <View style={tw`flex-col items-center justify-center bg-white pt-10`}>
        <Text style={tw`text-5xl mb-5 font-bold text-red-700 ml-5`}>
          The relationship
        </Text>
        <View
          style={tw`flex-row justify-center items-center bg-red-100 rounded-md p-2 mx-2 mb-5 h-30`}>
          <TouchableOpacity
            onPress={() => {}}
            style={tw`flex-row justify-center items-center my-2 py-2 bg-red-600 pr-5 rounded-xl `}>
            <Text style={tw`text-sm text-white px-3 font-bold`}>
              + Create a relic
            </Text>
          </TouchableOpacity>
          <View style={tw`ml-5 flex-col justify-center items-start`}>
            <TouchableOpacity
              onPress={() => {}}
              style={tw`flex-row justify-center items-center my-2 py-2 bg-red-600 pr-5 rounded-2xl `}>
              <Text style={tw`text-sm text-white px-3 font-bold`}>
                + Add link tokens
              </Text>
            </TouchableOpacity>
            <View style={tw`flex-row items-start justify-center mx-5 mb-5`}>
              <Text style={tw`text-sm mb-1`}>Balance: </Text>
              <Text style={tw`text-sm mb-1`}>0.1 ETH</Text>
            </View>
          </View>
        </View>
        <SafeAreaProvider style={tw`flex-1 w-100 h-75`}>
          <Chat messages={messages} onSendPress={handleSendPress} user={user} />
        </SafeAreaProvider>
      </View>
    </ScrollView>
  );
}
