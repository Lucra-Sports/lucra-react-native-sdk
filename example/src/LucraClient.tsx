import { NativeModules, Platform } from 'react-native';
import React, { createContext, useState } from "react";

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

export enum LucraFlow {
  Profile,
  AddFunds
}

export const LucraSDKContext = React.createContext({
  present: (flow: LucraFlow) => { }
});

export default class LucraClient extends React.Component {

  constructor(props) {
    super(props);
    if (Platform.OS === 'android') {
      // TODO:
    } else if (Platform.OS === 'ios') {
      NativeModules.LucraClient.createInstance(props.authenticationClientID, props.environment, props.urlScheme);
    }
  }

  present = (flow: LucraFlow) => {
    if (Platform.OS === 'android') {
      LucraAndroidSdk.launchFullAppFlow();
    } else if (Platform.OS === 'ios') {
      switch (flow) {
        case LucraFlow.Profile:
          NativeModules.LucraClient.present("profile")
          break
        case LucraFlow.AddFunds:
          NativeModules.LucraClient.present("addFunds")
          break
      }
    }
  };

  render() {
    return (
      <LucraSDKContext.Provider
        value={{
          present: this.present
        }}
      >
        {this.props.children}
      </LucraSDKContext.Provider>
    );
  }
}