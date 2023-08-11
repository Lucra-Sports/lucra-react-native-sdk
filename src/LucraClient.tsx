import React from 'react';
import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-lucrasdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const LucraAndroidSdk = NativeModules.LucraAndroidSdk
  ? NativeModules.LucraAndroidSdk
  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

export enum LucraEnvironment {
  Production = "production",
  Staging = "staging"
}

export enum LucraFlow {
  Profile = "profile",
  AddFunds = "addFundxs"
}

export const LucraClientContext = React.createContext({
  present: (flow: LucraFlow) => { }
});

interface Props {
  authenticationClientID: string,
  environment: string
}

export class LucraClient extends React.Component<Props> {

  constructor(props: Props) {
    super(props);
    if (Platform.OS === 'android') {
      // TODO:
    } else if (Platform.OS === 'ios') {
      NativeModules.LucraClient.createInstance(props.authenticationClientID, props.environment, '');
    }
  }

  present = (flow: LucraFlow) => {
    if (Platform.OS === 'android') {
      LucraAndroidSdk.launchFullAppFlow();
    } else if (Platform.OS === 'ios') {
      NativeModules.LucraClient.present(flow)
    }
  };

  render() {
    return (
      <LucraClientContext.Provider
        value={{
          present: this.present
        }}
      >
        {this.props.children}
      </LucraClientContext.Provider>
    );
  }
}