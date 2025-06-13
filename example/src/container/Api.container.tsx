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

    case 'unknown':
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
              const prettyJson = JSON.stringify(fullMatchup, null, 2);
              setFullMatchupInfo(prettyJson);
            } catch (e) {
              setFullMatchupInfo('');
              Alert.alert('Error', String(e));
            }
          }}
        >
          <Text className="text-white">Get Matchup</Text>
        </TouchableOpacity>

        {fullMatchupInfo ? (
          <View className="w-full bg-gray-900 border border-indigo-400 rounded-lg mt-2 p-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-indigo-300 font-bold">
                Full Matchup JSON
              </Text>
              <TouchableOpacity
                onPress={() => Clipboard.setString(fullMatchupInfo)}
                className="px-2 py-1 bg-indigo-700 rounded"
              >
                <Text className="text-white text-xs">Copy</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal>
              <Text
                selectable
                style={{ fontFamily: 'Menlo', color: '#fff', fontSize: 12 }}
              >
                {fullMatchupInfo}
              </Text>
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
              Alert.alert('Tournament', JSON.stringify(tournament, null, 2));
            } catch (e) {
              console.error(e);
            }
          }}
        >
          <Text className="text-white">Get Current Tournament</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={async () => {
            try {
              await LucraSDK.joinTournament(tournamentId);
              Alert.alert(
                'Success',
                'Joined tournament with id: ' + tournamentId
              );
            } catch (e) {
              console.error(e);
            }
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
});
