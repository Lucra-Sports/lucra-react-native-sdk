#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import "RCTBridge.h"
#import <React/RCTLog.h>
#import "lucra_react_native_sdk/lucra_react_native_sdk-Swift.h"

@interface LucraProfilePillManager : RCTViewManager
@end

@implementation LucraProfilePillManager

RCT_EXPORT_MODULE(LucraProfilePill)

- (UIView *)view
{
  LucraSwiftClient *client = [LucraSwiftClient getShared];
  UIView *pillView = [client getProfilePill];
  
  return pillView;
}

@end


