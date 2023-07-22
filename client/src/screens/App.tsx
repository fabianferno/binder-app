import React from 'react';
import '@walletconnect/react-native-compat';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Landing from './Landing';
import Swiper from './Swiper';
import Home from './Home';
import CreateProfile from './CreateProfile';
import Profile from './Profile';
import NFTChat from './NFTChat';
import Matches from './Matches';
import AllRelationships from './AllRelationships';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Landing"
          component={Landing}
          options={{title: 'Welcome, please connect your wallet.'}}
        />
        <Stack.Screen name="CreateProfile" component={CreateProfile} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Swiper" component={Swiper} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Matches" component={Matches} />
        <Stack.Screen name="NFTChat" component={NFTChat} />
        <Stack.Screen name="AllRelationships" component={AllRelationships} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
