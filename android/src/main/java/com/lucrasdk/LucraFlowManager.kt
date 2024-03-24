package com.lucrasdk

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

@ReactModule(name = LucraFlowManager.NAME)
class LucraFlowManager :
  LucraFlowManagerSpec<LucraFlow>() {
  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): LucraFlow {
    return LucraFlow(context)
  }

  @ReactProp(name = "name")
  override fun setName(view: LucraFlow?, name: String?) {
    // view?.setBackgroundColor(Color.parseColor(color))
  }

  companion object {
    const val NAME = "LucraFlow"
  }
}
