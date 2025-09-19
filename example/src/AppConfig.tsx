import {
  LucraEnvironment,
  LucraSDK,
} from '@lucra-sports/lucra-react-native-sdk';
import { DEFAULT, type Theme } from './theme';

export interface AppConfig {
  environment: LucraEnvironment;
  apiURL: string;
  apiKey: string;
  urlScheme: string;
  merchantId: string;
  deeplinksEnabled: boolean;
  theme: Theme;
  dirty: boolean;
}

const envApiURL = (process.env.LUCRA_SDK_API_URL ?? '').trim();
const envApiKey = (process.env.LUCRA_SDK_API_KEY ?? '').trim();

if (!envApiURL || !envApiKey) {
  throw new Error(
    'Missing LUCRA_SDK_API_URL or LUCRA_SDK_API_KEY. Ensure they are set in example/.env or the CI secrets.'
  );
}

export type AppConfigAction =
  | { type: 'SET_CONFIG'; config: AppConfig }
  | { type: 'SET_FIELD'; field: keyof AppConfig; value: string }
  | { type: 'SET_THEME'; theme: Theme }
  | { type: 'SET_TOGGLE'; field: 'deeplinksEnabled'; value: boolean };

export const defaultAppConfig: AppConfig = {
  apiURL: envApiURL,
  apiKey: envApiKey,
  environment: LucraSDK.ENVIRONMENT.SANDBOX,
  urlScheme: 'lucraexample',
  merchantId: 'required.for.apple.pay',
  deeplinksEnabled: true,
  theme: DEFAULT,
  dirty: false,
};

export const initialAppConfig: AppConfig = {
  apiURL: '',
  apiKey: '',
  environment: LucraEnvironment.SANDBOX,
  urlScheme: '',
  merchantId: '',
  deeplinksEnabled: false,
  theme: DEFAULT,
  dirty: false,
};

export function appConfigReducer(
  state: AppConfig,
  action: AppConfigAction
): AppConfig {
  switch (action.type) {
    case 'SET_CONFIG':
      return action.config;
    case 'SET_FIELD':
      if (action.field === 'apiKey' && !action.value) {
        return { ...state, apiKey: initialAppConfig.apiKey, dirty: true };
      }
      if (action.field === 'apiURL' && !action.value) {
        return { ...state, apiURL: initialAppConfig.apiURL, dirty: true };
      }
      if (action.field === 'environment' && !action.value) {
        return {
          ...state,
          environment: initialAppConfig.environment,
          dirty: true,
        };
      }
      return { ...state, [action.field]: action.value, dirty: true };
    case 'SET_TOGGLE':
      return { ...state, deeplinksEnabled: action.value, dirty: true };
    case 'SET_THEME':
      return { ...state, theme: action.theme, dirty: true };
    default:
      return state;
  }
}
