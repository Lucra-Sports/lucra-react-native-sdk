#ifdef RCT_NEW_ARCH_ENABLED
#import "RCTBridge.h"
#import "lucra_react_native_sdk/lucra_react_native_sdk-Swift.h"
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
#endif