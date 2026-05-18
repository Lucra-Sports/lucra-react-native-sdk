import React, { useCallback, useEffect, useRef } from 'react';
import {
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

const HAPTIC_MAP: Record<string, HapticFeedbackTypes> = {
  light: HapticFeedbackTypes.impactLight,
  soft: HapticFeedbackTypes.soft,
  tiny: HapticFeedbackTypes.impactLight,
  selection: HapticFeedbackTypes.selection,
  medium: HapticFeedbackTypes.impactMedium,
  success: HapticFeedbackTypes.notificationSuccess,
  heavy: HapticFeedbackTypes.impactHeavy,
  rigid: HapticFeedbackTypes.rigid,
  failure: HapticFeedbackTypes.notificationError,
  warning: HapticFeedbackTypes.notificationWarning,
};

function triggerHaptic(type: string) {
  try {
    const key = type.toLowerCase();
    ReactNativeHapticFeedback.trigger(
      HAPTIC_MAP[key] ?? HapticFeedbackTypes.impactLight
    );
  } catch {}
}

const INJECTED_JS = `
  (function() {
    window.addEventListener('message', function(e) {
      window.ReactNativeWebView.postMessage(typeof e.data === 'string' ? e.data : JSON.stringify(e.data));
    });
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.skm) {
      var orig = window.webkit.messageHandlers.skm.postMessage.bind(window.webkit.messageHandlers.skm);
      window.webkit.messageHandlers.skm.postMessage = function(msg) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
        orig(msg);
      };
    }
    true;
  })();
`;

type MiniGameWebViewProps = {
  url: string | null;
  onClose: () => void;
};

export const MiniGameWebView: React.FC<MiniGameWebViewProps> = ({
  url,
  onClose,
}) => {
  const webViewRef = useRef<WebView>(null);
  const didClose = useRef(false);

  useEffect(() => {
    if (url) {
      didClose.current = false;
    }
  }, [url]);

  const handleWebViewMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let body: { type?: string; payload?: any };
      try {
        body = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }

      const { type, payload } = body;
      switch (type) {
        case 'set_load_progress':
          break;
        case 'loaded':
        case 'hide_loading_screen':
          break;
        case 'close_game':
          console.log(
            '[MiniGameWebView] close_game received, didClose:',
            didClose.current
          );
          if (!didClose.current) {
            didClose.current = true;
            onClose();
          }
          break;
        case 'haptic_feedback': {
          const cleaned =
            typeof payload === 'string' ? payload.replace(/"/g, '') : '';
          triggerHaptic(cleaned);
          break;
        }
        case 'log': {
          if (payload && typeof payload === 'object') {
            const logType = payload.LogType ?? 'Log';
            const msg = payload.Message ?? '';
            const stack = payload.StackTrace ?? '';
            console.log(
              `[MiniGame JS] [${logType}] ${msg}${stack ? ` | ${stack}` : ''}`
            );
          }
          break;
        }
      }
    },
    [onClose]
  );

  return (
    <Modal
      visible={!!url}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      supportedOrientations={['portrait']}
    >
      <StatusBar hidden />
      <View style={Styles.fullScreen}>
        <WebView
          ref={webViewRef}
          source={{ uri: url ?? '' }}
          style={Styles.webView}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          onMessage={handleWebViewMessage}
          injectedJavaScript={INJECTED_JS}
        />
        <TouchableOpacity style={Styles.closeButton} onPress={onClose}>
          <Text style={Styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const Styles = StyleSheet.create({
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
