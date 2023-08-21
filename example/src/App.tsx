import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import React from 'react';
import { Button, StyleSheet, View } from 'react-native';

LucraSDK.init('BHGhy6w9eOPoU7z1UdHffuDNdlihYU6T', LucraSDK.ENVIRONMENT.STAGING);

export default function App() {
  return (
    <View style={styles.container}>
      <Button
        title="Show Profile"
        onPress={() => LucraSDK.present(LucraSDK.FLOW.PROFILE)}
      />
      <Button
        title="Show Add Funds"
        onPress={() => LucraSDK.present(LucraSDK.FLOW.ADD_FUNDS)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
