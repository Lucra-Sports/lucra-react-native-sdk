/**
 * Extracts the Lucra deeplink from a push-notification payload.
 *
 * Mirrors the native SDK's payload handling: AWS Pinpoint sends notification
 * fields as top-level keys in the APNs data payload, with older payloads
 * wrapping them in `jsonBody`. On Android FCM, Pinpoint prefixes data keys
 * with `pinpoint.`, and data values arrive as strings, so `jsonBody` may be
 * a JSON-encoded string rather than an object.
 */
export function extractLucraDeeplink(
  payload: Record<string, unknown>
): string | null {
  if (payload == null || typeof payload !== 'object') {
    return null;
  }

  const direct = payload.deeplink;
  if (typeof direct === 'string' && direct.length > 0) {
    return direct;
  }

  let jsonBody = payload.jsonBody;
  if (typeof jsonBody === 'string') {
    try {
      jsonBody = JSON.parse(jsonBody);
    } catch {
      jsonBody = null;
    }
  }
  if (jsonBody != null && typeof jsonBody === 'object') {
    const nested = (jsonBody as Record<string, unknown>).deeplink;
    if (typeof nested === 'string' && nested.length > 0) {
      return nested;
    }
  }

  const pinpoint = payload['pinpoint.deeplink'];
  if (typeof pinpoint === 'string' && pinpoint.length > 0) {
    return pinpoint;
  }

  return null;
}
