#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LucraClient, NSObject)

RCT_EXTERN_METHOD(initialize: (nonnull NSDictionary)options
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(configureUser: (nonnull NSDictionary)userObj
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(registerUserCallback: (RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(present: (NSString)lucraFlow)
RCT_EXTERN_METHOD(createGamesMatchup: (NSString)gameId
                  wagerAmount: (nonnull NSNumber)wagerAmount
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(acceptGamesMatchup: (NSString)gameId
                  teamId: (nonnull NSNumber)teamId
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(cancelGamesMatchup: (NSString)gameId
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)
@end
