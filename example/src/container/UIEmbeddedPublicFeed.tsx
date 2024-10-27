import React, { useCallback, useState } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { LucraFlowView, LucraSDK } from '@lucra-sports/lucra-react-native-sdk';

type Props = NativeStackScreenProps<RootStackParamList, 'UIEmbeddedPublicFeed'>;

export const UIEmbeddedPublicFeed: React.FC<Props> = ({ navigation }) => {
  // Lucra components die when full screen flows are launched, react-native-screens is not compatible with jetpack-compose.
  // By generating a new key, we force the component to re-mount which fixes them for now
  const [embeddedViewKey, setEmbeddedViewKey] = useState(
    Math.random().toString()
  );

  useFocusEffect(
    useCallback(() => {
      const embeddedKey = Math.random().toString();
      setEmbeddedViewKey(embeddedKey);
    }, [])
  );

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 gap-2 bg-transparent">
        <View className="flex-row items-center gap-2">
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

        <LucraFlowView
          key={embeddedViewKey}
          flow={LucraSDK.FLOW.PUBLIC_FEED}
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
};

const Styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    tintColor: 'white',
  },
  spacer: {
    flex: 1,
  },
});
