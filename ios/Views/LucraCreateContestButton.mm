#ifdef RCT_NEW_ARCH_ENABLED
#import "LucraCreateContestButton.h"
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

    LucraSwiftClient *client = [LucraSwiftClient getShared];
    UIView *view = [client getCreateContestButton];
    
    
    self.contentView = view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> LucraCreateContestButtonCls(void) {
  return LucraCreateContestButton.class;
}

@end
#endif
