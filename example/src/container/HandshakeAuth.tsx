import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  LucraSDK,
  useAuthState,
  type LucraHandshakeAuthError,
} from '@lucra-sports/lucra-react-native-sdk';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';

type Props = NativeStackScreenProps<RootStackParamList, 'HandshakeAuth'>;

/**
 * How the registered token provider behaves. Each mode exists to drive a
 * different native failure, so every `LucraHandshakeAuthError` code is
 * reachable from the device without a backend.
 */
type ProviderMode = 'working' | 'throwing' | 'hanging' | 'empty';

const PROVIDER_MODES: {
  mode: ProviderMode;
  title: string;
  expectation: string;
}[] = [
  {
    mode: 'working',
    title: 'Working',
    expectation:
      'Returns the token pasted below. Tokens are valid for ~60s, so a stale paste shows exchangeFailed.',
  },
  {
    mode: 'throwing',
    title: 'Throws',
    expectation:
      'Rejects immediately. Expect providerFailed carrying this screen’s own error message.',
  },
  {
    mode: 'hanging',
    title: 'Hangs',
    expectation:
      'Never settles. Expect providerTimedOut after the native SDK’s 5s budget — nothing on the JS side races it.',
  },
  {
    mode: 'empty',
    title: 'Empty',
    expectation:
      'Returns an empty string. The bridge rejects it in JS so it surfaces as providerFailed, not a confusing exchangeFailed.',
  },
];

type LogEntry = { id: string; line: string };

