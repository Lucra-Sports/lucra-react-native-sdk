/**
 * Color tokens the Lucra SDK honours.
 *
 * All values are hex strings. `#RGB` shorthand is expanded for you, and both
 * `#RRGGBB` and `#AARRGGBB` are accepted — note that 8-digit hex is
 * **alpha first**, unlike CSS's `#RRGGBBAA`.
 */
export type LucraColorSet = {
  primary?: string;
  secondary?: string;
  tertiary?: string;
  onPrimary?: string;
  onSecondary?: string;
  onTertiary?: string;
};

/**
 * Font names for the Lucra UI. Provide PostScript family names on iOS and
 * asset paths on Android. Passing a single string derives the four faces from
 * it (`"Inter"` -> `"Inter Regular"`, `"Inter Medium"`, ...), iOS only.
 */
export type LucraFontFamily =
  | {
      bold?: string;
      semibold?: string;
      normal?: string;
      medium?: string;
    }
  | string;

/**
 * Forces the SDK's appearance instead of deriving it from which palettes you
 * supply. `system` follows the device and switches with it at runtime.
 *
 * Note the Android SDK spells the third option `AUTO`; the React Native
 * vocabulary follows iOS and React Native itself (`useColorScheme`), and the
 * bridge maps `system` to `AUTO`.
 */
export type LucraThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme passed to `LucraSDK.init`.
 *
 * The SDK's appearance is derived from which palettes you supply, unless you
 * set `themeMode`:
 *
 * | supplied | appearance |
 * | --- | --- |
 * | `light` and `dark` | follows the device, re-resolving live |
 * | `light` only | locked light |
 * | `dark` only | locked dark |
 * | flat colors only | locked dark |
 *
 * Flat color keys act as a shared base that `light` and `dark` override, so
 * you only have to repeat the tokens that actually differ between appearances.
 * On their own they mean a single dark palette, which is how the SDK has always
 * behaved.
 *
 * `themeMode` overrides that table entirely. If a forced mode has no matching
 * palette, the SDK reuses the palette you did supply for it — check those
 * colors against the other appearance.
 */
export type LucraTheme = LucraColorSet & {
  light?: LucraColorSet;
  dark?: LucraColorSet;
  fontFamily?: LucraFontFamily;
  /**
   * Pins every Lucra screen to `light` or `dark`, or follows the device with
   * `system`. Omit it to keep the appearance derived from the palettes above.
   */
  themeMode?: LucraThemeMode;
};

/**
 * The shape handed across the bridge: per-appearance palettes already resolved,
 * so the native mappers only have to pick the matching `ClientTheme`
 * initializer. `themeMode` rides along validated; iOS routes it to
 * `LucraClientConfig` and Android to `ClientTheme`.
 */
export type NormalizedLucraTheme = {
  light?: LucraColorSet;
  dark?: LucraColorSet;
  fontFamily?: LucraFontFamily;
  themeMode?: LucraThemeMode;
};

const COLOR_KEYS = [
  'primary',
  'secondary',
  'tertiary',
  'onPrimary',
  'onSecondary',
  'onTertiary',
] as const;

function warnInvalidColor(path: string, value: unknown) {
  console.warn(
    `[LucraSDK] theme.${path}: "${String(value)}" is not a valid hex color. ` +
      'Expected #RGB, #RRGGBB or #AARRGGBB (alpha first). ' +
      'Ignoring it and falling back to the Lucra default.'
  );
}

/**
 * Coerce a hex color into the form both native SDKs parse.
 *
 * Android throws on any length other than 6 or 8 hex digits and iOS silently
 * falls back to its own default, so anything unparseable is dropped here with a
 * warning rather than being handed to the bridge.
 */
export function normalizeHexColor(
  path: string,
  value: string | undefined
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const raw = String(value).trim();
  if (!raw) {
    return undefined;
  }

  const digits = raw.startsWith('#') ? raw.slice(1) : raw;

  if (!/^[0-9a-fA-F]+$/.test(digits)) {
    warnInvalidColor(path, value);
    return undefined;
  }

  // #RGB -> #RRGGBB. Android rejects 3-digit hex outright.
  if (digits.length === 3) {
    return `#${digits
      .split('')
      .map((c) => `${c}${c}`)
      .join('')}`;
  }

  if (digits.length === 6 || digits.length === 8) {
    return `#${digits}`;
  }

  warnInvalidColor(path, value);
  return undefined;
}

