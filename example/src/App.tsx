import * as React from 'react';

import { StyleSheet, View, Button } from 'react-native';
import { showFullAppFlow } from 'react-native-lucrasdk';

export default function App() {
  return (
    <View style={styles.container}>
      <Button title="Launch Full App Flow" onPress={() => showFullAppFlow()} />
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
