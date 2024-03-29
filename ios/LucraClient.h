#ifdef RCT_NEW_ARCH_ENABLED
#import <LucraClientSpec/LucraClientSpec.h>
#else
#import <React/RCTBridge.h>
#import <React/RCTEventEmitter.h>
#endif

@interface LucraClient : RCTEventEmitter
#ifdef RCT_NEW_ARCH_ENABLED
                                <NativeLucraClientSpec>
#else
                                <RCTBridgeModule>
#endif

@property(nonatomic, assign) BOOL setBridgeOnMainQueue;

@end
