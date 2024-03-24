//
//  LucraFlowView.m
//  lucra-react-native-sdk
//
//  Created by Oscar Franco on 24/3/24.
//

#ifdef RCT_NEW_ARCH_ENABLED
#import "LucraFlowView.h"

#import <react/renderer/components/RNLucraFlowSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNLucraFlowSpec/EventEmitters.h>
#import <react/renderer/components/RNLucraFlowSpec/Props.h>
#import <react/renderer/components/RNLucraFlowSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "Utils.h"

using namespace facebook::react;

@interface LucraFlow () <RCTLucraFlowViewProtocol>

@end

@implementation LucraFlow {
    UIView * _view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<LucraFlowComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const LucraFlowProps>();
    _props = defaultProps;

    _view = [[UIView alloc] init];

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<LucraFlowProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<LucraFlowProps const>(props);

    if (oldViewProps.color != newViewProps.color) {
        NSString * colorToConvert = [[NSString alloc] initWithUTF8String: newViewProps.color.c_str()];
        [_view setBackgroundColor: [Utils hexStringToColor:colorToConvert]];
    }

    [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> LucraFlowCls(void)
{
    return LucraFlow.class;
}

@end
#endif

