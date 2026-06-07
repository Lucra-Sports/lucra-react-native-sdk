import { ConfigPlugin, withAppDelegate } from '@expo/config-plugins';

const objcFunctionSignature =
  'application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options';

const swiftFunctionSignature =
  'func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool';

const objcHandleVenmoCall = '[[LucraClient sharedInstance] handleVenmoUrl:url];';
const swiftHandleVenmoCall = 'LucraClient.sharedInstance().handleVenmoUrl(url)';

export const withIosVenmoLinkHandler: ConfigPlugin = (config) => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  return withAppDelegate(config, (config) => {
    const language = config.modResults.language;

    if (language === 'swift') {
      if (!config.modResults.contents.includes('import lucra_react_native_sdk')) {
        config.modResults.contents = `import lucra_react_native_sdk\n${config.modResults.contents}`;
      }

      if (config.modResults.contents.includes(swiftFunctionSignature)) {
        // Add the Venmo URL handling line to the existing Swift method.
        const existingSwiftMethodRegex =
          /func application\(_ application: UIApplication, open url: URL, options: \[UIApplication\.OpenURLOptionsKey : Any\](?: = \[:\])?\) -> Bool \{([\s\S]*?)\n\}/;
        config.modResults.contents = config.modResults.contents.replace(
          existingSwiftMethodRegex,
          (match, methodBody) => {
            if (methodBody.includes(swiftHandleVenmoCall)) {
              return match;
            }

            return match.replace(
              methodBody,
              `\n    _ = ${swiftHandleVenmoCall}\n${methodBody}`
            );
          }
        );
      } else {
        // Add a Swift openURL override if one doesn't already exist.
        config.modResults.contents += `
public override func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
  _ = ${swiftHandleVenmoCall}
  return super.application(application, open: url, options: options)
}
`;
      }

      return config;
    }

    if (!config.modResults.contents.includes('#import "LucraClient.h"')) {
      config.modResults.contents = `#import "LucraClient.h"\n${config.modResults.contents}`;
    }

    if (config.modResults.contents.includes(objcFunctionSignature)) {
      // Add the Venmo URL handling snippet to the existing method
      const existingMethodRegex =
        /- \(BOOL\)application:\(UIApplication \*\)application openURL:\(NSURL \*\)url options:\(NSDictionary<UIApplicationOpenURLOptionsKey,id> \*\)options \{([\s\S]*?)\}/;
      config.modResults.contents = config.modResults.contents.replace(
        existingMethodRegex,
        (match, methodBody) => {
          if (methodBody.includes(objcHandleVenmoCall)) {
            return match; // The snippet is already present
          }
          return match.replace(
            methodBody,
            `\n  ${objcHandleVenmoCall}\n${methodBody}`
          );
        }
      );
    } else {
      // Add the entire method if it doesn't exist
      config.modResults.contents += `
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    [[LucraClient sharedInstance] handleVenmoUrl:url];
    return [RCTLinkingManager application:application openURL:url options:options];
}
`;
    }
    return config;
  });
};

export default withIosVenmoLinkHandler;
