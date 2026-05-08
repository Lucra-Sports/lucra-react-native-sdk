import React, { useCallback, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Vibration,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  LucraSDK,
  MiniGameMode,
} from '@lucra-sports/lucra-react-native-sdk';

type Props = NativeStackScreenProps<RootStackParamList, 'MiniGameLauncher'>;

const GAME_MODES = [
  { label: 'Practice', value: MiniGameMode.PRACTICE },
  { label: '1v1', value: MiniGameMode.ONE_VS_ONE },
  { label: 'Free For All', value: MiniGameMode.FREE_FOR_ALL },
  { label: 'Tournament', value: MiniGameMode.TOURNAMENT },
];

function triggerHaptic(type: string) {
  switch (type.toLowerCase()) {
    case 'light':
    case 'soft':
    case 'tiny':
    case 'selection':
      Vibration.vibrate(10);
      break;
    case 'medium':
    case 'success':
      Vibration.vibrate(20);
      break;
    case 'heavy':
    case 'rigid':
    case 'failure':
    case 'warning':
      Vibration.vibrate(40);
      break;
    default:
      Vibration.vibrate(10);
      break;
  }
}

export const MiniGameLauncher: React.FC<Props> = ({ navigation }) => {
  const [gameId, setGameId] = useState('');
  const [gameMode, setGameMode] = useState<MiniGameMode>(
    MiniGameMode.PRACTICE
  );
  const [amount, setAmount] = useState(0);
  const [matchupId, setMatchupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const resultMatchupIdRef = useRef<string | null>(null);

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
      resultMatchupIdRef.current = result.matchupId ?? null;
      setGameUrl(result.url);
    } catch (e: any) {
      Alert.alert('Error', e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const [pendingMatchupId, setPendingMatchupId] = useState<string | null>(null);

  const closeGame = useCallback(() => {
    const returnedMatchupId = resultMatchupIdRef.current;
    resultMatchupIdRef.current = null;
    if (returnedMatchupId) {
      setPendingMatchupId(returnedMatchupId);
    }
    setGameUrl(null);
  }, []);

  const handleModalDismiss = useCallback(() => {
    if (pendingMatchupId) {
      LucraSDK.present({
        name: LucraSDK.FLOW.GAMES_CONTEST_DETAILS,
        matchupId: pendingMatchupId,
      });
      setPendingMatchupId(null);
    }
  }, [pendingMatchupId]);

  const webViewRef = useRef<WebView>(null);

  const handleWebViewMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let body: { type?: string; payload?: any };
      try {
        body = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }

      const { type, payload } = body;
      switch (type) {
        case 'set_load_progress':
          break;
        case 'loaded':
        case 'hide_loading_screen':
          break;
        case 'close_game':
          closeGame();
          break;
        case 'haptic_feedback': {
          const cleaned =
            typeof payload === 'string' ? payload.replace(/"/g, '') : '';
          triggerHaptic(cleaned);
          break;
        }
        case 'log': {
          if (payload && typeof payload === 'object') {
            const logType = payload.LogType ?? 'Log';
            const msg = payload.Message ?? '';
            const stack = payload.StackTrace ?? '';
            console.log(
              `[MiniGame JS] [${logType}] ${msg}${stack ? ` | ${stack}` : ''}`
            );
          }
          break;
        }
      }
    },
    [closeGame]
  );

  const INJECTED_JS = `
    (function() {
      window.addEventListener('message', function(e) {
        window.ReactNativeWebView.postMessage(typeof e.data === 'string' ? e.data : JSON.stringify(e.data));
      });
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.skm) {
        var orig = window.webkit.messageHandlers.skm.postMessage.bind(window.webkit.messageHandlers.skm);
        window.webkit.messageHandlers.skm.postMessage = function(msg) {
          window.ReactNativeWebView.postMessage(JSON.stringify(msg));
          orig(msg);
        };
      }
      true;
    })();
  `;

  const gameModal = (
    <Modal
      visible={!!gameUrl}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
      onDismiss={handleModalDismiss}
    >
      <StatusBar hidden />
      <View style={Styles.fullScreen}>
        <WebView
          ref={webViewRef}
          source={{ uri: gameUrl ?? '' }}
          style={Styles.flex}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          onMessage={handleWebViewMessage}
          injectedJavaScript={INJECTED_JS}
        />
        <TouchableOpacity
          style={Styles.closeButton}
          onPress={closeGame}
        >
          <Text style={Styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-indigo-900 pt-8">
      {gameModal}
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
                  <Text className="text-white text-center text-xs">
                    {id}
                  </Text>
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
                <Text className="font-bold text-white">Start Mini Game</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  fullScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
