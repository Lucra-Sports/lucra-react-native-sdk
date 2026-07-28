#import "RCTBridge.h"
#if __has_include(<lucra_react_native_sdk/lucra_react_native_sdk-Swift.h>)
#import <lucra_react_native_sdk/lucra_react_native_sdk-Swift.h>
#else
#import "lucra_react_native_sdk-Swift.h"
#endif
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
