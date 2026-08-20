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
 * Theme passed to `LucraSDK.init`.
 *
 * The SDK's appearance is derived from which palettes you supply:
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
 */
export type LucraTheme = LucraColorSet & {
  light?: LucraColorSet;
  dark?: LucraColorSet;
  fontFamily?: LucraFontFamily;
};

/**
 * The shape handed across the bridge: per-appearance palettes already resolved,
 * so the native mappers only have to pick the matching `ClientTheme`
 * initializer.
 */
export type NormalizedLucraTheme = {
  light?: LucraColorSet;
  dark?: LucraColorSet;
  fontFamily?: LucraFontFamily;
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

  if (light || dark) {
    if (light) {
      normalized.light = { ...flat, ...light };
    }
    if (dark) {
      normalized.dark = { ...flat, ...dark };
    }
    return normalized;
  }

  // Flat-only: a single palette locked to dark, matching how every release
  // before light-mode support behaved.
  if (Object.keys(flat).length > 0) {
    normalized.dark = flat;
  }
  return normalized;
}
