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

RCT_EXPORT_METHOD(initialize : (NSDictionary *)options resolve : (
    RCTPromiseResolveBlock)resolve reject : (RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
      swiftClient = [LucraSwiftClient getShared];
      [swiftClient initialize:options resolve:resolve reject:reject];
      [swiftClient setDelegate:self];
      [LucraClient setSharedInstance:self];
    });
}

- (LucraSwiftClient *)getSwiftClient {
  return swiftClient;
}

- (NSArray<NSString *> *)supportedEvents {
  return [LucraSwiftClient supportedEvents];
}

RCT_EXPORT_METHOD(cancelGamesMatchup : (NSString *)matchupId resolve : (
    RCTPromiseResolveBlock)resolve reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient cancelGamesMatchup:matchupId resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(preloadGeoToken : (NSString *)context) {
  [swiftClient preloadGeoToken:context];
}

RCT_EXPORT_METHOD(startMiniGame : (NSString *)gameId
                  gameMode : (NSString *)gameMode
                  amount : (double)amount
                  matchupId : (NSString *)matchupId
                  resolve : (RCTPromiseResolveBlock)resolve
                  reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient startMiniGame:gameId
                    gameMode:gameMode
                      amount:amount
                   matchupId:matchupId
                     resolve:resolve
                      reject:reject];
}

