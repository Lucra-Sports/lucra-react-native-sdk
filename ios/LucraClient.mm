#import <React/RCTBridgeModule.h>
#import "LucraClient.h"
#import "lucra_react_native_sdk/lucra_react_native_sdk-Swift.h"

@implementation LucraClient

@synthesize bridge=_bridge;

LucraSwiftClient *client  = [[LucraSwiftClient alloc] init];

RCT_EXPORT_MODULE()

#if RCT_NEW_ARCH_ENABLED
 - (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
     (const facebook::react::ObjCTurboModule::InitParams &)params
 {
   return std::make_shared<facebook::react::NativeLucraSDKSpecJSI>(params);
 }
 #endif

- (void)initialize:(NSDictionary *)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [client initialize:options resolver:resolve rejecter:reject];
}

- (void)acceptGamesMatchup:(NSString *)matchupId teamId:(NSString *)teamId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [client acceptGamesMatchup:matchupId teamId:teamId resolver:resolve rejecter:reject];
}


- (void)cancelGamesMatchup:(NSString *)matchupId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [client cancelGamesMatchup:matchupId resolver:resolve rejecter:reject];
}


- (void)configureUser:(NSDictionary *)user { 
    [client configureUser:user];
}


- (void)createGamesMatchup:(NSString *)gameTypeId wagerAmount:(double)wagerAmount resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [client createGamesMatchup:gameTypeId wagerAmount:wagerAmount resolver:resolve rejecter:reject];
}


- (void)present:(NSString *)flow { 
    [client present:flow];
}


- (void)registerUserCallback:(RCTResponseSenderBlock)cb { 
    [client registerUserCallback:cb];
}

@end
