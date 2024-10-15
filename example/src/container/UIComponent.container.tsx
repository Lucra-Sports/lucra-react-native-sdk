import React, { useCallback, useState } from 'react';
import type { FC } from 'react';
import {
  Platform,
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  LucraMiniPublicFeed,
  LucraProfilePill,
  LucraCreateContestButton,
  LucraRecommendedMatchup,
  LucraContestCard,
} from '@lucra-sports/lucra-react-native-sdk';

type Props = NativeStackScreenProps<RootStackParamList, 'UIComponent'>;

export const UIComponentContainer: FC<Props> = ({ navigation }) => {
  // Lucra components die when full screen flows are launched, react-native-screens is not compatible with jetpack-compose.
  // By generating a new key, we force the component to re-mount which fixes them for now
  const [profilePillKey, setProfilePillKey] = useState(
    Math.random().toString()
  );
  const [testContestId, setTestContestId] = useState('');
  const [playerId1, setPlayerId1] = useState('');
  const [playerId2, setPlayerId2] = useState('');
  const [miniFeedKey, setMiniFeedKey] = useState(Math.random().toString());
  const [contestKey, setContestKey] = useState(Math.random().toString());

  useFocusEffect(
    useCallback(() => {
      const keyPill = Math.random().toString();
      const keyFeed = Math.random().toString();
      const keyContest = Math.random().toString();
      setProfilePillKey(keyPill);
      setMiniFeedKey(keyFeed);
      setContestKey(keyContest);
    }, [])
  );

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1">
        <View className="pt-4 px-4 flex-1 g-2 bg-transparent">
          <View className="flex-row items-center g-2 pb-5">
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={Styles.backButton}
            >
              <Image
                source={Assets.ChevronLeft}
                style={Styles.chevron}
                className="h-8 w-8"
              />
            </TouchableOpacity>
            <View style={Styles.spacer} />
          </View>

          <Text className="text-white mt-2">Profile Pill</Text>
          <LucraProfilePill key={profilePillKey} />

          <Text className="text-white mt-2">Create Contest Button</Text>
          <LucraCreateContestButton />

          <Text className="text-white mt-2"> Contest Card </Text>
          <View style={Styles.cardContainer}>
            <TextInput
              className="bg-white p-2 mb-2"
              placeholder="Enter Matchup ID"
              value={testContestId}
              onChangeText={setTestContestId}
            />
            <LucraContestCard
              key={`${contestKey}-${testContestId}`}
              // TODO possible bug on android if this is set to empty string ''
              contestId={testContestId ?? '0'}
              style={Styles.contestCard}
            />
          </View>

          <Text className="text-white mt-2"> Recommended Matchups</Text>
          <LucraRecommendedMatchup className="mt-4" />

          <Text className="text-white my-2">Mini feed</Text>
          <View className="flex-row items-center g-2 pb-5">
            <ScrollView className="flex-1 p-4">
              <TextInput
                className="bg-white p-2 mb-2"
                placeholder="Enter Player ID 1"
                value={playerId1}
                onChangeText={(val) => setPlayerId1(val)}
              />
              <TextInput
                className="bg-white p-2 mb-2"
                placeholder="Enter Player ID 2"
                value={playerId2}
                onChangeText={setPlayerId2}
              />
              {Platform.OS === 'android' ? (
                <Text className="text-white">Crashes on android</Text>
              ) : (
                <LucraMiniPublicFeed
                  className="mt-4"
                  key={`${miniFeedKey}`}
                  // TODO possible bug on android
                  playerIds={[]}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 16,
    gap: 8,
  },
  chevron: {
    tintColor: 'white',
  },
  cardContainer: {
    alignSelf: 'stretch',
    padding: 16,
  },
  contestCard: {
    alignSelf: 'stretch',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  spacer: {
    flex: 1,
  },
  fundsPill: {
    backgroundColor: 'blue',
    gap: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 1000,
  },
  fundText: {
    color: 'white',
    fontWeight: '600',
  },
  text: {
    color: 'white',
  },
  logo: {
    tintColor: 'white',
    width: 200,
  },
  mainSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: 'blue',
    gap: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 1000,
    width: 200,
  },
});
