#ifdef RCT_NEW_ARCH_ENABLED
#import "LucraFlowView.h"
#import "RCTBridge.h"
#if __has_include(<lucra_react_native_sdk/lucra_react_native_sdk-Swift.h>)
#import <lucra_react_native_sdk/lucra_react_native_sdk-Swift.h>
#else
#import "lucra_react_native_sdk-Swift.h"
#endif
#import "RCTFabricComponentsPlugins.h"
#import "Utils.h"
#import <react/renderer/components/NativeLucraClientSpec/ComponentDescriptors.h>
#import <react/renderer/components/NativeLucraClientSpec/EventEmitters.h>
#import <react/renderer/components/NativeLucraClientSpec/Props.h>
#import <react/renderer/components/NativeLucraClientSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface LucraFlowView () <RCTLucraFlowViewViewProtocol>

@end

@implementation LucraFlowView {
  UIView *_view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      LucraFlowViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const LucraFlowViewProps>();
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

Class<RCTComponentViewProtocol> LucraFlowViewCls(void) {
  return LucraFlowView.class;
}

@end
#endif
