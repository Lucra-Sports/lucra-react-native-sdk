import React from 'react';
import type { FC } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { RootStackParamList } from '../Routes';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export const MainContainer: FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={Styles.container}>
      <View style={Styles.innerContainer}>
        <Text style={Styles.title}>Lucra RN SDK Sample App</Text>
        <TouchableOpacity
          style={Styles.upperButton}
          onPress={() => {
            navigation.navigate('UIFlow');
          }}
        >
          <Text>UI Flow Example</Text>
        </TouchableOpacity>
        <TouchableOpacity style={Styles.bottomButton} disabled>
          <Text>API Calls Example</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const Styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    padding: 16,
  },
  title: {
    fontSize: 22,
  },
  upperButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: 'white',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  bottomButton: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    padding: 10,
    backgroundColor: 'white',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});
