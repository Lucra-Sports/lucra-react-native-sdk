import React, { useCallback, useState } from 'react';
import type { FC } from 'react';
import {
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  LucraFlowView,
  LucraMiniPublicFeed,
  LucraProfilePill,
  LucraSDK,
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
  const [miniFeedKey, setMiniFeedKey] = useState(Math.random().toString());
  const [embeddedViewKey, setEmbeddedViewKey] = useState(
    Math.random().toString()
  );

  useFocusEffect(
    useCallback(() => {
      const keyPill = Math.random().toString();
      const keyFeed = Math.random().toString();
      const embeddedKey = Math.random().toString();
      setProfilePillKey(keyPill);
      setMiniFeedKey(keyFeed);
      setEmbeddedViewKey(embeddedKey);
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

          <Text className="text-white mt-2"> Embedded Flow</Text>
          <LucraFlowView
            key={embeddedViewKey}
            flow={LucraSDK.FLOW.PROFILE}
            className="h-96"
          />

          <Text className="text-white mt-2"> Contest Card</Text>
          <LucraContestCard contestId="123" className="mt-4 h-96" />

          <Text className="text-white mt-2"> Recommended Matchups</Text>
          <LucraRecommendedMatchup className="mt-4 h-96" />

          <Text className="text-white my-2">Mini feed</Text>
          <View className="h-500">
            <View className="flex-row items-center g-2 pb-5">
              <ScrollView className="flex-1 p-4">
                <LucraMiniPublicFeed
                  className="mt-4 h-96" // TODO h-96 is the only way to get it to show on android, it needs to wrap the entire surface
                  key={miniFeedKey}
                  playerIds={[]}
                />
              </ScrollView>
            </View>
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
