#ifdef RCT_NEW_ARCH_ENABLED
#import "RCTBridge.h"
#import "lucra_react_native_sdk/lucra_react_native_sdk-Swift.h"
#import <React/RCTLog.h>
#import <React/RCTUIManager.h>
#import <React/RCTViewManager.h>

@interface LucraCreateContestButtonManager : RCTViewManager
@end

@implementation LucraCreateContestButtonManager

RCT_EXPORT_MODULE(LucraCreateContestButton)

- (UIView *)view {
  LucraSwiftClient *client = [LucraSwiftClient getShared];
  UIView *view = [client getCreateContestButton];

  return view;
}

@end
#endif
