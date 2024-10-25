import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
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
        if (newAppState === 'active' && savedDeepLink.current) {
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
      return deepLink;
    });

    const handleDeepLink = async ({ url }: { url: string }) => {
      console.log('handle deep link called');
      if (AppState.currentState !== 'active') {
        savedDeepLink.current = url;
        return;
      }

      if (!url) {
        return console.log('Lucra link not found');
      }
      const handled = await LucraSDK.handleLucraLink(url);
      console.log(`Link handled by Lucrasdk ${handled}`);
    };

    dynamicLinks()
      .getInitialLink()
      .then((link) => {
        console.log('getInitialLink called');
        handleDeepLink({ url: link?.url || '' });
      });

    const unsubscribe = dynamicLinks().onLink(handleDeepLink);

    return () => {
      unsubscribe();
      appStateListener.remove();
    };
  }, []);
  return null;
}
