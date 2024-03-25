//
//  LucraFlowView.h
//  Pods
//
//  Created by Oscar Franco on 24/3/24.
//

// This guard prevent this file to be compiled in the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>

#ifndef LucraFlowViewNativeComponent_h
#define LucraFlowViewNativeComponent_h

NS_ASSUME_NONNULL_BEGIN

@interface LucraFlowView : RCTViewComponentView
@end

NS_ASSUME_NONNULL_END

#endif /* LucraFlowNativeComponent_h */
#endif /* RCT_NEW_ARCH_ENABLED */
