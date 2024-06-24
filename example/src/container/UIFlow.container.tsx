import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';

type Props = NativeStackScreenProps<RootStackParamList, 'UIFlow'>;

export const UIFlowContainer: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1">
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
          <TouchableOpacity
            className="rounded-full bg-darkPurple px-4 h-8 flex-row items-center justify-center g-2"
            onPress={() => LucraSDK.present(LucraSDK.FLOW.PROFILE)}
          >
            <Image source={Assets.BoltIcon} className="h-4 w-4" />
            <Text style={Styles.fundText}>0,00$</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="w-full border border-lightPurple p-4 items-center justify-center rounded-lg mb-2"
          onPress={() => LucraSDK.present(LucraSDK.FLOW.ONBOARDING)}
        >
          <Text className="font-bold text-white">Onboarding</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-lightPurple p-4 items-center justify-center rounded-lg mb-2"
          onPress={() => LucraSDK.present(LucraSDK.FLOW.PROFILE)}
        >
          <Text className="font-bold text-white">Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-lightPurple p-4 items-center justify-center rounded-lg mb-2"
          onPress={() => LucraSDK.present(LucraSDK.FLOW.ADD_FUNDS)}
        >
          <Text className="font-bold text-white">Add Funds</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-lightPurple p-4 items-center justify-center rounded-lg mb-2"
          onPress={() => LucraSDK.present(LucraSDK.FLOW.WITHDRAW_FUNDS)}
        >
          <Text className="font-bold text-white">Withdraw Funds</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-lightPurple p-4 items-center justify-center rounded-lg mb-2"
          onPress={() => LucraSDK.present(LucraSDK.FLOW.VERIFY_IDENTITY)}
        >
          <Text className="font-bold text-white">Verify Identity</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-lightPurple p-4 items-center justify-center rounded-lg mb-2"
          onPress={() => LucraSDK.present(LucraSDK.FLOW.PUBLIC_FEED)}
        >
          <Text className="font-bold text-white">Public Feed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-lightPurple p-4 items-center justify-center rounded-lg mb-2"
          onPress={() => LucraSDK.present(LucraSDK.FLOW.CREATE_GAMES_MATCHUP)}
        >
          <Text className="font-bold text-white">Create Games Matchup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-lightPurple p-4 items-center justify-center rounded-lg mb-2"
          onPress={() => LucraSDK.present(LucraSDK.FLOW.CREATE_SPORTS_MATCHUP)}
        >
          <Text className="font-bold text-white">Create Sports Matchup</Text>
        </TouchableOpacity>
      </View>
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
