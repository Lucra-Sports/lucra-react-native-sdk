import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Routes';
import {
  LucraSDK,
  type LucraFlowInfo,
} from '@lucra-sports/lucra-react-native-sdk';

type Props = NativeStackScreenProps<RootStackParamList, 'PushDeeplinkTester'>;

export const PushDeeplinkTester: React.FC<Props> = () => {
  const [link, setLink] = useState('');
  const [result, setResult] = useState<LucraFlowInfo | null>(null);
  const [output, setOutput] = useState<string>('');

  const resolveHeadlessly = async () => {
    if (!link.trim()) {
      Alert.alert('Error', 'Paste a Lucra deeplink first');
      return;
    }
    try {
      // Same payload shape a tapped push notification delivers; the
      // payload-extraction variants are covered by unit tests.
      const res = await LucraSDK.handleLucraNotification({
        deeplink: link.trim(),
      });
      setResult(res);
      setOutput(JSON.stringify(res, null, 2));
    } catch (e) {
      setResult(null);
      setOutput(`threw:\n${JSON.stringify(e, null, 2)}`);
    }
  };

  const presentResult = async () => {
    if (!result) {
      return;
    }
    try {
      await LucraSDK.present({
        name: result.flow,
        matchupId: result.matchupId,
      } as Parameters<typeof LucraSDK.present>[0]);
    } catch (e) {
      Alert.alert('present() threw', JSON.stringify(e));
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-3">
        <Text className="text-white text-lg">Push / Deeplink Tester</Text>
        <Text className="text-white text-xs">
          Paste a Lucra deeplink (e.g. from a created matchup share link), then
          resolve it headlessly. No Lucra UI should appear until you press
          Present.
        </Text>
        <TextInput
          value={link}
          onChangeText={setLink}
          placeholder="Lucra deeplink URL"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          className="border border-indigo-400 p-4 rounded-lg text-white"
        />
        <TouchableOpacity
          className="bg-indigo-700 p-4 rounded-xl"
          onPress={resolveHeadlessly}
        >
          <Text className="text-white">Resolve headlessly (no UI)</Text>
        </TouchableOpacity>
        {output !== '' && (
          <View className="border border-indigo-400 p-4 rounded-lg">
            <Text className="text-white font-mono text-xs">{output}</Text>
          </View>
        )}
        {result && (
          <TouchableOpacity
            className="bg-green-700 p-4 rounded-xl"
            onPress={presentResult}
          >
            <Text className="text-white">
              Present result ({result.flow}
              {result.matchupId ? `, ${result.matchupId}` : ''})
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
