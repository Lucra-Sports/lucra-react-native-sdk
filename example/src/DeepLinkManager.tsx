import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import { Platform, Linking } from 'react-native';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { useEffect, useRef } from 'react';

import { AppState } from 'react-native';

export async function buildLink(lucraLink: string) {
  const link = await dynamicLinks().buildShortLink({
    link: lucraLink,
    domainUriPrefix: 'https://sandboxlucrasdk.page.link',
    android: {
      packageName: 'com.lucrasports.mobile.rnsample',
    },
    ios: {
      bundleId: 'com.lucrasports.mobile-rnsample',
    },
  });

  return link;
}

export function DeepLinkManager() {
  // Sometimes the RN app will open but will not be fully active, for this use case you can save the link and process it latter and listen on AppState changes
  const savedDeepLink = useRef('');

  useEffect(() => {
    const appStateListener = AppState.addEventListener(
      'change',
      async (newAppState) => {
        if (newAppState === 'active' && savedDeepLink.current.length > 0) {
          const handled = await LucraSDK.handleLucraLink(savedDeepLink.current);
          savedDeepLink.current = '';
          if (handled) {
            console.log('Lucra flow handled on appState change');
            return;
          }
          console.log('deeplink not handled by Lucra, do something else');
        }
      }
    );

    LucraSDK.registerDeepLinkProvider(async (lucraLink: string) => {
      const deepLink = await buildLink(lucraLink);
      console.log('🟧 Deep link created!', deepLink);
      return deepLink;
    });

    const handleDeepLink = async ({ url }: { url: string }) => {
      console.log(`handle deep link called with url: "${url}"`);
      if (AppState.currentState !== 'active') {
        savedDeepLink.current = url;
        return;
      }

      if (!url) {
        console.log('🟥 No URL has been passed to handleDeepLink');
        return;
      }

      const handled = await LucraSDK.handleLucraLink(url);

      savedDeepLink.current = '';
      console.log(`🟩 Link handled by Lucrasdk ${handled}`);
    };

    if (Platform.OS === 'ios') {
      Linking.getInitialURL().then((res) => {
        console.log('Get initial URL resolved with', res);
        dynamicLinks()
          .resolveLink(res || '')
          .then((link) => {
            handleDeepLink({ url: link.url });
          });
      });
    }

    dynamicLinks()
      .getInitialLink()
      .then((link) => {
        console.log('🔵 getInitialLink called', link);
        handleDeepLink({ url: link?.url || '' });
      });

    const unsubscribe = dynamicLinks().onLink(handleDeepLink);

    return () => {
      savedDeepLink.current = '';
      unsubscribe();
      appStateListener.remove();
    };
  }, []);
  return null;
}
