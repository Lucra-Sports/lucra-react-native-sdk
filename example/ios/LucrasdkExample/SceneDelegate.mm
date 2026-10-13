#import "SceneDelegate.h"
#import "AppDelegate.h"

@implementation SceneDelegate

- (void)scene:(UIScene *)scene
    willConnectToSession:(UISceneSession *)session
                 options:(UISceneConnectionOptions *)connectionOptions {
  AppDelegate *appDelegate =
      (AppDelegate *)UIApplication.sharedApplication.delegate;

  self.window =
      [[UIWindow alloc] initWithWindowScene:(UIWindowScene *)scene];
  appDelegate.window = self.window;
  [appDelegate.reactNativeFactory
      startReactNativeWithModuleName:appDelegate.moduleName
                            inWindow:self.window
                       launchOptions:[self launchOptionsFrom:connectionOptions]];

  [self scene:scene openURLContexts:connectionOptions.URLContexts];
  for (NSUserActivity *userActivity in connectionOptions.userActivities) {
    [self scene:scene continueUserActivity:userActivity];
  }
}

- (void)scene:(UIScene *)scene
    openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts {
  UIApplication *application = UIApplication.sharedApplication;
  for (UIOpenURLContext *context in URLContexts) {
    NSMutableDictionary<UIApplicationOpenURLOptionsKey, id> *options =
        [NSMutableDictionary new];
    if (context.options.sourceApplication) {
      options[UIApplicationOpenURLOptionsSourceApplicationKey] =
          context.options.sourceApplication;
    }
    if (context.options.annotation) {
      options[UIApplicationOpenURLOptionsAnnotationKey] =
          context.options.annotation;
    }
    options[UIApplicationOpenURLOptionsOpenInPlaceKey] =
        @(context.options.openInPlace);

    [application.delegate application:application
                              openURL:context.URL
                              options:options];
  }
}

- (void)scene:(UIScene *)scene
    continueUserActivity:(NSUserActivity *)userActivity {
  UIApplication *application = UIApplication.sharedApplication;
  if (![application.delegate
          respondsToSelector:@selector(application:
                                 continueUserActivity:restorationHandler:)]) {
    return;
  }
  [application.delegate application:application
               continueUserActivity:userActivity
                 restorationHandler:^(NSArray<id<UIUserActivityRestoring>>
                                          *_Nullable restorableObjects){
                 }];
}

// RCTLinkingManager resolves Linking.getInitialURL() from these launch option
// keys, which UIKit no longer populates once the app uses the scene lifecycle.
- (NSDictionary *)launchOptionsFrom:
    (UISceneConnectionOptions *)connectionOptions {
  NSMutableDictionary *launchOptions = [NSMutableDictionary new];

  NSURL *url = connectionOptions.URLContexts.anyObject.URL;
  if (url) {
    launchOptions[UIApplicationLaunchOptionsURLKey] = url;
  }

  NSUserActivity *userActivity = connectionOptions.userActivities.anyObject;
  if (userActivity) {
    launchOptions[UIApplicationLaunchOptionsUserActivityDictionaryKey] = @{
      UIApplicationLaunchOptionsUserActivityTypeKey : userActivity.activityType,
      @"UIApplicationLaunchOptionsUserActivityKey" : userActivity,
    };
  }

  return launchOptions;
}

@end
