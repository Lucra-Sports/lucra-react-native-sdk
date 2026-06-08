#import "RCTBridge.h"
#if __has_include(<lucra_react_native_sdk/lucra_react_native_sdk-Swift.h>)
#import <lucra_react_native_sdk/lucra_react_native_sdk-Swift.h>
#else
#import "lucra_react_native_sdk-Swift.h"
#endif
#import <React/RCTLog.h>
#import <React/RCTUIManager.h>
#import <React/RCTViewManager.h>

@interface LucraRecommendedMatchupManager : RCTViewManager
@end

@implementation LucraRecommendedMatchupManager

RCT_EXPORT_MODULE(LucraRecommendedMatchup)

- (UIView *)view {
  LucraSwiftClient *client = [LucraSwiftClient getShared];
  UIView *view = [client getRecommendedMatchup];

  return view;
}

@end
