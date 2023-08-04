#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LucraClient, NSObject)

RCT_EXTERN_METHOD(getInstance)
RCT_EXTERN_METHOD(createInstance: (NSString *)authenticationClientID environment:(NSString *)environment urlScheme:(NSString *)urlScheme)
RCT_EXTERN_METHOD(present: (NSString *) lucraFlow)
@end
