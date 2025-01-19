#import "AppDelegate.h"
#import "LucraClient.h"
#import <Firebase.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  self.moduleName = @"LucrasdkExample";
  [FIRApp configure];

  return [super application:application
      didFinishLaunchingWithOptions:launchOptions];
}

- (void)application:(UIApplication *)application
    didRegisterForRemoteNotificationsWithDeviceToken:
        (nonnull NSData *)deviceToken {
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:
                (NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  // Handle the incoming URL
  if ([[url host] isEqualToString:@"venmo.com"]) {
    return [[LucraClient sharedInstance] handleVenmoUrl:url];
  }
  return [RCTLinkingManager application:application
                                openURL:url
                                options:options];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
  return [self bundleURL];
}

- (NSURL *)bundleURL {
#if DEBUG
  return
      [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main"
                                 withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is
/// turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New
/// Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it
/// returns `false`.
- (BOOL)concurrentRootEnabled {
  return true;
}

@end
