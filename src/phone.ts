/**
 * Normalizes a US phone number into the format each native Lucra SDK expects:
 * iOS requires `(XXX) XXX-XXXX`, Android accepts a bare 10-digit string.
 *
 * Accepts common inputs — `5551234567`, `15551234567`, `+1 555 123 4567`,
 * `(555) 123-4567`, `555.123.4567` — and returns the input unchanged when it
 * cannot be reduced to 10 digits, so the native SDK produces its own
 * `invalidPhoneNumber` error instead of this helper guessing.
 */
export function formatUsPhoneNumber(
  input: string,
  style: 'formatted' | 'digits'
): string {
  const digitsOnly = input.replace(/\D/g, '');
  const digits =
    digitsOnly.length === 11 && digitsOnly.startsWith('1')
      ? digitsOnly.slice(1)
      : digitsOnly;
  if (digits.length !== 10) {
    return input;
  }
  if (style === 'digits') {
    return digits;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
