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
  return [[UIView alloc] init];
}

RCT_CUSTOM_VIEW_PROPERTY(name, NSString, UIView)
{
    LucraSwiftClient *client = [LucraSwiftClient getShared];
    UIView *pillView = [client getProfilePill];
    [view addSubview:pillView];
    
  // // Add constraints to the parent view
   pillView.translatesAutoresizingMaskIntoConstraints = NO;
   [NSLayoutConstraint activateConstraints:@[
     [pillView.topAnchor constraintEqualToAnchor:view.topAnchor],
     [pillView.leadingAnchor constraintEqualToAnchor:view.leadingAnchor],
     [pillView.trailingAnchor constraintEqualToAnchor:view.trailingAnchor],
     [pillView.bottomAnchor constraintEqualToAnchor:view.bottomAnchor]
   ]];
}

@end
