package com.lucrasdk

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

@ReactModule(name = LucraProfilePillManager.NAME)
class LucraProfilePillManager :
  LucraProfilePillManagerSpec<LucraProfilePill>() {
  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): LucraProfilePill {
    return LucraProfilePill(context)
  }

  companion object {
    const val NAME = "LucraProfilePill"
  }
}
