#import "LucraClient.h"
#import "lucra_react_native_sdk/lucra_react_native_sdk-Swift.h"

@interface LucraClient () <LucraClientDelegate>
@end

@implementation LucraClient

@synthesize bridge = _bridge;
LucraSwiftClient *swiftClient;

RCT_EXPORT_MODULE()


static LucraClient *_sharedInstance = nil;

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
    swiftClient = [LucraSwiftClient getShared];
  [swiftClient initialize:options resolver:resolve rejecter:reject];
  [swiftClient setDelegate:self];
  [LucraClient setSharedInstance:self];
}

- (LucraSwiftClient*)getSwiftClient {
    return swiftClient;
}

- (NSArray<NSString *> *)supportedEvents {
  return [LucraSwiftClient supportedEvents];
}

RCT_EXPORT_METHOD(acceptGamesMatchup
                  : (NSString *)matchupId teamId
                  : (NSString *)teamId resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [swiftClient acceptGamesMatchup:matchupId
                      teamId:teamId
                    resolver:resolve
                    rejecter:reject];
}

RCT_EXPORT_METHOD(cancelGamesMatchup
                  : (NSString *)matchupId resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [swiftClient cancelGamesMatchup:matchupId resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(getGamesMatchup
                  : (NSString *)matchupId resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [swiftClient getGamesMatchup:matchupId resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(configureUser
                  : (NSDictionary *)user resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [swiftClient configureUser:user resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(createGamesMatchup
                  : (NSString *)gameTypeId wagerAmount
                  : (double)wagerAmount resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [swiftClient createGamesMatchup:gameTypeId
                 wagerAmount:wagerAmount
                    resolver:resolve
                    rejecter:reject];
}

RCT_EXPORT_METHOD(present : (NSDictionary *)params) {
  NSString* flow = params[@"flow"];
  NSString* matchupId = params[@"matchupId"];
  NSString* teamInviteId = params[@"teamInviteId"];
  NSString* gameId = params[@"gameId"];
  [swiftClient present:flow matchupId:matchupId teamInviteId:teamInviteId gameId:gameId];
}

RCT_EXPORT_METHOD(emitDeepLink : (NSString *)deepLink) {
  [swiftClient emitDeepLink:deepLink];
}

RCT_EXPORT_METHOD(emitCreditConversion : (NSDictionary *)conversion) {
    [swiftClient emitCreditConversion:conversion];
}

RCT_EXPORT_METHOD(emitAvailableRewards: (NSArray *)rewards) {
    [swiftClient emitAvailableRewards:rewards];
}

RCT_EXPORT_METHOD(registerConvertToCreditProvider) {
    [swiftClient registerConvertToCreditProvider];
}

RCT_EXPORT_METHOD(registerRewardProvider) {
    [swiftClient registerRewardProvider];
}

RCT_EXPORT_METHOD(logout
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [swiftClient logoutWithResolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(getUser
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [swiftClient getUserWithResolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(handleLucraLink
                  : (NSString *)link resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [swiftClient handleLucraLink:link resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(registerDeviceTokenHex
                  : (NSString *)deviceTokenHex resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [swiftClient registerDeviceTokenHex:deviceTokenHex resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(registerDeviceTokenBase64
                  : (NSString *)deviceTokenBase64 resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [swiftClient registerDeviceTokenBase64:deviceTokenBase64
                            resolve:resolve
                             reject:reject];
}

RCT_EXPORT_METHOD(getSportsMatchup: (NSString *)contestId resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
    [swiftClient getSportsMatchup:contestId resolve:resolve reject:reject];
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

- (bool)handleVenmoUrl:(NSURL*)url {
    LucraClient* sharedClient = [LucraClient sharedInstance];
    LucraSwiftClient* sharedSwiftClient = [sharedClient getSwiftClient];
    return [sharedSwiftClient handleVenmoUrlWithUrl:url];
}

+ (instancetype)sharedInstance {
    return _sharedInstance;
}

+ (void)setSharedInstance:(LucraClient *)instance {
    _sharedInstance = instance;
}

@end
