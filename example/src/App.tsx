import React, { createContext, useState } from "react";
import { StyleSheet, View, Button } from 'react-native';
import LucraClient, { LucraFlow, LucraSDKContext } from './LucraClient';

export default function App() {
  return (
    <LucraClient authenticationClientID = 'VTa8LJTUUKjcaNFem7UBA98b6GVNO5X3' environment = 'develop' urlScheme = ''>
    <View style={styles.container}>
      <LucraSDKContext.Consumer>
        {context => (
          <View>
          <Button title="Show Profile" onPress={() => context.present(LucraFlow.Profile)} />
          <Button title="Show Add Funds" onPress={() => context.present(LucraFlow.AddFunds)} />
          </View>
        )}
        </LucraSDKContext.Consumer>
    </View>
    </LucraClient>
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