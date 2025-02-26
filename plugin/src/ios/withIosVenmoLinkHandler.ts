import { ConfigPlugin, withAppDelegate } from '@expo/config-plugins';

export const withIosVenmoLinkHandler: ConfigPlugin = (config) => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  return withAppDelegate(config, (config) => {
    if (!config.modResults.contents.includes('#import "LucraClient.h"')) {
      config.modResults.contents = `#import "LucraClient.h"\n${config.modResults.contents}`;
    }

    if (
      config.modResults.contents.includes(
        'application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options'
      )
    ) {
      // Add the Venmo URL handling snippet to the existing method
      const existingMethodRegex =
        /- \(BOOL\)application:\(UIApplication \*\)application openURL:\(NSURL \*\)url options:\(NSDictionary<UIApplicationOpenURLOptionsKey, id> \*\)options \{([\s\S]*?)\}/;
      config.modResults.contents = config.modResults.contents.replace(
        existingMethodRegex,
        (match, methodBody) => {
          if (
            methodBody.includes('[[url host] isEqualToString:@"venmo.com"]')
          ) {
            return match; // The snippet is already present
          }
          return match.replace(
            methodBody,
            `${methodBody.trim()}\n  if ([[url host] isEqualToString:@"venmo.com"]) {\n    return [[LucraClient sharedInstance] handleVenmoUrl:url];\n  }\n`
          );
        }
      );
    } else {
      // Add the entire method if it doesn't exist
      config.modResults.contents += `
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
    if ([[url host] isEqualToString:@"venmo.com"]) {
        return [[LucraClient sharedInstance] handleVenmoUrl:url];
    }
    return [RCTLinkingManager application:application openURL:url options:options];
}
`;
    }
    return config;
  });
};

export default withIosVenmoLinkHandler;
