#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import "RCTBridge.h"
#import <React/RCTLog.h>
#import "lucra_react_native_sdk/lucra_react_native_sdk-Swift.h"

@interface LucraFlowManager : RCTViewManager
@end

@implementation LucraFlowManager

RCT_EXPORT_MODULE(LucraFlow)

- (UIView *)view
{
  return [[UIView alloc] init];
}

RCT_CUSTOM_VIEW_PROPERTY(name, NSString, UIView)
{
  LucraSwiftClient *client = [LucraSwiftClient getShared];
  UIViewController *viewController = [client getFlowController];
  [view addSubview:viewController.view];

  // Add constraints to the parent view
  viewController.view.translatesAutoresizingMaskIntoConstraints = NO;
  [NSLayoutConstraint activateConstraints:@[
    [viewController.view.topAnchor constraintEqualToAnchor:view.topAnchor],
    [viewController.view.leadingAnchor constraintEqualToAnchor:view.leadingAnchor],
    [viewController.view.trailingAnchor constraintEqualToAnchor:view.trailingAnchor],
    [viewController.view.bottomAnchor constraintEqualToAnchor:view.bottomAnchor]
  ]];
}

@end
