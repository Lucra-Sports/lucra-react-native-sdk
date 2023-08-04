import {
  requireNativeComponent,
  UIManager,
  Platform,
  type ViewStyle,
  NativeModules,
} from 'react-native';


const { LucraClient } = NativeModules;

const LINKING_ERROR =
  `The package 'react-native-lucrasdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

type LucrasdkProps = {
  color: string;
  style: ViewStyle;
};

const ComponentName = 'LucrasdkView';

export const LucrasdkView =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<LucrasdkProps>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };

export const getInstance = LucraClient.getInstance
export const createInstance = LucraClient.createInstance

export const present = LucraClient.present