RCT_EXPORT_METHOD(getUserTournamentRewards : (NSDictionary *)params
                  resolve : (RCTPromiseResolveBlock)resolve
                  reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient getUserTournamentRewards:params resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(claimReward : (NSString *)rewardId
                  resolve : (RCTPromiseResolveBlock)resolve
                  reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient claimReward:rewardId resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(markRewardViewed : (NSString *)rewardId
                  resolve : (RCTPromiseResolveBlock)resolve
                  reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient markRewardViewed:rewardId resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(getUserAchievements : (NSDictionary *)params
                  resolve : (RCTPromiseResolveBlock)resolve
                  reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient getUserAchievements:params resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(claimAchievement : (NSString *)userAchievementId
                  resolve : (RCTPromiseResolveBlock)resolve
                  reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient claimAchievement:userAchievementId resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(markAchievementViewed : (NSString *)userAchievementId
                  resolve : (RCTPromiseResolveBlock)resolve
                  reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient markAchievementViewed:userAchievementId resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(configureUser : (NSDictionary *)user resolve : (
    RCTPromiseResolveBlock)resolve reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient configureUser:user resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(createRecreationalGame : (NSString *)gameTypeId
                  atStake : (NSDictionary *)atStake
                  playStyle : (NSString *)playStyle
                  resolve : (RCTPromiseResolveBlock)resolve
                  reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient createRecreationalGame:gameTypeId
                              atStake:atStake
                            playStyle:playStyle
                              resolve:resolve
                               reject:reject];
}

RCT_EXPORT_METHOD(acceptVersusRecreationalGame : (NSString *)matchupId
                  teamId : (NSString *)teamId
                  resolve : (RCTPromiseResolveBlock)resolve
                  reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient acceptVersusRecreationalGame:matchupId
                                     teamId:teamId
                                    resolve:resolve
                                     reject:reject];
}

RCT_EXPORT_METHOD(acceptFreeForAllRecreationalGame : (NSString *)matchupId
                  resolve : (RCTPromiseResolveBlock)resolve
                  reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient acceptFreeForAllRecreationalGame:matchupId
                                        resolve:resolve
                                         reject:reject];
}

RCT_EXPORT_METHOD(getMatchup : (NSString *)matchupId
                  resolve : (RCTPromiseResolveBlock)resolve
                  reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient getMatchup:matchupId
                  resolve:resolve
                   reject:reject];
}

RCT_EXPORT_METHOD(getMatchupDetails : (NSString *)matchupId
                  resolve : (RCTPromiseResolveBlock)resolve
                  reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient getMatchupDetails:matchupId
                         resolve:resolve
                          reject:reject];
}

RCT_EXPORT_METHOD(subscribeMatchupDetails : (NSString *)matchupId) {
  [swiftClient subscribeMatchupDetails:matchupId];
}

RCT_EXPORT_METHOD(cancelMatchupDetailsSubscription) {
  [swiftClient cancelMatchupDetailsSubscription];
}

RCT_EXPORT_METHOD(present : (NSDictionary *)params
                  resolve : (RCTPromiseResolveBlock)resolve
                   reject : (RCTPromiseRejectBlock)reject) {
  NSString *flow = params[@"name"];
  NSString *matchupId = params[@"matchupId"];
  NSString *teamInviteId = params[@"teamInviteId"];
  NSString *gameId = params[@"gameId"];
  NSString *location = params[@"locationId"];
  NSString *gameMode = params[@"gameMode"];
  NSNumber *amount = params[@"amount"];

  [swiftClient present:flow
             matchupId:matchupId
          teamInviteId:teamInviteId
                gameId:gameId
              location:location
              gameMode:gameMode
                amount:amount
               resolve:resolve
                reject:reject];
}

RCT_EXPORT_METHOD(emitDeepLink : (NSString *)deepLink) {
  [swiftClient emitDeepLink:deepLink];
}

RCT_EXPORT_METHOD(emitCreditConversion : (NSDictionary *)conversion) {
  [swiftClient emitCreditConversion:conversion];
}

RCT_EXPORT_METHOD(emitAvailableRewards : (NSArray *)rewards) {
  [swiftClient emitAvailableRewards:rewards];
}

RCT_EXPORT_METHOD(closeFullScreenLucraFlows : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient closeFullScreenLucraFlowsWithResolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(registerConvertToCreditProvider) {
  [swiftClient registerConvertToCreditProvider];
}

RCT_EXPORT_METHOD(registerRewardProvider) {
  [swiftClient registerRewardProvider];
}

RCT_EXPORT_METHOD(logout : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient logoutWithResolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(getUser : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient getUserWithResolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(handleLucraLink : (NSString *)link resolve : (
    RCTPromiseResolveBlock)resolve reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient handleLucraLink:link resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(parseLucraLink : (NSString *)link resolve : (
    RCTPromiseResolveBlock)resolve reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient parseLucraLink:link resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(registerDeviceTokenHex : (NSString *)
                      deviceTokenHex resolve : (RCTPromiseResolveBlock)
                          resolve reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient registerDeviceTokenHex:deviceTokenHex
                              resolve:resolve
                               reject:reject];
}

RCT_EXPORT_METHOD(registerDeviceTokenBase64 : (NSString *)
                      deviceTokenBase64 resolve : (RCTPromiseResolveBlock)
                          resolve reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient registerDeviceTokenBase64:deviceTokenBase64
                                 resolve:resolve
                                  reject:reject];
}

// Pool tournaments
RCT_EXPORT_METHOD(getRecommendedTournaments : (NSDictionary *)params resolve : (
    RCTPromiseResolveBlock)resolve reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient getRecommendedTournaments:params resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(tournamentMatchup : (NSString *)idString resolve : (
    RCTPromiseResolveBlock)resolve reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient tournamentMatchup:idString resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(joinTournament : (NSString *)idString resolve : (
    RCTPromiseResolveBlock)resolve reject : (RCTPromiseRejectBlock)reject) {
  [swiftClient joinTournament:idString resolve:resolve reject:reject];
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
                   result:(NSDictionary<NSString *, id> *)result {
  [self sendEventWithName:name body:result];
}

- (bool)handleVenmoUrl:(NSURL *)url {
  LucraClient *sharedClient = [LucraClient sharedInstance];
  LucraSwiftClient *sharedSwiftClient = [sharedClient getSwiftClient];
  return [sharedSwiftClient handleVenmoUrlWithUrl:url];
}

+ (instancetype)sharedInstance {
  return _sharedInstance;
}

+ (void)setSharedInstance:(LucraClient *)instance {
  _sharedInstance = instance;
}

@end
