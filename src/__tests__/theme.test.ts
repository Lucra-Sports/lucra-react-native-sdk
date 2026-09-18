import { normalizeHexColor, normalizeTheme } from '../theme';

describe('normalizeHexColor', () => {
  it('passes 6-digit hex through, adding the missing #', () => {
    expect(normalizeHexColor('primary', '#09E35F')).toBe('#09E35F');
    expect(normalizeHexColor('primary', '09E35F')).toBe('#09E35F');
  });

  it('expands #RGB shorthand, which Android would otherwise reject', () => {
    expect(normalizeHexColor('primary', '#abc')).toBe('#aabbcc');
  });

  it('passes 8-digit hex through', () => {
    expect(normalizeHexColor('primary', '#8009E35F')).toBe('#8009E35F');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeHexColor('primary', '  #09E35F  ')).toBe('#09E35F');
  });

  it('drops unparseable values with a warning rather than crashing Android', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(normalizeHexColor('primary', 'rgba(0,0,0,0.5)')).toBeUndefined();
    expect(normalizeHexColor('primary', '#12345')).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it('treats missing and empty values as unset, without warning', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(normalizeHexColor('primary', undefined)).toBeUndefined();
    expect(normalizeHexColor('primary', '')).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('normalizeTheme', () => {
  const light = { primary: '#1A73E8', onPrimary: '#FFFFFF' };
  const dark = { primary: '#8AB4F8', onPrimary: '#0B1220' };

  it('returns undefined when no theme is supplied', () => {
    expect(normalizeTheme(undefined)).toBeUndefined();
  });

  it('keeps both palettes so the SDK follows the device', () => {
    expect(normalizeTheme({ light, dark })).toEqual({ light, dark });
  });

  it('locks light when only a light palette is supplied', () => {
    expect(normalizeTheme({ light })).toEqual({ light });
  });

  it('locks dark when only a dark palette is supplied', () => {
    expect(normalizeTheme({ dark })).toEqual({ dark });
  });

  it('maps flat colors to dark only, preserving pre-light-mode behaviour', () => {
    expect(
      normalizeTheme({ primary: '#09E35F', onPrimary: '#001448' })
    ).toEqual({ dark: { primary: '#09E35F', onPrimary: '#001448' } });
  });

  it('treats flat colors as a base that per-appearance palettes override', () => {
    expect(
      normalizeTheme({
        secondary: '#5E5BD0',
        tertiary: '#9C99FC',
        light: { primary: '#1A73E8' },
        dark: { primary: '#8AB4F8', tertiary: '#312F6B' },
      })
    ).toEqual({
      light: { primary: '#1A73E8', secondary: '#5E5BD0', tertiary: '#9C99FC' },
      dark: { primary: '#8AB4F8', secondary: '#5E5BD0', tertiary: '#312F6B' },
    });
  });

  it('honours an explicitly empty palette as "this appearance, Lucra colors"', () => {
    expect(normalizeTheme({ light: {}, dark })).toEqual({ light: {}, dark });
  });

  it('carries fontFamily through untouched', () => {
    const fontFamily = {
      normal: 'Inter Regular',
      medium: 'Inter Medium',
      semibold: 'Inter SemiBold',
      bold: 'Inter Bold',
    };
    expect(normalizeTheme({ light, dark, fontFamily })).toEqual({
      light,
      dark,
      fontFamily,
    });
  });

  it('normalizes colors inside per-appearance palettes', () => {
    expect(normalizeTheme({ light: { primary: 'abc' } })).toEqual({
      light: { primary: '#aabbcc' },
    });
  });
});

describe('normalizeTheme themeMode', () => {
  const light = { primary: '#1A73E8', onPrimary: '#FFFFFF' };
  const dark = { primary: '#8AB4F8', onPrimary: '#0B1220' };

  let warn: jest.SpyInstance;
  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it('reaches native on a theme that carries nothing else', () => {
    // The "Lucra's own colors, forced light" config. It has to survive the
    // palette branches, which it only does because themeMode is set first.
    expect(normalizeTheme({ themeMode: 'light' })).toEqual({
      themeMode: 'light',
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it('rides alongside both palettes', () => {
    expect(normalizeTheme({ light, dark, themeMode: 'dark' })).toEqual({
      light,
      dark,
      themeMode: 'dark',
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it('passes "system" through unmapped — JS never emits Android\'s AUTO', () => {
    expect(
      normalizeTheme({ light, dark, themeMode: 'system' })?.themeMode
    ).toBe('system');
  });

  it('lowercases a mode that came in capitalised', () => {
    expect(
      normalizeTheme({ light, dark, themeMode: 'Light' as any })?.themeMode
    ).toBe('light');
    expect(warn).not.toHaveBeenCalled();
  });

  it('rejects Android\'s "auto" spelling and names "system" instead', () => {
    expect(
      normalizeTheme({ light, dark, themeMode: 'auto' as any })?.themeMode
    ).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('"system"');
  });

  it('drops an unparseable mode with a warning', () => {
    expect(
      normalizeTheme({ light, dark, themeMode: 42 as any })?.themeMode
    ).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('never leaks themeMode into a palette', () => {
    const normalized = normalizeTheme({
      themeMode: 'light',
      primary: '#09E35F',
    });
    expect(normalized).toEqual({
      dark: { primary: '#09E35F' },
      themeMode: 'light',
    });
    expect(normalized?.dark).not.toHaveProperty('themeMode');
  });

  describe('cross-fill warning', () => {
    it('warns when a forced light mode has only a dark palette', () => {
      normalizeTheme({ dark, themeMode: 'light' });
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('"light"');
    });

    it('warns when a forced dark mode has only a light palette', () => {
      normalizeTheme({ light, themeMode: 'dark' });
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('"dark"');
    });

    it('warns for "system" with only one palette — it reuses it for the other', () => {
      normalizeTheme({ dark, themeMode: 'system' });
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('warns for flat-only colors, which resolve to a dark palette', () => {
      normalizeTheme({ primary: '#09E35F', themeMode: 'light' });
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('stays quiet when both palettes are supplied', () => {
      normalizeTheme({ light, dark, themeMode: 'light' });
      expect(warn).not.toHaveBeenCalled();
    });

    it('stays quiet with no palettes — Lucra owns both appearances then', () => {
      normalizeTheme({ themeMode: 'light' });
      expect(warn).not.toHaveBeenCalled();
    });

    it('stays quiet when no mode is forced, however lopsided the palettes', () => {
      normalizeTheme({ dark });
      expect(warn).not.toHaveBeenCalled();
    });
  });
});
