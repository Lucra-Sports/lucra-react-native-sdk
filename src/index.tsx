import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-lucrasdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// export const getInstance = LucraClient.getInstance
// export const createInstance = LucraClient.createInstance
// export const present = LucraClient.present

/**
 * NativeModules.[module name]
 * The [module name] must match exactly to android/src/main/java/com/lucrasdk/LucrasdkModule#getName
 */
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

export function initializeClient() {
  if (Platform.OS === 'android') {
    // TODO:
  } else if (Platform.OS === 'ios') {
     NativeModules.LucraClient.createInstance("VTa8LJTUUKjcaNFem7UBA98b6GVNO5X3", "develop", "TODO"); //TODO: pass these in as params
  }
}

export function showProfile() {
  if (Platform.OS === 'android') {
    LucraAndroidSdk.launchFullAppFlow();
  } else if (Platform.OS === 'ios') {
    NativeModules.LucraClient.present("profile")
  }
}

export function showAddFunds() {
  if (Platform.OS === 'android') {
    // TODO: 
  } else if (Platform.OS === 'ios') {
    NativeModules.LucraClient.present("addFunds")
  }
}
