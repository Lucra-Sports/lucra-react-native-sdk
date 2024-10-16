import { Linking } from 'react-native';

import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import { CustomSchemeProvider } from './customSchemeProvider';

export function setupDeepLink(urlScheme: string) {
  const deepLinkProvider = CustomSchemeProvider(urlScheme);
  LucraSDK.registerDeepLinkProvider(async (lucraLink: string) => {
    const deepLink = deepLinkProvider.createDeepLink(
      encodeURIComponent(lucraLink)
    );
    return deepLink;
  });

  const handleDeepLink = async ({ url }: { url: string }) => {
    const lucraLink = decodeURIComponent(
      deepLinkProvider.parseDeepLink(url) || ''
    );
    if (!lucraLink) {
      return console.log('Lucra link not found');
    }
    await LucraSDK.handleLucraLink(lucraLink);
  };
  const linkingSubscription = Linking.addEventListener('url', handleDeepLink);
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink({ url });
    }
  });

  return linkingSubscription;
}
