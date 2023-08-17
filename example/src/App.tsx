import React, { useEffect } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { LucraSDK } from 'lucra-react-native-sdk';

export default function App() {
  useEffect(() => {
    // Initialize the SDK on app start
    LucraSDK.init(
      'BHGhy6w9eOPoU7z1UdHffuDNdlihYU6T',
      LucraSDK.ENVIRONMENT.STAGING
    );
  }, []);

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
