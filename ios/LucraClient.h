#ifdef RCT_NEW_ARCH_ENABLED
#import <LucraClientSpec/LucraClientSpec.h>
#import <React/RCTEventEmitter.h>

NS_ASSUME_NONNULL_BEGIN

@interface LucraClient: RCTEventEmitter<NativeLucraClientSpec>

// Method to access the stored instance
+ (instancetype)sharedInstance;

// Method to set the stored instance (optional, if you need to assign the instance manually)
+ (void)setSharedInstance:(LucraClient *)instance;

- (bool)handleVenmoUrl:(NSURL*) url;
@end
NS_ASSUME_NONNULL_END

#endif