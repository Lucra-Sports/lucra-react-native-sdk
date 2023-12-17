package com.lucrasdk

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.module.model.ReactModuleInfo


class LucraClientPackage : TurboReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
         if(name == LucraClientModule.NAME) {
             return LucraClientModule(reactContext)
         } else {
             return null
         }
  }

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
                LucraClientModule.NAME to ReactModuleInfo(
                    LucraClientModule.NAME,
                    LucraClientModule.NAME,
                      false, // canOverrideExistingModule
                      false, // needsEagerInit
                      false, // hasConstants
                      false, // isCxxModule
                      true // isTurboModule
                            )
                      )
  }
}
