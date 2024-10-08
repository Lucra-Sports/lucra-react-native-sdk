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

// Method to access the stored instance
+ (instancetype)sharedInstance;

// Method to set the stored instance (optional, if you need to assign the instance manually)
+ (void)setSharedInstance:(LucraClient *)instance;

- (bool)handleVenmoUrl:(NSURL*) url;
@end
