import React, { type PropsWithChildren } from 'react';
import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'lucra-react-native-sdk' doesn't seem to be linked. Make sure: \n\n` +
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
  Production = 'production',
  Staging = 'staging',
}

export enum LucraFlow {
  Profile = 'profile',
  AddFunds = 'addFunds',
}

export const LucraClientContext = React.createContext({
  present: (_flow: LucraFlow) => {},
});

interface Props {
  authenticationClientID: string;
  environment: LucraEnvironment;
}

export class LucraClient extends React.Component<PropsWithChildren<Props>, any> {
  constructor(props: PropsWithChildren<Props>) {
    super(props);
    if (Platform.OS === 'android') {
      LucraAndroidSdk.createInstance(
        props.authenticationClientID,
        props.environment,
        ''
      );
    } else if (Platform.OS === 'ios') {
      NativeModules.LucraClient.createInstance(
        props.authenticationClientID,
        props.environment,
        ''
      );
    }
  }

  present = (flow: LucraFlow) => {
    if (Platform.OS === 'android') {
      LucraAndroidSdk.present(flow);
    } else if (Platform.OS === 'ios') {
      NativeModules.LucraClient.present(flow);
    }
  };

  render() {
    return (
      <LucraClientContext.Provider
        value={{
          present: this.present,
        }}
      >
        {this.props.children}
      </LucraClientContext.Provider>
    );
  }
}
