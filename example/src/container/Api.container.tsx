import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
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

type Props = NativeStackScreenProps<RootStackParamList, 'APIFlow'>;

let currentMatchupId: string;

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
  const [recommendTournamets, setRecommendedTournaments] = React.useState<
    PoolTournament[]
  >([]);

  return (
    <SafeAreaView className="flex-1 bg-indigo-900">
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
          <Text className="text-white">Games You Play</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={() => {
            LucraSDK.createGamesMatchup('DARTS', 1.0)
              .then((res) => {
                currentMatchupId = res.matchupId;
                console.warn('Created game match up', res);
              })
              .catch((e) => {
                console.error('Error when creating matchup');
                handleLucraSDKError(e);
              });
          }}
        >
          <Text className="text-white">Create Games Matchup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={() => {
            LucraSDK.acceptGamesMatchup('INSERT_ID_HERE', 'TEAM_ID').catch(
              handleLucraSDKError
            );
          }}
        >
          <Text className="text-white">Accept Games match up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={async () => {
            await LucraSDK.logout();
          }}
        >
          <Text className="text-white">Log out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={async () => {
            try {
              const info = await LucraSDK.getSportsMatchup(currentMatchupId);
              console.warn(
                `getSportsMatchup Response: ${JSON.stringify(info, null, 2)}`
              );
            } catch (e) {
              console.error(e);
            }
          }}
        >
          <Text className="text-white">Get Sports Matchup info</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
          onPress={() => {
            LucraSDK.cancelGamesMatchup(currentMatchupId)
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
          onPress={() => {
            try {
              let tournament = LucraSDK.tournamentMatchup(tournamentId);
              console.warn('Recommended Tournaments', tournament);
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
            to fetch
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
