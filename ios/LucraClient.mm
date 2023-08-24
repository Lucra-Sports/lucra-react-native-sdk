#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LucraClient, NSObject)

RCT_EXTERN_METHOD(initialize: (NSString)authenticationClientID environment:(NSString)environment urlScheme:(NSString)urlScheme)
RCT_EXTERN_METHOD(present: (NSString)lucraFlow)
// TODO: missing Android
RCT_EXTERN_METHOD(createGamesMatchup: (NSString)gameId
                  wagerAmount: (nonnull NSNumber)wagerAmount
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(cancelGamesMatchup: (NSString)gameId
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)
@end
