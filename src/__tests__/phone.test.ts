import { formatUsPhoneNumber } from '../phone';

describe('formatUsPhoneNumber', () => {
  it('formats a bare 10-digit number for iOS', () => {
    expect(formatUsPhoneNumber('5551234567', 'formatted')).toBe(
      '(555) 123-4567'
    );
  });

  it('returns bare digits for Android', () => {
    expect(formatUsPhoneNumber('(555) 123-4567', 'digits')).toBe('5551234567');
  });

  it('strips a leading 1 country code', () => {
    expect(formatUsPhoneNumber('15551234567', 'formatted')).toBe(
      '(555) 123-4567'
    );
    expect(formatUsPhoneNumber('+1 555 123 4567', 'digits')).toBe('5551234567');
  });

  it('handles dot and space separators', () => {
    expect(formatUsPhoneNumber('555.123.4567', 'formatted')).toBe(
      '(555) 123-4567'
    );
    expect(formatUsPhoneNumber('555 123 4567', 'formatted')).toBe(
      '(555) 123-4567'
    );
  });

  it('keeps an already formatted number stable', () => {
    expect(formatUsPhoneNumber('(555) 123-4567', 'formatted')).toBe(
      '(555) 123-4567'
    );
  });

  it('returns unparseable input unchanged so the native SDK rejects it', () => {
    expect(formatUsPhoneNumber('12345', 'formatted')).toBe('12345');
    expect(formatUsPhoneNumber('12345', 'digits')).toBe('12345');
    expect(formatUsPhoneNumber('', 'formatted')).toBe('');
    expect(formatUsPhoneNumber('25551234567', 'digits')).toBe('25551234567');
  });
});
