import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Alert,
  Button,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';
import {
  LucraSDK,
  type LucraSDKError,
  type PoolTournament,
} from '@lucra-sports/lucra-react-native-sdk';
import Clipboard from '@react-native-clipboard/clipboard';

type Props = NativeStackScreenProps<RootStackParamList, 'APIFlow'>;

// iOS serializes dictionaries in random key order while Android preserves
// insertion order — sort keys so responses diff cleanly across platforms.
const sortKeysDeep = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
};

// Matches, in priority order: an object key ("foo":), a string value,
// a number, a boolean, or null — so each can be colorized independently.
const JSON_TOKEN_REGEX =
  /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false)|(null)/g;

/** Renders pretty-printed JSON with lightweight syntax highlighting. */
const HighlightedJson: React.FC<{ json: string }> = ({ json }) => {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  JSON_TOKEN_REGEX.lastIndex = 0;

  while ((match = JSON_TOKEN_REGEX.exec(json)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Text key={key++} style={Styles.jsonPunctuation}>
          {json.slice(lastIndex, match.index)}
        </Text>
      );
    }

    const [token] = match;
    const style = match[1]
      ? Styles.jsonKey
      : match[2]
        ? Styles.jsonString
        : match[3]
          ? Styles.jsonNumber
          : match[4]
            ? Styles.jsonBoolean
            : Styles.jsonNull;

    nodes.push(
      <Text key={key++} style={style}>
        {token}
      </Text>
    );
    lastIndex = match.index + token.length;
  }

  if (lastIndex < json.length) {
    nodes.push(
      <Text key={key++} style={Styles.jsonPunctuation}>
        {json.slice(lastIndex)}
      </Text>
    );
  }

  return (
    <Text selectable style={Styles.codeText}>
      {nodes}
    </Text>
  );
};

function handleLucraSDKError(e: LucraSDKError) {
  switch (e.code) {
    case 'notInitialized':
      console.warn('SDK not initialized', e);
      LucraSDK.present({ name: LucraSDK.FLOW.ONBOARDING });
      break;

    case 'unverified':
      console.warn('User not verified', e);
      LucraSDK.present({
        name: LucraSDK.FLOW.VERIFY_IDENTITY,
      });
      break;

    case 'notAllowed':
      console.warn('User not allowed', e);
      break;

    case 'insufficientFunds':
      console.warn('Insufficient funds', e);
      LucraSDK.present({ name: LucraSDK.FLOW.ADD_FUNDS });
      break;

    case 'missingDemographicInformation':
      console.warn('Missing demographic information', e);
      LucraSDK.present({ name: LucraSDK.FLOW.DEMOGRAPHIC_COLLECTION });
      break;

    case 'unknownError':
    default:
      console.warn('Unknown SDK error', e);
      break;
  }
}

