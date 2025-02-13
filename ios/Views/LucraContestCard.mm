#ifdef RCT_NEW_ARCH_ENABLED
#import "LucraContestCard.h"
#import "RCTBridge.h"
#import "lucra_react_native_sdk/lucra_react_native_sdk-Swift.h"
#import <react/renderer/components/LucraClientSpec/ComponentDescriptors.h>
#import <react/renderer/components/LucraClientSpec/EventEmitters.h>
#import <react/renderer/components/LucraClientSpec/Props.h>
#import <react/renderer/components/LucraClientSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "Utils.h"

using namespace facebook::react;

@interface LucraContestCard () <RCTLucraContestCardViewProtocol>

@end

@implementation LucraContestCard {
  UIView *_view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      LucraContestCardComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const LucraContestCardProps>();
    _props = defaultProps;

    _view = [[UIView alloc] init];

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  const auto &newViewProps =
      *std::static_pointer_cast<LucraContestCardProps const>(props);
  NSString *contestId =
      [[NSString alloc] initWithUTF8String:newViewProps.contestId.c_str()];
  LucraSwiftClient *client = [LucraSwiftClient getShared];

  UIView *feedView = [client getContestCard:contestId
                              onSizeChanged:^(CGSize newSize) {
//                                self.contentView.frame =
//                                    CGRectMake(self.contentView.frame.origin.x,
//                                               self.contentView.frame.origin.y,
//                                               newSize.width, newSize.height);
//                                [self.contentView setNeedsLayout];
                              }];
  [self.contentView addSubview:feedView];
  
  feedView.translatesAutoresizingMaskIntoConstraints = NO;
  [NSLayoutConstraint activateConstraints:@[
    [feedView.topAnchor constraintEqualToAnchor:self.contentView.topAnchor],
    [feedView.leadingAnchor constraintEqualToAnchor:self.contentView.leadingAnchor],
    [feedView.trailingAnchor constraintEqualToAnchor:self.contentView.trailingAnchor],
    [feedView.bottomAnchor constraintEqualToAnchor:self.contentView.bottomAnchor]
  ]];

  [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> LucraContestCardCls(void) {
  return LucraContestCard.class;
}

@end
#endif
