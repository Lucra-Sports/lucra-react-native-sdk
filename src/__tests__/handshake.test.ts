/**
 * The JS half of the handshake token protocol.
 *
 * Native asks for a token with a `requestId`; JS must answer exactly once, on
 * the matching reply channel. These are the cases where answering wrongly costs
 * the user a 5-second native timeout or a misleading error code.
 */

const mockListeners: Record<string, (payload: any) => void> = {};

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => ({
  __esModule: true,
  default: class {
    addListener(name: string, cb: (payload: any) => void) {
      mockListeners[name] = cb;
      return { remove: jest.fn() };
    }
    removeAllListeners() {}
  },
}));

// `src/index.tsx` pulls in MiniGameWebView, whose deps ship untranspiled TS.
// Neither is involved in handshake auth, so stub them rather than widening the
// shared transformIgnorePatterns.
jest.mock('react-native-haptic-feedback', () => ({
  __esModule: true,
  default: { trigger: jest.fn() },
  HapticFeedbackTypes: {},
}));
jest.mock('react-native-webview', () => ({ WebView: 'WebView' }));

// Built inside the factory: jest hoists `jest.mock` above the imports, so a
// module-scope `const` would still be in its temporal dead zone here.
jest.mock('../NativeLucraClient', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn().mockResolvedValue(undefined),
    registerHandshakeAuthTokenProvider: jest.fn().mockResolvedValue(undefined),
    resolveHandshakeAuthToken: jest.fn(),
    rejectHandshakeAuthToken: jest.fn(),
    signInWithHandshakeAuth: jest.fn(),
    getAuthState: jest.fn(),
  },
}));

import { LucraSDK } from '../index';
import NativeLucraClient from '../NativeLucraClient';

type MockedNative = {
  initialize: jest.Mock;
  registerHandshakeAuthTokenProvider: jest.Mock;
  resolveHandshakeAuthToken: jest.Mock;
  rejectHandshakeAuthToken: jest.Mock;
  signInWithHandshakeAuth: jest.Mock;
  getAuthState: jest.Mock;
};

const mockNative = NativeLucraClient as unknown as MockedNative;

/** Simulate native asking JS for a token, and wait for the reply to be sent. */
async function requestToken(requestId = 'req-1') {
  mockListeners._handshakeAuthToken?.({ requestId });
  // Let the listener's async provider call settle.
  await new Promise((resolve) => setImmediate(resolve));
}

