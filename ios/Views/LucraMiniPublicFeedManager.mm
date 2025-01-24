#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import "RCTBridge.h"
#import "lucra_react_native_sdk/lucra_react_native_sdk-Swift.h"

@interface LucraMiniPublicFeedManager : RCTViewManager
@property (nonatomic, strong) NSTimer *timer;
@property (nonatomic) CGFloat lastUpdateSize;

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
    UIView *feedView = [client getMiniFeed:json onSizeChanged:^(CGSize newSize) {
        [self.bridge.uiManager setIntrinsicContentSize:newSize forView:view];
    }];
    [view addSubview:feedView];
    
  // Add constraints to the parent view
   feedView.translatesAutoresizingMaskIntoConstraints = NO;
   [NSLayoutConstraint activateConstraints:@[
     [feedView.topAnchor constraintEqualToAnchor:view.topAnchor],
     [feedView.leadingAnchor constraintEqualToAnchor:view.leadingAnchor],
     [feedView.trailingAnchor constraintEqualToAnchor:view.trailingAnchor],
     [feedView.bottomAnchor constraintEqualToAnchor:view.bottomAnchor]
   ]]; 
    
    [self.bridge.uiManager setIntrinsicContentSize:feedView.intrinsicContentSize forView:view];
}

@end
