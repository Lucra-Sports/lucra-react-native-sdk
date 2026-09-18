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

  it('carries themeMode through alongside the palettes', () => {
    expect(normalizeTheme({ light, dark, themeMode: 'auto' })).toEqual({
      light,
      dark,
      themeMode: 'auto',
    });
  });

  it('forwards themeMode on its own, with no palette to infer from', () => {
    expect(normalizeTheme({ themeMode: 'light' })).toEqual({
      themeMode: 'light',
    });
  });
});