describe('handshake token protocol', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // init() installs the always-on mockListeners and marks the SDK ready, so the
    // registration below reaches native rather than being staged.
    await LucraSDK.init({ apiKey: 'k', environment: 'sandbox' } as any);
  });

  it('answers with the provider token', async () => {
    await LucraSDK.registerHandshakeAuthTokenProvider(async () => 'jwt-abc');
    await requestToken();

    expect(mockNative.resolveHandshakeAuthToken).toHaveBeenCalledWith(
      'req-1',
      'jwt-abc'
    );
    expect(mockNative.rejectHandshakeAuthToken).not.toHaveBeenCalled();
  });

  it('correlates the reply to the request id native sent', async () => {
    await LucraSDK.registerHandshakeAuthTokenProvider(async () => 'jwt-abc');
    await requestToken('req-42');

    expect(mockNative.resolveHandshakeAuthToken).toHaveBeenCalledWith(
      'req-42',
      'jwt-abc'
    );
  });

  it('reports the provider error message so it surfaces as providerFailed', async () => {
    await LucraSDK.registerHandshakeAuthTokenProvider(async () => {
      throw new Error('partner backend returned 503');
    });
    await requestToken();

    expect(mockNative.resolveHandshakeAuthToken).not.toHaveBeenCalled();
    expect(mockNative.rejectHandshakeAuthToken).toHaveBeenCalledWith(
      'req-1',
      'partner backend returned 503'
    );
  });

  it('rejects an empty token in JS rather than letting it become exchangeFailed', async () => {
    await LucraSDK.registerHandshakeAuthTokenProvider(async () => '');
    await requestToken();

    expect(mockNative.resolveHandshakeAuthToken).not.toHaveBeenCalled();
    expect(mockNative.rejectHandshakeAuthToken).toHaveBeenCalledTimes(1);
    expect(mockNative.rejectHandshakeAuthToken.mock.calls[0][1]).toMatch(
      /no token/i
    );
  });

  it('rejects a non-string token', async () => {
    await LucraSDK.registerHandshakeAuthTokenProvider(
      async () => undefined as any
    );
    await requestToken();

    expect(mockNative.resolveHandshakeAuthToken).not.toHaveBeenCalled();
    expect(mockNative.rejectHandshakeAuthToken).toHaveBeenCalledTimes(1);
  });

  it('replies immediately when the provider has been cleared', async () => {
    await LucraSDK.registerHandshakeAuthTokenProvider(async () => 'jwt-abc');
    await LucraSDK.registerHandshakeAuthTokenProvider(null);
    await requestToken();

    expect(mockNative.resolveHandshakeAuthToken).not.toHaveBeenCalled();
    expect(mockNative.rejectHandshakeAuthToken).toHaveBeenCalledTimes(1);
    expect(mockNative.rejectHandshakeAuthToken.mock.calls[0][1]).toMatch(
      /no handshake auth token provider/i
    );
  });

  it('answers each request exactly once', async () => {
    await LucraSDK.registerHandshakeAuthTokenProvider(async () => 'jwt-abc');
    await requestToken();

    const replies =
      mockNative.resolveHandshakeAuthToken.mock.calls.length +
      mockNative.rejectHandshakeAuthToken.mock.calls.length;
    expect(replies).toBe(1);
  });

  it('tells native whether a provider exists, and passes the ToS bypass', async () => {
    await LucraSDK.registerHandshakeAuthTokenProvider(async () => 'jwt', {
      bypassTosAgreement: true,
    });
    expect(mockNative.registerHandshakeAuthTokenProvider).toHaveBeenCalledWith(
      true,
      true
    );

    await LucraSDK.registerHandshakeAuthTokenProvider(null);
    expect(
      mockNative.registerHandshakeAuthTokenProvider
    ).toHaveBeenLastCalledWith(false, false);
  });
});

describe('auth state', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await LucraSDK.init({ apiKey: 'k', environment: 'sandbox' } as any);
  });

  it('replays the last state to a new subscriber', () => {
    mockListeners.authState?.({
      isHandshakeAuthInFlight: true,
      handshakeAuthError: null,
      isResolvingAuthState: false,
    });

    const seen: any[] = [];
    LucraSDK.subscribeToAuthState((state) => seen.push(state));

    expect(seen).toHaveLength(1);
    expect(seen[0].isHandshakeAuthInFlight).toBe(true);
  });

  it('normalizes a missing isResolvingAuthState to null, as Android sends', () => {
    const seen: any[] = [];
    LucraSDK.subscribeToAuthState((state) => seen.push(state));
    mockListeners.authState?.({ isHandshakeAuthInFlight: false });

    expect(seen[seen.length - 1].isResolvingAuthState).toBeNull();
    expect(seen[seen.length - 1].handshakeAuthError).toBeNull();
  });

  it('fans out to every subscriber and stops on unsubscribe', () => {
    const a: any[] = [];
    const b: any[] = [];
    const unsubscribeA = LucraSDK.subscribeToAuthState((s) => a.push(s));
    LucraSDK.subscribeToAuthState((s) => b.push(s));

    mockListeners.authState?.({ isHandshakeAuthInFlight: true });
    const afterFirst = a.length;
    unsubscribeA();
    mockListeners.authState?.({ isHandshakeAuthInFlight: false });

    expect(a).toHaveLength(afterFirst);
    expect(b.length).toBeGreaterThan(afterFirst);
  });
});