function normalizeColorSet(
  prefix: string,
  set: LucraColorSet | undefined
): LucraColorSet | undefined {
  if (!set) {
    return undefined;
  }

  const normalized: LucraColorSet = {};
  for (const key of COLOR_KEYS) {
    const value = normalizeHexColor(
      prefix ? `${prefix}.${key}` : key,
      set[key]
    );
    if (value !== undefined) {
      normalized[key] = value;
    }
  }
  return normalized;
}

const THEME_MODES: readonly string[] = ['light', 'dark', 'system'];

/**
 * Coerce a `themeMode` into one the native bridges understand.
 *
 * Both native mappers fall back to "derive from the palettes" on an
 * unrecognised value, so anything unparseable is dropped here with a warning
 * rather than silently changing the appearance on one platform only.
 */
export function normalizeThemeMode(
  value: string | undefined
): LucraThemeMode | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const raw = String(value).trim().toLowerCase();
  if (!raw) {
    return undefined;
  }

  if (THEME_MODES.includes(raw)) {
    return raw as LucraThemeMode;
  }

  // `AUTO` is the Android SDK's spelling, so anyone reading its docs will
  // reach for it. Name the right value rather than just rejecting.
  if (raw === 'auto') {
    console.warn(
      '[LucraSDK] theme.themeMode: "auto" is the Android SDK\'s spelling. ' +
        'Use "system" to follow the device appearance. Ignoring it.'
    );
    return undefined;
  }

  console.warn(
    `[LucraSDK] theme.themeMode: "${String(value)}" is not a valid theme mode. ` +
      'Expected "light", "dark" or "system". Ignoring it and falling back to ' +
      'the appearance derived from the palettes you supplied.'
  );
  return undefined;
}

/**
 * Warn when a forced `themeMode` has no palette for the appearance it forces.
 *
 * The native SDKs reuse the palette you did supply in that case, which can put
 * colors picked for one appearance against the other appearance's surfaces.
 * Android logs this itself, but only to Logcat, and iOS logs nothing — so a
 * `console.warn` is the one surface developers on both platforms actually see.
 *
 * The conditions mirror the Android SDK's own `warnOnReusedPalette` so the two
 * messages never disagree.
 */
function warnOnReusedPalette(normalized: NormalizedLucraTheme) {
  const { themeMode, light, dark } = normalized;
  if (themeMode === undefined) {
    return;
  }
  // No palettes at all means Lucra's own colors, which cover both appearances.
  if (!light && !dark) {
    return;
  }

  let missing: 'light' | 'dark' | undefined;
  if (!light && themeMode !== 'dark') {
    missing = 'light';
  } else if (!dark && themeMode !== 'light') {
    missing = 'dark';
  }
  if (!missing) {
    return;
  }

  const supplied = missing === 'light' ? 'dark' : 'light';
  console.warn(
    `[LucraSDK] theme.themeMode is "${themeMode}" but no "${missing}" palette ` +
      `was supplied, so Lucra reuses your "${supplied}" palette for it. ` +
      `Check those colors against the ${missing} appearance, or supply a ` +
      `"${missing}" palette.`
  );
}

/**
 * Resolve a `LucraTheme` into per-appearance palettes for the native bridges.
 *
 * A palette's *presence* is what selects the appearance, so an explicitly
 * supplied but empty `light` still means "light, using Lucra's own colors".
 */
export function normalizeTheme(
  theme: LucraTheme | undefined
): NormalizedLucraTheme | undefined {
  if (!theme) {
    return undefined;
  }

  // normalizeColorSet only reads the six color keys, so passing the whole
  // theme picks up just the flat ones.
  const flat = normalizeColorSet('', theme) ?? {};
  const light = normalizeColorSet('light', theme.light);
  const dark = normalizeColorSet('dark', theme.dark);

  const normalized: NormalizedLucraTheme = {};
  if (theme.fontFamily !== undefined) {
    normalized.fontFamily = theme.fontFamily;
  }

  // Set before the palette branches so it survives every exit path, including
  // a theme that carries nothing but a mode.
  const themeMode = normalizeThemeMode(theme.themeMode);
  if (themeMode !== undefined) {
    normalized.themeMode = themeMode;
  }

  if (light || dark) {
    if (light) {
      normalized.light = { ...flat, ...light };
    }
    if (dark) {
      normalized.dark = { ...flat, ...dark };
    }
  } else if (Object.keys(flat).length > 0) {
    // Flat-only: a single palette locked to dark, matching how every release
    // before light-mode support behaved.
    normalized.dark = flat;
  }

  warnOnReusedPalette(normalized);
  return normalized;
}
