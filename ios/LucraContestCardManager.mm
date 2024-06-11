#import "RCTBridge.h"
#import "lucra_react_native_sdk/lucra_react_native_sdk-Swift.h"
#import <React/RCTLog.h>
#import <React/RCTUIManager.h>
#import <React/RCTViewManager.h>

@interface LucraContestCardManager : RCTViewManager
@end

@implementation LucraContestCardManager

RCT_EXPORT_MODULE(LucraContestCard)

- (UIView *)view {
  return [[UIView alloc] init];
}

RCT_CUSTOM_VIEW_PROPERTY(contestId, NSString, UIView) {
  LucraSwiftClient *client = [LucraSwiftClient getShared];
  UIView *feedView = [client getContestCard:json];
  [view addSubview:feedView];

  // Add constraints to the parent view
  feedView.translatesAutoresizingMaskIntoConstraints = NO;
  [NSLayoutConstraint activateConstraints:@[
    [feedView.topAnchor constraintEqualToAnchor:view.topAnchor],
    [feedView.leadingAnchor constraintEqualToAnchor:view.leadingAnchor],
    [feedView.trailingAnchor constraintEqualToAnchor:view.trailingAnchor],
    [feedView.bottomAnchor constraintEqualToAnchor:view.bottomAnchor]
  ]];
}

@end
