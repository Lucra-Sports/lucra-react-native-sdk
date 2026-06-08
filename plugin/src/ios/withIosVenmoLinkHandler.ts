import { ConfigPlugin, withAppDelegate } from '@expo/config-plugins';

const objcFunctionSignature =
  'application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options';

const objcHandleVenmoCall = '[[LucraClient sharedInstance] handleVenmoUrl:url];';
const swiftHandleVenmoCall = 'LucraClient.sharedInstance().handleVenmoUrl(url)';
const swiftInjectedMethod = `
public override func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
  _ = ${swiftHandleVenmoCall}
  return super.application(application, open: url, options: options)
}
`;

export const withIosVenmoLinkHandler: ConfigPlugin = (config) => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  return withAppDelegate(config, (config) => {
    const language = config.modResults.language;

    if (language === 'swift') {
      if (!config.modResults.contents.includes('import lucra_react_native_sdk')) {
        config.modResults.contents = `import lucra_react_native_sdk\n${config.modResults.contents}`;
      }

      // Clean up previously injected global method blocks (outside AppDelegate).
      config.modResults.contents = config.modResults.contents.replace(
        /\npublic override func application\(_ application: UIApplication, open url: URL, options: \[UIApplication\.OpenURLOptionsKey : Any\] = \[:\]\) -> Bool \{\n  _ = LucraClient\.sharedInstance\(\)\.handleVenmoUrl\(url\)\n  return super\.application\(application, open: url, options: options\)\n\}\n/g,
        '\n'
      );

      // Match multiline/one-line Swift openURL signatures and inject call inside method body.
      const existingSwiftMethodRegex =
        /public\s+override\s+func\s+application\(\s*_[^,]+,\s*open\s+url:\s*URL,\s*options:\s*\[UIApplication\.OpenURLOptionsKey\s*:\s*Any\]\s*=\s*\[:\]\s*\)\s*->\s*Bool\s*\{([\s\S]*?)\n\s*\}/m;

      if (existingSwiftMethodRegex.test(config.modResults.contents)) {
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
        // Add a Swift openURL override inside AppDelegate if one doesn't exist.
        const appDelegateClassBoundary = '\n}\n\nclass ReactNativeDelegate';
        if (config.modResults.contents.includes(appDelegateClassBoundary)) {
          config.modResults.contents = config.modResults.contents.replace(
            appDelegateClassBoundary,
            `${swiftInjectedMethod}${appDelegateClassBoundary}`
          );
        }
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