export const ApiContainer: React.FC<Props> = ({ navigation }) => {
  const [tournamentId, setTournamentId] = React.useState('');
  const [matchupId, setMatchupId] = React.useState('');
  const [opponentTeamId, setOpponentTeamId] = React.useState('');
  const [recommendTournamets, setRecommendedTournaments] = React.useState<
    PoolTournament[]
  >([]);
  const [fullMatchupInfo, setFullMatchupInfo] = React.useState('');
  const [resultTitle, setResultTitle] = React.useState('Result');
  const [copied, setCopied] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const unsubscribeRef = React.useRef<(() => void) | null>(null);

  const showResult = React.useCallback((title: string, data: unknown) => {
    setResultTitle(title);
    setFullMatchupInfo(JSON.stringify(sortKeysDeep(data), null, 2));
    setCopied(false);
  }, []);

  const stopSubscription = React.useCallback(() => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    setIsSubscribed(false);
  }, []);

  // Always tear down the live subscription when leaving the screen.
  React.useEffect(() => stopSubscription, [stopSubscription]);

  const copyResult = React.useCallback(() => {
    Clipboard.setString(fullMatchupInfo);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [fullMatchupInfo]);

  return (
    <SafeAreaView className="h-full bg-indigo-900  pt-8">
      <View className="flex-row items-center g-2 p-4">
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            source={Assets.ChevronLeft}
            style={Styles.chevron}
            className="h-8 w-8"
          />
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-2">
        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={() => navigation.navigate('SportsYouWatch')}
        >
          <Text className="text-white">Sports You Watch</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={() => navigation.navigate('GamesYouPlay')}
        >
          <Text className="text-white">Create Recreational Games</Text>
        </TouchableOpacity>

        <View className="h-1 w-full border-t border-indigo-400" />

        <View className="flex-row items-center gap-2">
          <TextInput
            value={matchupId}
            onChangeText={setMatchupId}
            placeholder="Matchup Id"
            placeholderTextColor={'#CCC'}
            className="border border-indigo-400 p-4 rounded-lg text-white flex-1"
          />
          <Button
            title="Delete"
            onPress={() => {
              setMatchupId('');
            }}
          />
        </View>

        <View className="flex-row items-center gap-2">
          <TextInput
            value={opponentTeamId}
            onChangeText={setOpponentTeamId}
            placeholder="Joining Team Id (Versus Matchup)"
            placeholderTextColor={'#CCC'}
            className="border border-indigo-400 p-4 rounded-lg text-white flex-1"
          />
          <Button
            title="Delete"
            onPress={() => {
              setOpponentTeamId('');
            }}
          />
        </View>

        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={async () => {
            if (!matchupId) {
              Alert.alert('Error', 'Please enter a Matchup ID');
              return;
            }
            try {
              const fullMatchup = await LucraSDK.getMatchup(matchupId);
              showResult('Matchup', fullMatchup);
            } catch (e) {
              setFullMatchupInfo('');
              Alert.alert('Error', String(e));
            }
          }}
        >
          <Text className="text-white">Get Matchup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={async () => {
            if (!matchupId) {
              Alert.alert('Error', 'Please enter a Matchup ID');
              return;
            }
            try {
              const matchupDetails =
                await LucraSDK.getMatchupDetails(matchupId);
              showResult('Matchup Details', matchupDetails);
            } catch (e) {
              setFullMatchupInfo('');
              Alert.alert('Error', String(e));
            }
          }}
        >
          <Text className="text-white">Get Matchup Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-indigo-400 p-4 items-center justify-center rounded-lg"
          style={isSubscribed ? Styles.copiedButton : Styles.actionButton}
          onPress={() => {
            if (isSubscribed) {
              stopSubscription();
              return;
            }
            if (!matchupId) {
              Alert.alert('Error', 'Please enter a Matchup ID');
              return;
            }
            unsubscribeRef.current = LucraSDK.subscribeToMatchupDetails(
              matchupId,
              (details) => showResult('Matchup Details (live)', details),
              (error) =>
                Alert.alert(
                  'Subscription error',
                  `${error.code}: ${error.message}`
                )
            );
            setIsSubscribed(true);
          }}
        >
          <Text className="text-white">
            {isSubscribed
              ? '● Unsubscribe (live)'
              : 'Subscribe to Matchup Details'}
          </Text>
        </TouchableOpacity>

        {fullMatchupInfo ? (
          <View
            className="w-full border border-indigo-400 rounded-xl mt-2 overflow-hidden"
            style={Styles.jsonCard}
          >
            <View
              className="flex-row justify-between items-center px-3 py-2 border-b border-indigo-400"
              style={Styles.jsonHeader}
            >
              <Text className="text-white font-bold">{resultTitle}</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={copyResult}
                  className="px-3 py-1 rounded"
                  style={copied ? Styles.copiedButton : Styles.actionButton}
                >
                  <Text className="text-white text-xs font-semibold">
                    {copied ? '✓ Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFullMatchupInfo('')}
                  className="px-3 py-1 rounded"
                  style={Styles.actionButton}
                >
                  <Text className="text-white text-xs font-semibold">
                    Clear
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView
              style={Styles.jsonScroll}
              nestedScrollEnabled
              contentContainerClassName="p-3"
            >
              <ScrollView horizontal nestedScrollEnabled>
                <HighlightedJson json={fullMatchupInfo} />
              </ScrollView>
            </ScrollView>
          </View>
        ) : null}

        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={() => {
            LucraSDK.acceptFreeForAllRecreationalGame(matchupId)
              .then(() => {
                Alert.alert(
                  'Success',
                  'Accepted game matchup with id: ' + matchupId
                );
              })
              .catch(handleLucraSDKError);
          }}
        >
          <Text className="text-white">Join Free For All Matchup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={() => {
            LucraSDK.acceptVersusRecreationalGame(matchupId, opponentTeamId)
              .then(() => {
                Alert.alert(
                  'Success',
                  'Accepted game matchup with id: ' + matchupId
                );
              })
              .catch(handleLucraSDKError);
          }}
        >
          <Text className="text-white">Join Versus Matchup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={async () => {
            try {
              await LucraSDK.logout();
              Alert.alert('Success', 'Logged out');
            } catch (e) {
              Alert.alert('Error', `${e}`);
            }
          }}
        >
          <Text className="text-white">Log out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={() => {
            LucraSDK.cancelGamesMatchup(matchupId)
              .then(() => {
                console.warn('Cancelled game match up');
              })
              .catch(handleLucraSDKError);
          }}
        >
          <Text className="text-white">Cancel Matchup</Text>
        </TouchableOpacity>

        <View className="h-1 w-full border-t border-indigo-400" />

        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={async () => {
            try {
              let tournaments = await LucraSDK.getRecomendedTournaments({});
              setRecommendedTournaments(tournaments);
            } catch (e) {
              console.error(e);
            }
          }}
        >
          <Text className="text-white">Get Recommended Tournaments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={async () => {
            try {
              let tournament = await LucraSDK.tournamentMatchup(tournamentId);
              showResult('Tournament', tournament);
            } catch (e) {
              console.error(e);
            }
          }}
        >
          <Text className="text-white">Get Current Tournament</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={() => {
            LucraSDK.joinTournament(tournamentId)
              .then(() => {
                Alert.alert(
                  'Success',
                  'Joined tournament with id: ' + tournamentId
                );
              })
              .catch(handleLucraSDKError);
          }}
        >
          <Text className="text-white">Join Current Tournament</Text>
        </TouchableOpacity>
        <TextInput
          value={tournamentId}
          onChangeText={setTournamentId}
          placeholder="Current Tournament Id"
          placeholderTextColor={'#CCC'}
          className="border border-indigo-400 p-4 rounded-lg text-white"
        />
        {recommendTournamets.length === 0 && (
          <Text className="text-indigo-400">
            No recommended tournaments, tap "Get Recommended Tournaments" button
            to fetch. The press any item on the list to set "Current Tournament
            Id"
          </Text>
        )}
        {recommendTournamets.map((tournament) => (
          <TouchableOpacity
            key={tournament.id}
            className="p-4 border border-indigo-400"
            onPress={() => {
              setTournamentId(tournament.id);
            }}
          >
            <Text className="text-white">{tournament.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const Styles = StyleSheet.create({
  chevron: {
    tintColor: 'white',
  },
  codeText: {
    fontFamily: 'Menlo',
    color: '#e2e8f0',
    fontSize: 12,
    lineHeight: 18,
  },
  jsonCard: {
    backgroundColor: '#020617',
  },
  jsonHeader: {
    backgroundColor: '#3730a3',
  },
  jsonScroll: {
    maxHeight: 360,
  },
  actionButton: {
    backgroundColor: '#4f46e5',
  },
  copiedButton: {
    backgroundColor: '#16a34a',
  },
  jsonKey: {
    color: '#7dd3fc',
  },
  jsonString: {
    color: '#86efac',
  },
  jsonNumber: {
    color: '#fdba74',
  },
  jsonBoolean: {
    color: '#c4b5fd',
  },
  jsonNull: {
    color: '#94a3b8',
  },
  jsonPunctuation: {
    color: '#e2e8f0',
  },
});
