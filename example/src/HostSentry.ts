import * as Sentry from '@sentry/react-native';
import { Linking } from 'react-native';

const dsn = (process.env.HOST_SENTRY_DSN ?? '').trim();

export const hostSentryEnabled = dsn.length > 0;

export function initHostSentry() {
  if (!hostSentryEnabled) {
    console.log(
      '[HostSentry] HOST_SENTRY_DSN is not set; host Sentry stays off'
    );
    return;
  }
  Sentry.init({
    dsn,
    debug: true,
    environment: 'lucra-rn-example',
    tracesSampleRate: 0,
  });
  console.log('[HostSentry] initialized');
}

type SmokeKind = 'js' | 'unhandled' | 'native';

function smokeKindFromUrl(url: string | null): SmokeKind | null {
  if (!url || !url.includes('sentry-smoke')) {
    return null;
  }
  const kind = /[?&]kind=([a-z]+)/.exec(url)?.[1];
  return kind === 'js' || kind === 'unhandled' || kind === 'native'
    ? kind
    : 'js';
}

export function runHostSentrySmoke(kind: SmokeKind) {
  const stamp = new Date().toISOString();
  console.log(`[HostSentry] smoke test "${kind}" at ${stamp}`);
  switch (kind) {
    case 'js':
      Sentry.captureException(
        new Error(`Lucra RN example host-Sentry smoke test (captured) ${stamp}`)
      );
      return;
    case 'unhandled':
      setTimeout(() => {
        throw new Error(
          `Lucra RN example host-Sentry smoke test (unhandled) ${stamp}`
        );
      }, 0);
      return;
    case 'native':
      Sentry.nativeCrash();
      return;
  }
}

export function startHostSentrySmokeListener(): () => void {
  if (!hostSentryEnabled) {
    return () => {};
  }
  const handle = (url: string | null) => {
    const kind = smokeKindFromUrl(url);
    if (kind) {
      runHostSentrySmoke(kind);
    }
  };
  Linking.getInitialURL()
    .then(handle)
    .catch(() => {});
  const subscription = Linking.addEventListener('url', ({ url }) =>
    handle(url)
  );
  return () => subscription.remove();
}
