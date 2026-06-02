import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEventsContext, type LucraEvent } from '../EventsContext';
import {
  LucraSDK,
  MiniGameMode,
  GeoComplyContext,
  MiniGameWebView,
} from '@lucra-sports/lucra-react-native-sdk';

type Props = NativeStackScreenProps<RootStackParamList, 'MiniGameLauncher'>;

const GAME_MODES = [
  { label: 'Practice', value: MiniGameMode.PRACTICE },
  { label: '1v1', value: MiniGameMode.ONE_VS_ONE },
  { label: 'Free For All', value: MiniGameMode.FREE_FOR_ALL },
  { label: 'Tournament', value: MiniGameMode.TOURNAMENT },
];

export const MiniGameLauncher: React.FC<Props> = ({ navigation }) => {
  const [events] = useEventsContext();

  useEffect(() => {
    LucraSDK.preloadGeoToken(GeoComplyContext.CASH_BUY_IN);
  }, []);

  const [gameId, setGameId] = useState('');
  const [gameMode, setGameMode] = useState<MiniGameMode>(MiniGameMode.PRACTICE);
  const [amount, setAmount] = useState(0);
  const [matchupId, setMatchupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const resultMatchupIdRef = useRef<string | null>(null);
  const [pendingMatchupId, setPendingMatchupId] = useState<string | null>(null);

  const handleStartMiniGame = async () => {
    if (!gameId.trim()) {
      Alert.alert('Error', 'Please enter a Game ID');
      return;
    }
    setLoading(true);
    setGameUrl(null);
    resultMatchupIdRef.current = null;
    try {
      const result = await LucraSDK.startMiniGame(
        gameId.trim(),
        gameMode,
        gameMode === MiniGameMode.PRACTICE ? 0 : amount,
        matchupId.trim() || undefined
      );
      console.log('[MiniGame] startMiniGame result:', JSON.stringify(result));
      resultMatchupIdRef.current = result.matchupId ?? null;
      setGameUrl(result.url);
    } catch (e: any) {
      Alert.alert('Error', e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  // Native MiniGame *flow* (LucraFlow.miniGame). Unlike the headless startMiniGame
  // path above, this is what emits the native `MiniGame.Finished` event →
  // forwarded to JS as onMiniGameFinished → shown in the Events panel below.
  const handleStartMiniGameFlow = async () => {
    if (!gameId.trim()) {
      Alert.alert('Error', 'Please enter a Game ID');
      return;
    }
    if (presenting) {
      return; // guard against duplicate taps while a present() is in flight
    }
    setPresenting(true);
    try {
      await LucraSDK.present({
        name: LucraSDK.FLOW.MINI_GAME,
        gameId: gameId.trim(),
        gameMode,
        amount: gameMode === MiniGameMode.PRACTICE ? 0 : amount,
        matchupId: matchupId.trim() || undefined,
      });
    } catch (e: any) {
      Alert.alert('Error', e?.message || String(e));
    } finally {
      setPresenting(false);
    }
  };

  const closeGame = useCallback(() => {
    const returnedMatchupId = resultMatchupIdRef.current;
    console.log(
      '[MiniGame] closeGame called, matchupId:',
      returnedMatchupId,
      'gameUrl:',
      gameUrl
    );
    resultMatchupIdRef.current = null;
    if (returnedMatchupId) {
      setPendingMatchupId(returnedMatchupId);
    }
    setGameUrl(null);
  }, [gameUrl]);

  useEffect(() => {
    console.log(
      '[MiniGame] useEffect: pendingMatchupId=',
      pendingMatchupId,
      'gameUrl=',
      gameUrl
    );
    if (!pendingMatchupId || gameUrl) {
      return;
    }
    console.log(
      '[MiniGame] Will present matchup details in 500ms for:',
      pendingMatchupId
    );
    const timer = setTimeout(async () => {
      console.log(
        '[MiniGame] Presenting matchup details for:',
        pendingMatchupId
      );
      try {
        await LucraSDK.present({
          name: LucraSDK.FLOW.GAMES_CONTEST_DETAILS,
          matchupId: pendingMatchupId,
        });
        console.log('[MiniGame] present() resolved');
      } catch (e: any) {
        console.log('[MiniGame] present() error:', e?.message || String(e));
      }
      setPendingMatchupId(null);
    }, 1000);
    return () => clearTimeout(timer);
  }, [pendingMatchupId, gameUrl]);

  return (
    <SafeAreaView className="flex-1 bg-indigo-900 pt-8">
      <MiniGameWebView url={gameUrl} onClose={closeGame} />
      <KeyboardAvoidingView
        style={Styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <ScrollView
          contentContainerStyle={Styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View className="pt-10 px-4 gap-4 pb-12">
            <View className="flex-row items-center gap-2 pb-5">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={Styles.backButton}
              >
                <Image
                  source={Assets.ChevronLeft}
                  style={Styles.chevron}
                  className="h-8 w-8"
                />
              </TouchableOpacity>
              <Text className="text-white text-lg font-bold ml-2">
                Mini Game Launcher
              </Text>
            </View>

            <View className="flex-row gap-2">
              {['hoops-web', 'runaway-web', 'tappysoccer-web'].map((id) => (
                <TouchableOpacity
                  key={id}
                  className={`flex-1 p-2 rounded-lg border ${
                    gameId === id
                      ? 'bg-indigo-500 border-indigo-300'
                      : 'bg-indigo-700 border-indigo-500'
                  }`}
                  onPress={() => setGameId(id)}
                >
                  <Text className="text-white text-center text-xs">{id}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={gameId}
              onChangeText={setGameId}
              placeholder="Game ID (required)"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              className="border border-indigo-400 p-4 rounded-lg text-white"
            />

            <Text className="text-white">Game Mode</Text>
            <View className="flex-row flex-wrap gap-2">
              {GAME_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode.value}
                  className={`flex-1 min-w-[70px] p-3 rounded-lg border ${
                    gameMode === mode.value
                      ? 'bg-indigo-500 border-indigo-300'
                      : 'bg-indigo-700 border-indigo-500'
                  }`}
                  onPress={() => {
                    setGameMode(mode.value);
                    if (mode.value === MiniGameMode.PRACTICE) {
                      setAmount(0);
                    } else if (amount === 0) {
                      setAmount(1);
                    }
                  }}
                >
                  <Text className="text-white text-center text-xs">
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {gameMode !== MiniGameMode.PRACTICE && (
              <>
                <Text className="text-white">Amount</Text>
                <View className="flex-row gap-2">
                  {[1, 5].map((val) => (
                    <TouchableOpacity
                      key={val}
                      className={`flex-1 p-3 rounded-lg border ${
                        amount === val
                          ? 'bg-indigo-500 border-indigo-300'
                          : 'bg-indigo-700 border-indigo-500'
                      }`}
                      onPress={() => setAmount(val)}
                    >
                      <Text className="text-white text-center">${val}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <TextInput
              value={matchupId}
              onChangeText={setMatchupId}
              placeholder="Matchup ID (optional)"
              placeholderTextColor="#999"
              className="border border-indigo-400 p-4 rounded-lg text-white"
            />

            <TouchableOpacity
              className="w-full bg-green-600 p-4 items-center justify-center rounded-lg"
              onPress={handleStartMiniGame}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-bold text-white">
                  Start Mini Game (headless)
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full bg-indigo-500 p-4 items-center justify-center rounded-lg"
              onPress={handleStartMiniGameFlow}
              disabled={presenting}
            >
              {presenting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-bold text-white">
                  Launch via MiniGame Flow (fires onMiniGameFinished)
                </Text>
              )}
            </TouchableOpacity>

            {/* Event viewer — mirrors the iOS SDK Sample minigames event display.
                Captures SDK events (incl. miniGameFinished) from EventsContext. */}
            <View className="mt-4 border-t border-indigo-700 pt-4 gap-2">
              <Text className="text-white text-base font-bold">
                Events ({events.length})
              </Text>
              {events.length === 0 ? (
                <Text className="text-neutral-400">No events yet</Text>
              ) : (
                [...events]
                  .reverse()
                  .map((event, index) => (
                    <EventRow key={`${event.type}-${index}`} event={event} />
                  ))
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

type MiniGameFinishedPayload = {
  gameId?: string;
  gameMode?: string;
  amount?: number;
  matchupId?: string;
};

// Renders a single SDK event. `miniGameFinished` gets labeled rows (matching the
// iOS SDK Sample); every other event shows type + id and is tap-to-copy.
const EventRow: React.FC<{ event: LucraEvent }> = ({ event }) => {
  if (event.type === 'MiniGame finished') {
    let payload: MiniGameFinishedPayload = {};
    try {
      payload = JSON.parse(event.id) as MiniGameFinishedPayload;
    } catch {
      // leave payload empty if it isn't valid JSON
    }
    return (
      <View className="p-3 rounded-lg bg-indigo-800 border border-indigo-600">
        <Text className="text-white font-semibold mb-1">🎮 {event.type}</Text>
        <Text className="text-indigo-200 text-xs">
          Game ID: {payload.gameId ?? 'nil'}
        </Text>
        <Text className="text-indigo-200 text-xs">
          Mode: {payload.gameMode ?? 'nil'}
        </Text>
        <Text className="text-indigo-200 text-xs">
          Amount: {payload.amount ?? 'nil'}
        </Text>
        <Text className="text-indigo-200 text-xs">
          Matchup ID: {payload.matchupId ?? 'nil'}
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      className="p-3 rounded-lg bg-indigo-800"
      onPress={() => Clipboard.setString(event.id)}
    >
      <Text className="text-white font-semibold">{event.type}</Text>
      <Text className="text-indigo-200 text-xs" numberOfLines={2}>
        {event.id}
      </Text>
    </TouchableOpacity>
  );
};

const Styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    tintColor: 'white',
  },
});
