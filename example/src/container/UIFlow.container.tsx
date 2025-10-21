import React, { useCallback, useState } from 'react';
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
} from 'react-native';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  LucraProfilePill,
  LucraSDK,
} from '@lucra-sports/lucra-react-native-sdk';
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'UIFlow'>;

export const UIFlowContainer: React.FC<Props> = ({ navigation }) => {
  const [profilePillKey, setProfilePillKey] = useState(
    Math.random().toString()
  );

  const [matchupId, setMatchupId] = React.useState('');

  useFocusEffect(
    useCallback(() => {
      const keyPill = Math.random().toString();
      setProfilePillKey(keyPill);
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-indigo-900 pt-8">
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
              <LucraProfilePill key={profilePillKey} />
            </View>

            <TouchableOpacity
              className="w-full border border-indigo-500 bg-indigo-700 p-4 items-center justify-center rounded-lg "
              onPress={() =>
                LucraSDK.present({ name: LucraSDK.FLOW.ONBOARDING })
              }
            >
              <Text className="font-bold text-white">Onboarding</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full border border-indigo-500 bg-indigo-700 p-4 items-center justify-center rounded-lg "
              onPress={() =>
                LucraSDK.present({ name: LucraSDK.FLOW.DEMOGRAPHIC_COLLECTION })
              }
            >
              <Text className="font-bold text-white">Demographic Form</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full border border-indigo-500 bg-indigo-700 p-4 items-center justify-center rounded-lg "
              onPress={() =>
                LucraSDK.present({
                  name: LucraSDK.FLOW.VERIFY_IDENTITY,
                })
              }
            >
              <Text className="font-bold text-white">Verify Identity</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full border border-indigo-500 bg-indigo-700 p-4 items-center justify-center rounded-lg "
              onPress={() =>
                LucraSDK.present({ name: LucraSDK.FLOW.ADD_FUNDS })
              }
            >
              <Text className="font-bold text-white">Add Funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full border border-indigo-500 bg-indigo-700 p-4 items-center justify-center rounded-lg "
              onPress={() =>
                LucraSDK.present({ name: LucraSDK.FLOW.WITHDRAW_FUNDS })
              }
            >
              <Text className="font-bold text-white">Withdraw Funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full border border-indigo-500 bg-indigo-700 p-4 items-center justify-center rounded-lg "
              onPress={() =>
                LucraSDK.present({ name: LucraSDK.FLOW.CREATE_GAMES_MATCHUP })
              }
            >
              <Text className="font-bold text-white">Create Games Matchup</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full border border-indigo-500 bg-indigo-700 p-4 items-center justify-center rounded-lg "
              onPress={() =>
                LucraSDK.present({
                  name: LucraSDK.FLOW.CREATE_GAMES_MATCHUP,
                  gameId: 'PING-PONG',
                })
              }
            >
              <Text className="font-bold text-white">
                Create Games Matchup with PING-PONG id
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
              onPress={() => {
                LucraSDK.present({
                  name: LucraSDK.FLOW.GAMES_CONTEST_DETAILS,
                  matchupId: matchupId,
                });
              }}
            >
              <Text className="text-white">
                Show Games Matchup Details by ID
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full border border-indigo-400 bg-indigo-700 p-4 items-center justify-center rounded-lg"
              onPress={() => {
                LucraSDK.present({
                  name: LucraSDK.FLOW.MATCHUP_DETAILS,
                  matchupId: matchupId,
                });
              }}
            >
              <Text className="text-white">
                Show Matchup Details (Any Matchup)
              </Text>
            </TouchableOpacity>
            <TextInput
              value={matchupId}
              onChangeText={setMatchupId}
              placeholder="Set Matchup ID"
              placeholderTextColor={'#CCC'}
              className="border border-indigo-400 p-4 rounded-lg text-white"
            />

            <TouchableOpacity
              className="w-full border border-indigo-500 bg-indigo-700 p-4 items-center justify-center rounded-lg "
              onPress={() =>
                LucraSDK.present({ name: LucraSDK.FLOW.CREATE_SPORTS_MATCHUP })
              }
            >
              <Text className="font-bold text-white">
                Create Sports Matchup
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full border border-indigo-500 bg-indigo-700 p-4 items-center justify-center rounded-lg "
              onPress={() => LucraSDK.present({ name: LucraSDK.FLOW.PROFILE })}
            >
              <Text className="font-bold text-white">Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full border border-indigo-500 bg-indigo-700 p-4 items-center justify-center rounded-lg "
              onPress={() =>
                LucraSDK.present({ name: LucraSDK.FLOW.PUBLIC_FEED })
              }
            >
              <Text className="font-bold text-white">Public Feed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full border border-indigo-500 bg-indigo-700 p-4 items-center justify-center rounded-lg "
              onPress={() =>
                LucraSDK.present({ name: LucraSDK.FLOW.MY_MATCHUP })
              }
            >
              <Text className="font-bold text-white">My Matchups</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full border border-red-500 bg-indigo-700 p-4 items-center justify-center rounded-lg "
              onPress={() =>
                setTimeout(() => {
                  LucraSDK.closeFullScreenLucraFlows();
                }, 10000)
              }
            >
              <Text className="font-bold text-white">
                🔧 Close All Flows (in 10 seconds)
              </Text>
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
