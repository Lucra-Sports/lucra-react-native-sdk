#ifdef RCT_NEW_ARCH_ENABLED
#import "LucraContestCard.h"

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
  const auto &oldViewProps =
      *std::static_pointer_cast<LucraContestCardProps const>(_props);
  const auto &newViewProps =
      *std::static_pointer_cast<LucraContestCardProps const>(props);
  //
  //    if (oldViewProps.color != newViewProps.color) {
  //        NSString * colorToConvert = [[NSString alloc] initWithUTF8String:
  //        newViewProps.color.c_str()];
  //        [_view setBackgroundColor: [Utils hexStringToColor:colorToConvert]];
  //    }

  [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> LucraContestCardCls(void) {
  return LucraContestCard.class;
}

@end
#endif
