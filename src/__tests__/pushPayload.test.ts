import { extractLucraDeeplink } from '../pushPayload';

describe('extractLucraDeeplink', () => {
  it('returns a top-level deeplink', () => {
    expect(extractLucraDeeplink({ deeplink: 'https://lucra.link/abc' })).toBe(
      'https://lucra.link/abc'
    );
  });

  it('prefers the top-level deeplink over jsonBody', () => {
    expect(
      extractLucraDeeplink({
        deeplink: 'https://lucra.link/top',
        jsonBody: { deeplink: 'https://lucra.link/nested' },
      })
    ).toBe('https://lucra.link/top');
  });

  it('falls back to a jsonBody object', () => {
    expect(
      extractLucraDeeplink({
        jsonBody: { deeplink: 'https://lucra.link/nested' },
      })
    ).toBe('https://lucra.link/nested');
  });

  it('parses jsonBody when it is a JSON string (FCM data values)', () => {
    expect(
      extractLucraDeeplink({
        jsonBody: '{"deeplink":"https://lucra.link/string-body"}',
      })
    ).toBe('https://lucra.link/string-body');
  });

  it('falls back to the pinpoint.deeplink key', () => {
    expect(
      extractLucraDeeplink({ 'pinpoint.deeplink': 'https://lucra.link/pp' })
    ).toBe('https://lucra.link/pp');
  });

  it('ignores empty deeplink strings', () => {
    expect(
      extractLucraDeeplink({
        deeplink: '',
        jsonBody: { deeplink: 'https://lucra.link/nested' },
      })
    ).toBe('https://lucra.link/nested');
  });

  it('returns null for malformed jsonBody strings', () => {
    expect(extractLucraDeeplink({ jsonBody: 'not-json' })).toBeNull();
  });

  it('returns null when no deeplink is present', () => {
    expect(extractLucraDeeplink({})).toBeNull();
    expect(extractLucraDeeplink({ title: 'hi', deeplink: 42 })).toBeNull();
  });

  it('returns null for non-object payloads', () => {
    expect(extractLucraDeeplink(null as never)).toBeNull();
    expect(extractLucraDeeplink(undefined as never)).toBeNull();
  });
});
