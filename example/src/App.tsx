import { useEffect, useState} from 'react';

import {Button, StyleSheet, View} from 'react-native';
import { LucrasdkView, helloWorld } from 'react-native-lucrasdk';

export default function App() {
  const [color, setColor] = useState("#32a852")
  useEffect(() => {
    setTimeout(() => {
      if(color != "#000") {
        setColor('#000')
      } else {
        setColor("#32a852")
      }
    }, 2500)
  }, [color])

  return (
    <View style={styles.container}>
      <LucrasdkView color={color} style={styles.box} />
      <Button title="Click Me" onPress={() => helloWorld()} />
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
