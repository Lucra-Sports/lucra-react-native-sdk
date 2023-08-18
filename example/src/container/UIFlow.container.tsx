import React from 'react';
import type { FC } from 'react';
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

export const UIFlowContainer: FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={Styles.container}>
      <View style={Styles.innerContainer}>
        <View style={Styles.header}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={Styles.backButton}
          >
            <Image source={Assets.ChevronLeft} style={Styles.chevron} />
            <Text style={Styles.text}>RN SDK Example</Text>
          </TouchableOpacity>
          <View style={Styles.spacer} />
          <TouchableOpacity
            style={Styles.fundsPill}
            onPress={() => LucraSDK.present(LucraSDK.FLOW.ADD_FUNDS)}
          >
            <Text>⚡</Text>
            <Text style={Styles.fundText}>0,00</Text>
          </TouchableOpacity>
        </View>
        <View style={Styles.mainSection}>
          <Image
            source={Assets.LucraLogo}
            style={Styles.logo}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity style={Styles.button}>
          <Text style={Styles.fundText}>Add Funds</Text>
        </TouchableOpacity>
        <TouchableOpacity style={Styles.button}>
          <Text style={Styles.fundText}>Create Games Matchup</Text>
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
    tintColor: 'blue',
    height: 32,
    width: 32,
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
