import React, {useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  Image,
  View,
  ScrollView,
} from 'react-native';
import '@walletconnect/react-native-compat';
import {
  useWalletConnectModal,
  WalletConnectModal,
} from '@walletconnect/modal-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import tw from 'twrnc';

// @ts-expect-error - `@env` is a virtualised module via Babel config.
import {ENV_PROJECT_ID} from '@env';

import {DarkTheme, LightTheme} from '../constants/Colors';
import {providerMetadata, sessionParams} from '../constants/Config';

function Landing(props: any) {
  const isDarkMode = useColorScheme() === 'dark';
  const {isConnected, provider, open} = useWalletConnectModal();

  const backgroundColor = isDarkMode
    ? DarkTheme.background2
    : LightTheme.background2;

  const onCopy = (value: string) => {
    Clipboard.setString(value);
  };

  const handleButtonPress = async () => {
    if (isConnected) {
      return provider?.disconnect();
    }
    return open();
  };

  useEffect(() => {
    if (isConnected) {
      // TODO: If zkPreferences are already set move to Home else CreateProfile
      // if (zkPreferencesAreSet) {
      //   props.navigation.navigate('Home');
      // }
      props.navigation.navigate('Home');
    }
    // async function getClientId() {
    //   if (provider && isConnected) {
    //     const _clientId = await provider?.client?.core.crypto.getClientId();
    //     setClientId(_clientId);
    //   } else {
    //     setClientId(undefined);
    //   }
    // }

    // getClientId();
  }, [isConnected, provider]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor}]}>
      <ScrollView>
        <View style={[styles.container, {backgroundColor}]}>
          <Image
            style={{width: 300, height: 400, marginBottom: -40, marginTop: 40}}
            source={require('../assets/binder.png')}
          />
          <Text style={tw`text-xl font-bold text-center text-slate-600 mb-10`}>
            Anon Dating App w/ 6551 Tokens 😏
          </Text>

          {/* {clientId && (
            <TouchableOpacity
              style={tw`py-3 rounded-3xl mb-2`}
              onPress={() => onCopy(clientId)}>
              <Text style={[styles.propTitle, isDarkMode && styles.darkText]}>
                {'Client ID:'}{' '}
                <Text style={[styles.propValue, isDarkMode && styles.darkText]}>
                  {clientId}
                </Text>
              </Text>
            </TouchableOpacity>
          )} */}

          {isConnected ? (
            <TouchableOpacity
              style={tw` bg-red-600 px-4 py-3 rounded-xl mb-2`}
              onPress={() => {
                props.navigation.navigate('Home');
              }}>
              <Text style={tw`text-white text-3xl font-bold`}>Get Started</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.centerContainer}>
              <TouchableOpacity
                style={tw` bg-red-600 px-4 py-3 rounded-xl mb-2`}
                onPress={handleButtonPress}>
                <Text style={tw`text-white text-3xl font-bold`}>
                  {isConnected ? 'Disconnect' : 'Connect Wallet'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <WalletConnectModal
            projectId={ENV_PROJECT_ID}
            providerMetadata={providerMetadata}
            sessionParams={sessionParams}
            onCopyClipboard={onCopy}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Landing;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 64,
    padding: 16,
    borderColor: LightTheme.accent,
    backgroundColor: LightTheme.background2,
    borderWidth: 1,
    borderRadius: 16,
    shadowColor: LightTheme.foreground1,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    elevation: 4,
  },
  cardDark: {
    backgroundColor: DarkTheme.background2,
    borderColor: DarkTheme.accent,
    shadowColor: DarkTheme.foreground1,
    shadowOpacity: 0.5,
  },
  propTitle: {
    fontWeight: 'bold',
  },
  propValue: {
    fontWeight: 'normal',
  },
  darkText: {
    color: DarkTheme.foreground1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  centerContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3396FF',
    borderRadius: 20,
    width: 200,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 4,
  },
  text: {
    color: 'white',
    fontWeight: '700',
  },
});
