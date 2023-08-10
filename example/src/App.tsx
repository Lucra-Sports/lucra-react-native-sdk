import * as React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { initializeClient, showProfile, showAddFunds } from 'react-native-lucrasdk';

initializeClient()

export default function App() {
  return (
    <View style={styles.container}>
        <Button title="Show Profile" onPress={() => showProfile()} />
        <Button title="Show Add Funds" onPress={() => showAddFunds()} />
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