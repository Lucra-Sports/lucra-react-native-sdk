#import "LucraClient.h"
#import "lucra_react_native_sdk/lucra_react_native_sdk-Swift.h"

@interface LucraClient () <LucraClientDelegate>
@end

@implementation LucraClient

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE()

LucraSwiftClient *client;

- (void)setBridge:(RCTBridge *)bridge {
  _bridge = bridge;
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

RCT_EXPORT_METHOD(initialize
                  : (NSDictionary *)options resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  client = [LucraSwiftClient getShared];
  [client initialize:options resolver:resolve rejecter:reject];
  [client setDelegate:self];
}

- (NSArray<NSString *> *)supportedEvents {
  return [LucraSwiftClient supportedEvents];
}

RCT_EXPORT_METHOD(acceptGamesMatchup
                  : (NSString *)matchupId teamId
                  : (NSString *)teamId resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [client acceptGamesMatchup:matchupId
                      teamId:teamId
                    resolver:resolve
                    rejecter:reject];
}

RCT_EXPORT_METHOD(cancelGamesMatchup
                  : (NSString *)matchupId resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [client cancelGamesMatchup:matchupId resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(getGamesMatchup
                  : (NSString *)matchupId resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [client getGamesMatchup:matchupId resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(configureUser
                  : (NSDictionary *)user resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [client configureUser:user resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(createGamesMatchup
                  : (NSString *)gameTypeId wagerAmount
                  : (double)wagerAmount resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [client createGamesMatchup:gameTypeId
                 wagerAmount:wagerAmount
                    resolver:resolve
                    rejecter:reject];
}

RCT_EXPORT_METHOD(present : (NSString *)flow) {
  [client present:flow matchupId:nil teamInviteId:nil];
}

RCT_EXPORT_METHOD(emitDeepLink : (NSString *)deepLink) {
  [client emitDeepLink:deepLink];
}

RCT_EXPORT_METHOD(logout
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [client logoutWithResolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(getUser
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [client getUserWithResolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(handleLucraLink
                  : (NSString *)link resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [client handleLucraLink:link resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(registerDeviceTokenHex
                  : (NSString *)deviceTokenHex resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [client registerDeviceTokenHex:deviceTokenHex resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(registerDeviceTokenBase64
                  : (NSString *)deviceTokenBase64 resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [client registerDeviceTokenBase64:deviceTokenBase64
                            resolve:resolve
                             reject:reject];
}

RCT_EXPORT_METHOD(getSportsMatchup: (NSString *)contestId resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
    [client getSportsMatchup:contestId resolve:resolve reject:reject];
}

#if RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeLucraClientSpecJSI>(params);
}
#endif

- (void)invalidate {
  [super invalidate];
}

- (void)sendEventWithName:(NSString *_Nonnull)name
                   result:(NSDictionary<NSString *, id> *_Nonnull)result {
  [self sendEventWithName:name body:result];
}

@end
