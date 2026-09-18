import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Routes';
import {
  LucraSDK,
  type LucraHandshakeAuthError,
  type LucraHandshakeAuthFailure,
} from '@lucra-sports/lucra-react-native-sdk';

type Props = NativeStackScreenProps<RootStackParamList, 'HandshakeAuth'>;

export const HandshakeAuth: React.FC<Props> = () => {
  const [token, setToken] = useState('');
  const [registered, setRegistered] = useState(false);
  const [bypassTos, setBypassTos] = useState(false);
  const [inFlight, setInFlight] = useState(false);
  const [error, setError] = useState<LucraHandshakeAuthFailure | null>(null);
  const [output, setOutput] = useState('');
  // Lucra calls the provider on its own schedule, so it has to read whatever is
  // in the field at that moment rather than close over the first render's value.
  const tokenRef = useRef(token);
  tokenRef.current = token;

  useEffect(() => {
    return LucraSDK.addHandshakeAuthListener({
      onError: setError,
      onInFlightChange: setInFlight,
    });
  }, []);

  const registerProvider = () => {
    LucraSDK.registerHandshakeAuthTokenProvider(
      async () => {
        // A real integration fetches a freshly signed token from its own
        // backend here; tokens are single use and expire in about a minute.
        const pasted = tokenRef.current.trim();
        if (!pasted) {
          throw new Error('No token pasted into the example app');
        }
        return pasted;
      },
      { bypassTosAgreement: bypassTos }
    );
    setRegistered(true);
    setOutput('Provider registered. Nobody is signed in yet.');
  };

  const clearProvider = () => {
    LucraSDK.registerHandshakeAuthTokenProvider(null);
    setRegistered(false);
    setOutput('Provider cleared. Lucra flows fall back to phone auth.');
  };

  const signIn = async () => {
    try {
      const user = await LucraSDK.signInWithHandshakeAuth();
      setOutput(JSON.stringify(user, null, 2));
    } catch (e) {
      const handshakeError = e as LucraHandshakeAuthError;
      setOutput(
        `${handshakeError.code}\n${handshakeError.message}\n${handshakeError.recoverySuggestion}`
      );
      if (handshakeError.code === 'tosNotAccepted') {
        // The one failure phone auth cannot fix: this flow captures the
        // agreement and finishes the sign-in itself.
        LucraSDK.present({ name: LucraSDK.FLOW.HANDSHAKE_TOS }).catch(
          (presentError) =>
            Alert.alert('present() threw', JSON.stringify(presentError))
        );
      }
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-3">
        <Text className="text-white text-lg">Handshake Auth</Text>
        <Text className="text-white text-xs">
          Paste a partner-signed JWT for the user you want to sign in. Handshake
          auth needs Lucra-side tenant provisioning and a backend holding the
          signing key, so this screen stands in for that backend.
        </Text>
        <TextInput
          value={token}
          onChangeText={setToken}
          placeholder="Partner-signed JWT"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          className="border border-indigo-400 p-4 rounded-lg text-white"
        />
        <TouchableOpacity
          className="flex-row justify-between border border-indigo-400 p-4 rounded-lg"
          onPress={() => setBypassTos((value) => !value)}
        >
          <Text className="text-white">Request Terms of Service bypass</Text>
          <Text className="text-white">{bypassTos ? 'on' : 'off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-indigo-700 p-4 rounded-xl"
          onPress={registerProvider}
        >
          <Text className="text-white">Register provider</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-indigo-700 p-4 rounded-xl"
          onPress={clearProvider}
        >
          <Text className="text-white">Clear provider</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-green-700 p-4 rounded-xl"
          onPress={signIn}
        >
          <Text className="text-white">Sign in with handshake auth</Text>
        </TouchableOpacity>
        <Text className="text-indigo-400 text-xs">
          Provider {registered ? 'registered' : 'not registered'} —{' '}
          {inFlight ? 'exchange in flight' : 'idle'}
        </Text>
        {error && (
          <View className="border border-red-400 p-4 rounded-lg">
            <Text className="text-white text-xs">{error.code}</Text>
            <Text className="text-white text-xs">{error.message}</Text>
            <Text className="text-indigo-400 text-xs">
              {error.recoverySuggestion}
            </Text>
          </View>
        )}
        {output !== '' && (
          <View className="border border-indigo-400 p-4 rounded-lg">
            <Text className="text-white font-mono text-xs">{output}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
