 #ifdef RCT_NEW_ARCH_ENABLED
 #import <LucraClientSpec/LucraClientSpec.h>
 #else
 #import <React/RCTBridge.h>
 #endif

 @interface LucraClient : NSObject
 #ifdef RCT_NEW_ARCH_ENABLED
                                    <NativeLucraSDKSpec>
 #else
                                    <RCTBridgeModule>
 #endif

 @property(nonatomic, assign) BOOL setBridgeOnMainQueue;

@end
