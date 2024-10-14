import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import { DEFAULT, type Theme } from './theme';

export interface AppConfig {
  environment: string;
  apiURL: string;
  apiKey: string;
  urlScheme: string;
  merchantId: string;
  deeplinksEnabled: boolean;
  theme: Theme;
  dirty: boolean;
}

export type AppConfigAction =
  | { type: 'SET_CONFIG'; config: AppConfig }
  | { type: 'SET_FIELD'; field: keyof AppConfig; value: string }
  | { type: 'SET_THEME'; theme: Theme }
  | { type: 'SET_TOGGLE'; field: 'deeplinksEnabled'; value: boolean };

export const initialAppConfig: AppConfig = {
  apiURL: 'api-sample.sandbox.lucrasports.com',
  apiKey: 'YGugBV5xGsicmp48syEcDlBUQ98YeHE5',
  environment: LucraSDK.ENVIRONMENT.SANDBOX,
  urlScheme: 'TODO:',
  merchantId: 'com.todo.in.upcoming.pr',
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
      return { ...state, [action.field]: action.value, dirty: true };
    case 'SET_TOGGLE':
      return { ...state, deeplinksEnabled: action.value, dirty: true };
    case 'SET_THEME':
      return { ...state, theme: action.theme, dirty: true };
    default:
      return state;
  }
}