export const HandshakeAuth: React.FC<Props> = ({ navigation }) => {
  const [token, setToken] = useState('');
  const [mode, setMode] = useState<ProviderMode>('working');
  const [bypassTos, setBypassTos] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [needsTos, setNeedsTos] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const authState = useAuthState();

  const record = useCallback((line: string) => {
    const stamp = new Date().toLocaleTimeString();
    setLog((entries) => [
      { id: `${Date.now()}-${entries.length}`, line: `${stamp}  ${line}` },
      ...entries,
    ]);
  }, []);

  // Read at call time rather than captured, so switching modes takes effect
  // without re-registering.
  const modeRef = React.useRef(mode);
  modeRef.current = mode;
  const tokenRef = React.useRef(token);
  tokenRef.current = token;

  const provider = useCallback(async () => {
    record(`provider called (${modeRef.current})`);
    switch (modeRef.current) {
      case 'throwing':
        throw new Error('Demo: partner backend returned 503');
      case 'hanging':
        return new Promise<string>(() => {});
      case 'empty':
        return '';
      default:
        return tokenRef.current.trim();
    }
  }, [record]);

  const register = async () => {
    try {
      await LucraSDK.registerHandshakeAuthTokenProvider(provider, {
        bypassTosAgreement: bypassTos,
      });
      setRegistered(true);
      record(`registered (bypassTosAgreement: ${bypassTos})`);
    } catch (e) {
      record(`register failed: ${describe(e)}`);
    }
  };

  const unregister = async () => {
    try {
      await LucraSDK.registerHandshakeAuthTokenProvider(null);
      setRegistered(false);
      record('unregistered — Lucra falls back to phone auth');
    } catch (e) {
      record(`unregister failed: ${describe(e)}`);
    }
  };

  const signIn = async () => {
    setNeedsTos(false);
    record('signInWithHandshakeAuth…');
    try {
      const user = await LucraSDK.signInWithHandshakeAuth();
      record(`signed in as ${user.username ?? user.id}`);
    } catch (e) {
      const error = e as LucraHandshakeAuthError;
      record(`sign-in failed: ${describe(e)}`);
      // The one failure that must NOT fall back to phone auth: phone auth
      // cannot create the account either.
      if (error?.code === 'tosNotAccepted') {
        setNeedsTos(true);
      }
    }
  };

  const presentTos = () => {
    LucraSDK.present({ name: LucraSDK.FLOW.HANDSHAKE_TOS }).catch((e) =>
      record(`present HANDSHAKE_TOS failed: ${describe(e)}`)
    );
  };

  const logout = async () => {
    try {
      await LucraSDK.logout();
      record('logged out — the next sign-in runs a real exchange again');
    } catch (e) {
      record(`logout failed: ${describe(e)}`);
    }
  };

  const selected = useMemo(
    () => PROVIDER_MODES.find((m) => m.mode === mode)!,
    [mode]
  );
  const canSignIn = mode !== 'working' || token.trim().length > 0;

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
          <Text className="text-white text-lg">Handshake Auth</Text>
        </View>

        <Text className="text-indigo-200 text-xs">
          Signs the user into Lucra from a token your own backend signs — no
          Lucra login screen. Mint a token out of band and paste it below; the
          signing key must never ship in the app, which is exactly why the
          provider is a callback.
        </Text>

        <Text className="text-white">Token (HS256 JWT, valid ~60s)</Text>
        <TextInput
          value={token}
          onChangeText={setToken}
          placeholder="eyJhbGciOiJIUzI1NiIs..."
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          className="border border-indigo-400 p-4 rounded-lg text-white font-mono text-xs"
        />

        <Text className="text-white">Provider behaviour</Text>
        <View className="flex-row gap-0.5">
          {PROVIDER_MODES.map(({ mode: value, title }) => (
            <TouchableOpacity
              key={value}
              className={`flex-1 p-3 items-center ${
                value === mode ? 'bg-indigo-500' : 'bg-indigo-900'
              }`}
              onPress={() => setMode(value)}
            >
              <Text className="text-white text-xs">{title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text className="text-indigo-200 text-xs">{selected.expectation}</Text>

        <View className="flex-row items-center justify-between py-1">
          <Text className="text-white flex-1 pr-2">
            bypassTosAgreement
            <Text className="text-indigo-200 text-xs">
              {'\n'}Honored only where your tenant allows it; otherwise silently
              ignored.
            </Text>
          </Text>
          <Switch value={bypassTos} onValueChange={setBypassTos} />
        </View>

        <View className="flex-row gap-0.5">
          <TouchableOpacity
            className="flex-1 p-4 rounded-l-xl bg-indigo-700"
            onPress={register}
          >
            <Text className="text-white text-center">Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 p-4 rounded-r-xl ${
              registered ? 'bg-indigo-700' : 'bg-indigo-900'
            }`}
            onPress={unregister}
          >
            <Text className="text-white text-center">Unregister</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className={`p-4 rounded-xl ${
            canSignIn ? 'bg-indigo-700' : 'bg-indigo-900'
          }`}
          disabled={!canSignIn}
          onPress={signIn}
        >
          <Text className="text-white text-center">
            signInWithHandshakeAuth
          </Text>
        </TouchableOpacity>

        {needsTos ? (
          <View className="border border-amber-400 p-4 rounded-lg gap-2">
            <Text className="text-amber-200 text-xs">
              This user is new to Lucra and has not accepted the Terms of
              Service. Phone auth cannot create the account either — present
              HANDSHAKE_TOS. The SDK captures the agreement and resubmits the
              sign-in itself, so watch the user listener rather than the promise
              above.
            </Text>
            <TouchableOpacity
              className="p-4 rounded-xl bg-amber-600"
              onPress={presentTos}
            >
              <Text className="text-white text-center">
                Accept Terms of Service
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity
          className="p-4 rounded-xl bg-indigo-900"
          onPress={logout}
        >
          <Text className="text-white text-center text-xs">Logout</Text>
        </TouchableOpacity>
        <Text className="text-indigo-200 text-xs">
          An existing session wins, so without logging out every later sign-in
          short-circuits to the cached user and none of the failure modes run.
        </Text>

        <Text className="text-white">Auth state (live)</Text>
        <View className="border border-indigo-400 p-4 rounded-lg gap-1">
          <Text className="text-white font-mono text-xs">
            isHandshakeAuthInFlight: {String(authState.isHandshakeAuthInFlight)}
          </Text>
          <Text className="text-white font-mono text-xs">
            isResolvingAuthState:{' '}
            {authState.isResolvingAuthState === null
              ? 'null (iOS only)'
              : String(authState.isResolvingAuthState)}
          </Text>
          <Text className="text-white font-mono text-xs">
            handshakeAuthError:{' '}
            {authState.handshakeAuthError
              ? authState.handshakeAuthError.code
              : 'none'}
          </Text>
          {authState.handshakeAuthError ? (
            <>
              <Text className="text-neutral-300 font-mono text-xs">
                {authState.handshakeAuthError.message}
              </Text>
              {authState.handshakeAuthError.recoverySuggestion ? (
                <Text className="text-amber-200 font-mono text-xs">
                  {authState.handshakeAuthError.recoverySuggestion}
                </Text>
              ) : null}
            </>
          ) : null}
        </View>
        <Text className="text-indigo-200 text-xs">
          This is the last failure, not a live one — it is cleared when the next
          exchange starts. It is also how you see failures the SDK triggers
          itself (presenting a flow while signed out), which never come back
          through a promise.
        </Text>

        <Text className="text-white">Log</Text>
        {log.length === 0 ? (
          <Text className="text-neutral-400">Nothing yet</Text>
        ) : (
          <View className="border border-indigo-400 p-4 rounded-lg gap-1">
            {log.map((entry) => (
              <Text key={entry.id} className="text-white font-mono text-xs">
                {entry.line}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

function describe(e: unknown): string {
  if (e instanceof Error) {
    const withCode = e as Error & {
      code?: string;
      recoverySuggestion?: string;
    };
    const head = `${withCode.code ?? e.name}: ${e.message}`;
    return withCode.recoverySuggestion
      ? `${head} — ${withCode.recoverySuggestion}`
      : head;
  }
  return JSON.stringify(e);
}
