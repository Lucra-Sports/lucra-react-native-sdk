#ifdef RCT_NEW_ARCH_ENABLED
#import "LucraProfilePill.h"

#import <react/renderer/components/RNLucraProfilePillSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNLucraProfilePillSpec/EventEmitters.h>
#import <react/renderer/components/RNLucraProfilePillSpec/Props.h>
#import <react/renderer/components/RNLucraProfilePillSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "Utils.h"

using namespace facebook::react;

@interface LucraProfilePill () <RCTLucraProfilePillViewProtocol>

@end

@implementation LucraProfilePill {
    UIView * _view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<LucraProfilePillComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const LucraProfilePillProps>();
    _props = defaultProps;

    _view = [[UIView alloc] init];

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<LucraProfilePillProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<LucraProfilePillProps const>(props);

    if (oldViewProps.color != newViewProps.color) {
        NSString * colorToConvert = [[NSString alloc] initWithUTF8String: newViewProps.color.c_str()];
        [_view setBackgroundColor: [Utils hexStringToColor:colorToConvert]];
    }

    [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> LucraProfilePillCls(void)
{
    return LucraProfilePill.class;
}

@end
#endif

