#ifdef RCT_NEW_ARCH_ENABLED
#import "LucraRecommendedMatchup.h"
#import "RCTBridge.h"
#import "lucra_react_native_sdk/lucra_react_native_sdk-Swift.h"
#import <react/renderer/components/LucraClientSpec/ComponentDescriptors.h>
#import <react/renderer/components/LucraClientSpec/EventEmitters.h>
#import <react/renderer/components/LucraClientSpec/Props.h>
#import <react/renderer/components/LucraClientSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "Utils.h"

using namespace facebook::react;

@interface LucraRecommendedMatchup () <RCTLucraRecommendedMatchupViewProtocol>

@end

@implementation LucraRecommendedMatchup {
  UIView *_view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      LucraRecommendedMatchupComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const LucraRecommendedMatchupProps>();
    _props = defaultProps;
    LucraSwiftClient *client = [LucraSwiftClient getShared];
    UIView *view = [client getRecommendedMatchup];
    _view = view;

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
     
  [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> LucraRecommendedMatchupCls(void) {
  return LucraRecommendedMatchup.class;
}

@end
#endif
