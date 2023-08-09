import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-lucrasdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

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

export function showFullAppFlow() {
  if (Platform.OS === 'android') {
    LucraAndroidSdk.launchFullAppFlow();
  } else if (Platform.OS === 'ios') {
    /**
     * Have iOS equivalent invocation here
     */
  }
}
