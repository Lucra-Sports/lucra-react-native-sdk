import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  initialize(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('LucraSDK');
