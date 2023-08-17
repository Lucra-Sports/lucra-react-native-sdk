import React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import {
  LucraClient,
  LucraEnvironment,
  LucraFlow,
  LucraClientContext,
} from '@lucra-sports/lucra-react-native-sdk';

export default function App() {
  return (
    <LucraClient
      authenticationClientID="BHGhy6w9eOPoU7z1UdHffuDNdlihYU6T"
      environment={LucraEnvironment.Staging}
    >
      <View style={styles.container}>
        <LucraClientContext.Consumer>
          {(context) => (
            <View>
              <Button
                title="Show Profile"
                onPress={() => context.present(LucraFlow.Profile)}
              />
              <Button
                title="Show Add Funds"
                onPress={() => context.present(LucraFlow.AddFunds)}
              />
            </View>
          )}
        </LucraClientContext.Consumer>
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
