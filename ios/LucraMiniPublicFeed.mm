//
//  LucraMiniPublicFeedView.m
//  lucra-react-native-sdk
//
//  Created by Oscar Franco on 24/3/24.
//

#ifdef RCT_NEW_ARCH_ENABLED
#import "LucraMiniPublicFeed.h"

#import <react/renderer/components/RNLucraMiniPublicFeedSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNLucraMiniPublicFeedSpec/EventEmitters.h>
#import <react/renderer/components/RNLucraMiniPublicFeedSpec/Props.h>
#import <react/renderer/components/RNLucraMiniPublicFeedSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "Utils.h"

using namespace facebook::react;

@interface LucraMiniPublicFeed () <RCTLucraMiniPublicFeedViewProtocol>

@end

@implementation LucraMiniPublicFeed {
    UIView * _view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<LucraMiniPublicFeedComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const LucraMiniPublicFeedProps>();
    _props = defaultProps;

    _view = [[UIView alloc] init];

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<LucraMiniPublicFeedProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<LucraMiniPublicFeedProps const>(props);

    if (oldViewProps.color != newViewProps.color) {
        NSString * colorToConvert = [[NSString alloc] initWithUTF8String: newViewProps.color.c_str()];
        [_view setBackgroundColor: [Utils hexStringToColor:colorToConvert]];
    }

    [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> LucraMiniPublicFeedCls(void)
{
    return LucraMiniPublicFeed.class;
}

@end
#endif

