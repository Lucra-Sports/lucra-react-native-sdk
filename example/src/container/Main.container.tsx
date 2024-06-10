import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FC } from 'react';
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';
import {
  LucraFlowView,
  LucraMiniPublicFeed,
  LucraProfilePill,
  LucraSDK,
  LucraCreateContestButton,
  LucraRecommendedMatchup,
  LucraContestCard,
} from '@lucra-sports/lucra-react-native-sdk';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export const MainContainer: FC<Props> = ({ navigation }) => {
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
      <ScrollView className="flex-1 p-4">
        <Image
          source={Assets.LucraLogo}
          resizeMode="contain"
          className="w-32 h-12"
          // eslint-disable-next-line react-native/no-inline-styles
          style={{ tintColor: 'white' }}
        />
        <TouchableOpacity
          className="mt-4 bg-darkPurple p-4 rounded-t-xl"
          onPress={() => {
            navigation.navigate('UIFlow');
          }}
        >
          <Text className="text-white">UI Flow Example</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-darkPurple p-4 border-t border-lightPurple"
          onPress={() => {
            navigation.navigate('APIFlow');
          }}
        >
          <Text className="text-white">API Calls Example</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-darkPurple p-4 rounded-b-xl border-t border-lightPurple"
          onPress={async () => {
            await LucraSDK.configureUser({
              firstName: 'blah',
              address: {
                address: 'quack',
              },
            });

            let user = await LucraSDK.getUser();

            console.log('Updated user', user);
          }}
        >
          <Text className="text-white">Example call configure user</Text>
        </TouchableOpacity>
        <Text className="text-white my-2">Profile pill component</Text>
        <LucraProfilePill key={profilePillKey} />
        <Text className="text-white my-2">Mini feed</Text>
        <LucraMiniPublicFeed
          key={miniFeedKey}
          playerIds={[]}
          className="h-96"
        />
        <Text className="text-white my-2"> Example embedded view</Text>
        <LucraFlowView
          key={embeddedViewKey}
          flow={LucraSDK.FLOW.PROFILE}
          className="h-96"
        />
        <LucraCreateContestButton className="mt-4" />
        <LucraRecommendedMatchup className="mt-4 h-96" />
        <LucraContestCard contestId="123" className="mt-4 h-96" />
      </ScrollView>
    </SafeAreaView>
  );
};
