import { useEffect, useState} from 'react';

import {Button, StyleSheet, View} from 'react-native';
import { createInstance, present } from 'react-native-lucrasdk';

const client = createInstance("VTa8LJTUUKjcaNFem7UBA98b6GVNO5X3", "develop", "TODO");

export default function App() {
  // const [color, setColor] = useState("#32a852")
  // useEffect(() => {
  //   setTimeout(() => {
  //     if(color != "#000") {
  //       setColor('#000')
  //     } else {
  //       setColor("#32a852")
  //     }
  //   }, 2500)
  // }, [color])

  return (
    <View style={styles.container}>
      <Button title="Profile" onPress={() => present("profile")} />
      <Button title="Add Funds" onPress={() => present("addFunds")} />
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
