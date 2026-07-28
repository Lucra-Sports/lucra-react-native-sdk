#ifdef RCT_NEW_ARCH_ENABLED
#import "LucraProfilePill.h"
#import "RCTBridge.h"
#if __has_include(<lucra_react_native_sdk/lucra_react_native_sdk-Swift.h>)
#import <lucra_react_native_sdk/lucra_react_native_sdk-Swift.h>
#else
#import "lucra_react_native_sdk-Swift.h"
#endif
#import <react/renderer/components/NativeLucraClientSpec/ComponentDescriptors.h>
#import <react/renderer/components/NativeLucraClientSpec/EventEmitters.h>
#import <react/renderer/components/NativeLucraClientSpec/Props.h>
#import <react/renderer/components/NativeLucraClientSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "Utils.h"

using namespace facebook::react;

@interface LucraProfilePill () <RCTLucraProfilePillViewProtocol>

@end

@implementation LucraProfilePill {
  UIView *_view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      LucraProfilePillComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const LucraProfilePillProps>();
    _props = defaultProps;
    LucraSwiftClient *client = [LucraSwiftClient getShared];
    UIView *pillView = [client getProfilePill];

    _view = pillView;

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> LucraProfilePillCls(void) {
  return LucraProfilePill.class;
}

@end
#endif
