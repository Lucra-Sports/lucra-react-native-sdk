#ifdef RCT_NEW_ARCH_ENABLED
#import "LucraCreateContestButton.h"

#import <react/renderer/components/LucraClientSpec/ComponentDescriptors.h>
#import <react/renderer/components/LucraClientSpec/EventEmitters.h>
#import <react/renderer/components/LucraClientSpec/Props.h>
#import <react/renderer/components/LucraClientSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "Utils.h"

using namespace facebook::react;

@interface LucraCreateContestButton () <RCTLucraCreateContestButtonViewProtocol>

@end

@implementation LucraCreateContestButton {
  UIView *_view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      LucraCreateContestButtonComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const LucraCreateContestButtonProps>();
    _props = defaultProps;

    _view = [[UIView alloc] init];

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  const auto &newViewProps =
      *std::static_pointer_cast<LucraFlowViewProps const>(props);
  NSString *flow =
      [[NSString alloc] initWithUTF8String:newViewProps.flow.c_str()];
  LucraSwiftClient *client = [LucraSwiftClient getShared];
  UIViewController *viewController = [client getFlowController:flow];
  [self.contentView addSubview:viewController.view];

  viewController.view.translatesAutoresizingMaskIntoConstraints = NO;
  [NSLayoutConstraint activateConstraints:@[
    [viewController.view.topAnchor constraintEqualToAnchor:_view.topAnchor],
    [viewController.view.leadingAnchor
        constraintEqualToAnchor:_view.leadingAnchor],
    [viewController.view.trailingAnchor
        constraintEqualToAnchor:_view.trailingAnchor],
    [viewController.view.bottomAnchor
        constraintEqualToAnchor:_view.bottomAnchor]
  ]];

  [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> LucraCreateContestButtonCls(void) {
  return LucraCreateContestButton.class;
}

@end
#endif
