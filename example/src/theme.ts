export type Theme = {
  primary: string;
  secondary: string;
  tertiary: string;
  onPrimary: string;
  onSecondary: string;
  onTertiary: string;
};

/** Which of a brand's two palettes is being referred to. */
export type ThemeAppearance = 'light' | 'dark';

/**
 * Forced SDK appearance. `default` means *don't send `themeMode` at all*, so
 * the SDK keeps deriving the appearance from which palettes it gets — the
 * behavior before forced modes existed, and worth being able to compare against.
 */
export type AppThemeMode = 'default' | 'light' | 'dark' | 'system';

export const THEME_MODES: AppThemeMode[] = [
  'default',
  'light',
  'dark',
  'system',
];

/**
 * Which palettes to hand `LucraSDK.init`. Sending only one is what makes the
 * SDK reuse it for the other appearance, which is the case the cross-fill
 * warning is about — unreachable here unless it can be selected.
 */
export type AppPaletteMode = 'both' | 'light' | 'dark';

export const PALETTE_MODES: AppPaletteMode[] = ['both', 'light', 'dark'];

/**
 * A brand's palettes. Passing both to `LucraSDK.init` makes the SDK follow the
 * device appearance; the light palettes here are deliberately different from the
 * dark ones so the switch is obvious on screen.
 */
export type AppTheme = {
  light: Theme;
  dark: Theme;
};

export const DEFAULT: AppTheme = {
  light: {
    primary: '#0B8F3E',
    secondary: '#3F3CB8',
    tertiary: '#5B57E0',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
  },
  dark: {
    primary: '#09E35F',
    secondary: '#5E5BD0',
    tertiary: '#9C99FC',
    onPrimary: '#001448',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
  },
};

export const CHAOS: AppTheme = {
  light: {
    primary: '#5C8F2E',
    secondary: '#1240B5',
    tertiary: '#4A5170',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
  },
  dark: {
    primary: '#A3D16E',
    secondary: '#285FF5',
    tertiary: '#CDD0DF',
    onPrimary: '#000000',
    onSecondary: '#FFFFFF',
    onTertiary: '#05155E',
  },
};

export const T1: AppTheme = {
  light: {
    primary: '#8A8F00',
    secondary: '#3F3CB8',
    tertiary: '#5B57E0',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
  },
  dark: {
    primary: '#DEE32A',
    secondary: '#5E5BD0',
    tertiary: '#9C99FC',
    onPrimary: '#001448',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
  },
};

export const DUPR: AppTheme = {
  light: {
    primary: '#1B4FA8',
    secondary: '#05155E',
    tertiary: '#3C4468',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
  },
  dark: {
    primary: '#3A79E0',
    secondary: '#EBECF2',
    tertiary: '#CDD0DF',
    onPrimary: '#FFFFFF',
    onSecondary: '#05155E',
    onTertiary: '#05155E',
  },
};

export const PSF: AppTheme = {
  light: {
    primary: '#1F5FA8',
    secondary: '#EDEFF5',
    tertiary: '#121212',
    onPrimary: '#FFFFFF',
    onSecondary: '#121212',
    onTertiary: '#FFFFFF',
  },
  dark: {
    primary: '#387FD1',
    secondary: '#121212',
    tertiary: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#000000',
  },
};

export const BRANDS: { name: string; theme: AppTheme }[] = [
  { name: 'DEFAULT', theme: DEFAULT },
  { name: 'CHAOS', theme: CHAOS },
  { name: 'T1', theme: T1 },
  { name: 'DUPR', theme: DUPR },
  { name: 'PSF', theme: PSF },
];

export const COLOR_KEYS: { key: keyof Theme; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'tertiary', label: 'Tertiary' },
  { key: 'onPrimary', label: 'On Primary' },
  { key: 'onSecondary', label: 'On Secondary' },
  { key: 'onTertiary', label: 'On Tertiary' },
];
