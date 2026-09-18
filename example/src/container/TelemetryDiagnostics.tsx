import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  LucraSDK,
  type LucraTelemetryLevel,
} from '@lucra-sports/lucra-react-native-sdk';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';

type Props = NativeStackScreenProps<RootStackParamList, 'TelemetryDiagnostics'>;

const CATEGORY = 'SampleDiagnostics';

const LEVELS: LucraTelemetryLevel[] = ['info', 'warning', 'error'];

const KINDS: Record<
  LucraTelemetryLevel,
  { title: string; action: string; explanation: string }
> = {
  info: {
    title: 'Info',
    action: 'Add info breadcrumb',
    explanation:
      'Info breadcrumb. Stays on the device until the next error event carries it along. No Sentry alert.',
  },
  warning: {
    title: 'Warning',
    action: 'Add warning breadcrumb',
    explanation:
      'Warning breadcrumb. Same as info, shown at warning level in the trail. No Sentry alert.',
  },
  error: {
    title: 'Error',
    action: 'Send error event (alerts)',
    explanation:
      "Non-fatal error event. Creates an issue in the Lucra SDK's Sentry project for this platform and triggers Sentry alert emails.",
  },
};

type SentEntry = { id: string; line: string };

export const TelemetryDiagnostics: React.FC<Props> = ({ navigation }) => {
  const [level, setLevel] = useState<LucraTelemetryLevel>('info');
  const [message, setMessage] = useState('Manual test message from RN Example');
  const [sent, setSent] = useState<SentEntry[]>([]);
  const kind = KINDS[level];
  const trimmed = message.trim();

  const record = (line: string) => {
    const stamp = new Date().toLocaleTimeString();
    setSent((entries) => [
      { id: `${Date.now()}-${entries.length}`, line: `${stamp}  ${line}` },
      ...entries,
    ]);
  };

  const send = async () => {
    if (!trimmed) {
      return;
    }
    try {
      await LucraSDK.logTelemetry({
        level,
        message: trimmed,
        category: CATEGORY,
      });
      record(`${kind.title}: ${trimmed}`);
    } catch (e) {
      const detail =
        e instanceof Error
          ? `${(e as Error & { code?: string }).code ?? e.name}: ${e.message}`
          : JSON.stringify(e);
      record(`${kind.title} failed: ${detail}`);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={Assets.ChevronLeft}
              className="h-8 w-8"
              tintColor={'white'}
            />
          </TouchableOpacity>
          <Text className="text-white text-lg">Telemetry Diagnostics</Text>
        </View>

        <Text className="text-white">Type</Text>
        <View className="flex-row gap-0.5">
          {LEVELS.map((value) => (
            <TouchableOpacity
              key={value}
              className={`flex-1 p-3 items-center ${
                value === level ? 'bg-indigo-500' : 'bg-indigo-900'
              }`}
              onPress={() => setLevel(value)}
            >
              <Text className="text-white">{KINDS[value].title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text className="text-indigo-200 text-xs">{kind.explanation}</Text>

        <Text className="text-white">Message</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Message"
          placeholderTextColor="#999"
          autoCapitalize="sentences"
          className="border border-indigo-400 p-4 rounded-lg text-white"
        />

        <TouchableOpacity
          className={`p-4 rounded-xl ${
            trimmed ? 'bg-indigo-700' : 'bg-indigo-900'
          }`}
          disabled={!trimmed}
          onPress={send}
        >
          <Text className="text-white">{kind.action}</Text>
        </TouchableOpacity>

        <Text className="text-white">Sent this session</Text>
        {sent.length === 0 ? (
          <Text className="text-neutral-400">Nothing yet</Text>
        ) : (
          <View className="border border-indigo-400 p-4 rounded-lg gap-1">
            {sent.map((entry) => (
              <Text key={entry.id} className="text-white font-mono text-xs">
                {entry.line}
              </Text>
            ))}
          </View>
        )}

        <Text className="text-indigo-200 text-xs">
          Everything goes through the native SDK's logger fan-out to the Lucra
          SDK Sentry project for this platform, tagged lucra.category ={' '}
          {CATEGORY} on iOS and prefixed as [{CATEGORY}] on Android, with this
          app's bundle id, environment and the signed-in user id. Breadcrumbs
          are stored on the device and attach to the next error event; only an
          error creates an event and an alert email. Nothing shows in the Sentry
          UI while the org error quota is exhausted; the on-disk envelope cache
          still fills.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};
