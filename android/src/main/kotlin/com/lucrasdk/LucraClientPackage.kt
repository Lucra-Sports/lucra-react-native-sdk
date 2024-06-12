package com.lucrasdk

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import java.util.ArrayList

class LucraClientPackage : TurboReactPackage() {

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    val viewManagers: MutableList<ViewManager<*, *>> = ArrayList()
    viewManagers.add(LucraFlowViewManager())
    viewManagers.add(LucraProfilePillManager())
    viewManagers.add(LucraMiniPublicFeedManager())
    viewManagers.add(LucraRecommendedMatchupManager())
      viewManagers.add(LucraCreateContestButtonManager())
      viewManagers.add(LucraContestCardManager())
    return viewManagers
  }

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    if (name == LucraClientModule.NAME) {
      return LucraClientModule(reactContext)
    } else {
      return null
    }
  }

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
        LucraClientModule.NAME to
            ReactModuleInfo(
                LucraClientModule.NAME,
                LucraClientModule.NAME,
                false, // canOverrideExistingModule
                false, // needsEagerInit
                false, // isCxxModule
                true // isTurboModule
            )
    )
  }
}
