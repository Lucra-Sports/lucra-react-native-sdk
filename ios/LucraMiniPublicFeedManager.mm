#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import "RCTBridge.h"
#import <React/RCTLog.h>
#import "lucra_react_native_sdk/lucra_react_native_sdk-Swift.h"

@interface LucraMiniPublicFeedManager : RCTViewManager
@end

@implementation LucraMiniPublicFeedManager

RCT_EXPORT_MODULE(LucraMiniPublicFeed)

- (UIView *)view
{
  return [[UIView alloc] init];
}

RCT_CUSTOM_VIEW_PROPERTY(playerIds, NSString, UIView)
{
    LucraSwiftClient *client = [LucraSwiftClient getShared];
    UIView *feedView = [client getMiniFeed:json];
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
