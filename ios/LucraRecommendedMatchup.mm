#ifdef RCT_NEW_ARCH_ENABLED
#import "LucraRecommendedMatchup.h"

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

    _view = [[UIView alloc] init];

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  const auto &oldViewProps =
      *std::static_pointer_cast<LucraRecommendedMatchupProps const>(_props);
  const auto &newViewProps =
      *std::static_pointer_cast<LucraRecommendedMatchupProps const>(props);
  //
  //    if (oldViewProps.color != newViewProps.color) {
  //        NSString * colorToConvert = [[NSString alloc] initWithUTF8String:
  //        newViewProps.color.c_str()];
  //        [_view setBackgroundColor: [Utils hexStringToColor:colorToConvert]];
  //    }

  [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> LucraRecommendedMatchupCls(void) {
  return LucraRecommendedMatchup.class;
}

@end
#endif
