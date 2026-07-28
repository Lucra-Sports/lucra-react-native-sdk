package com.lucrasdk

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext

class LucraClientPackage : ReactPackage {

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ) = listOf(LucraFlowViewManager(reactContext),
        LucraProfilePillManager(reactContext),
        LucraMiniPublicFeedManager(reactContext),
        LucraRecommendedMatchupManager(reactContext),
        LucraCreateContestButtonManager(reactContext),
        LucraContestCardManager(reactContext)
        )

    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): MutableList<NativeModule> = listOf(LucraClientModule(reactContext)).toMutableList()
}

//
//  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
//    if (name == LucraClientModule.NAME) {
//      return LucraClientModule(reactContext)
//    } else {
//      return null
//    }
//  }
//
//  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
//    mapOf(
//        LucraClientModule.NAME to
//            ReactModuleInfo(
//                LucraClientModule.NAME,
//                LucraClientModule.NAME,
//                false, // canOverrideExistingModule
//                false, // needsEagerInit
//                false, // isCxxModule
//                true // isTurboModule
//            )
//    )
//  }
//}
