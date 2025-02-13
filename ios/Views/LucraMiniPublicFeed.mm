#ifdef RCT_NEW_ARCH_ENABLED
#import "LucraMiniPublicFeed.h"
#import "RCTBridge.h"
#import "lucra_react_native_sdk/lucra_react_native_sdk-Swift.h"
#import <react/renderer/components/LucraClientSpec/ComponentDescriptors.h>
#import <react/renderer/components/LucraClientSpec/EventEmitters.h>
#import <react/renderer/components/LucraClientSpec/Props.h>
#import <react/renderer/components/LucraClientSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "Utils.h"

using namespace facebook::react;

@interface LucraMiniPublicFeed () <RCTLucraMiniPublicFeedViewProtocol>

@end

@implementation LucraMiniPublicFeed {
  UIView *_view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      LucraMiniPublicFeedComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const LucraMiniPublicFeedProps>();
    _props = defaultProps;

    _view = [[UIView alloc] init];

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  const auto &newViewProps =
      *std::static_pointer_cast<LucraMiniPublicFeedProps const>(props);
  //  NSArray *playerIds = newViewProps.playerIds
  std::vector<std::string> playerIdsVector = newViewProps.playerIds;
  NSMutableArray *playerIds =
      [NSMutableArray arrayWithCapacity:playerIdsVector.size()];
  for (const std::string &playerId : playerIdsVector) {
    [playerIds addObject:[NSString stringWithUTF8String:playerId.c_str()]];
  }
  LucraSwiftClient *client = [LucraSwiftClient getShared];
  UIView *feedView = [client
        getMiniFeed:playerIds
      onSizeChanged:^(CGSize newSize) {
//        [self.bridge.uiManager setIntrinsicContentSize:newSize forView:self.contentView];
      }];
  [self.contentView addSubview:feedView];
//
//  viewController.view.translatesAutoresizingMaskIntoConstraints = NO;
//  [NSLayoutConstraint activateConstraints:@[
//    [viewController.view.topAnchor constraintEqualToAnchor:_view.topAnchor],
//    [viewController.view.leadingAnchor
//        constraintEqualToAnchor:_view.leadingAnchor],
//    [viewController.view.trailingAnchor
//        constraintEqualToAnchor:_view.trailingAnchor],
//    [viewController.view.bottomAnchor
//        constraintEqualToAnchor:_view.bottomAnchor]
//  ]];

  [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> LucraMiniPublicFeedCls(void) {
  return LucraMiniPublicFeed.class;
}

@end
#endif
