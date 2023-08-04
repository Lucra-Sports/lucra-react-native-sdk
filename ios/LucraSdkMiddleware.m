#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LucraSdkMiddleware, NSObject)

RCT_EXTERN_METHOD(helloWorld)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
