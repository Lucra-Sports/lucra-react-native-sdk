import {
  LucraEnvironment,
  LucraSDK,
} from '@lucra-sports/lucra-react-native-sdk';
import {
  DEFAULT,
  type AppPaletteMode,
  type AppTheme,
  type AppThemeMode,
  type Theme,
  type ThemeAppearance,
} from './theme';

export interface AppConfig {
  environment: LucraEnvironment;
  apiKey: string;
  urlScheme: string;
  merchantId: string;
  deeplinksEnabled: boolean;
  theme: AppTheme;
  /** `default` omits themeMode entirely, keeping the derive-from-palettes rule. */
  themeMode: AppThemeMode;
  /** Which palettes get sent, so the one-palette cross-fill case is reachable. */
  paletteMode: AppPaletteMode;
  dirty: boolean;
}

const envApiKey = (process.env.LUCRA_SDK_API_KEY ?? '').trim();

export type AppConfigAction =
  | { type: 'SET_CONFIG'; config: AppConfig }
  | { type: 'SET_FIELD'; field: keyof AppConfig; value: string }
  | { type: 'SET_THEME'; theme: AppTheme }
  | {
      type: 'SET_THEME_COLOR';
      appearance: ThemeAppearance;
      key: keyof Theme;
      value: string;
    }
  | { type: 'SET_THEME_MODE'; themeMode: AppThemeMode }
  | { type: 'SET_PALETTE_MODE'; paletteMode: AppPaletteMode }
  | { type: 'SET_TOGGLE'; field: 'deeplinksEnabled'; value: boolean };

export const defaultAppConfig: AppConfig = {
  apiKey: envApiKey,
  environment: LucraSDK.ENVIRONMENT.SANDBOX,
  urlScheme: 'lucraexample',
  merchantId: 'required.for.apple.pay',
  deeplinksEnabled: true,
  theme: DEFAULT,
  themeMode: 'default',
  paletteMode: 'both',
  dirty: false,
};

export const initialAppConfig: AppConfig = {
  apiKey: '',
  environment: LucraEnvironment.SANDBOX,
  urlScheme: '',
  merchantId: '',
  deeplinksEnabled: false,
  theme: DEFAULT,
  themeMode: 'default',
  paletteMode: 'both',
  dirty: false,
};

/**
 * Configs persisted before light/dark support stored a single flat palette.
 * Reuse it for both appearances so an upgraded install still renders.
 */
export function migrateAppConfig(config: AppConfig): AppConfig {
  // Configs persisted before forced modes existed have neither key.
  const withModes: AppConfig = {
    ...config,
    themeMode: config.themeMode ?? 'default',
    paletteMode: config.paletteMode ?? 'both',
  };

  const theme: unknown = withModes.theme;
  if (
    theme &&
    typeof theme === 'object' &&
    'light' in theme &&
    'dark' in theme
  ) {
    return withModes;
  }
  const flat = { ...DEFAULT.dark, ...(theme as Partial<Theme> | null) };
  return { ...withModes, theme: { light: flat, dark: flat } };
}

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
    case 'SET_THEME_MODE':
      return { ...state, themeMode: action.themeMode, dirty: true };
    case 'SET_PALETTE_MODE':
      return { ...state, paletteMode: action.paletteMode, dirty: true };
    case 'SET_THEME_COLOR':
      return {
        ...state,
        theme: {
          ...state.theme,
          [action.appearance]: {
            ...state.theme[action.appearance],
            [action.key]: action.value,
          },
        },
        dirty: true,
      };
    default:
      return state;
  }
}
