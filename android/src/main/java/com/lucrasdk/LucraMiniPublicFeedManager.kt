package com.lucrasdk

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

@ReactModule(name = LucraMiniPublicFeedManager.NAME)
class LucraMiniPublicFeedManager :
  LucraMiniPublicFeedManagerSpec<LucraMiniPublicFeed>() {
  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): LucraMiniPublicFeed {
    return LucraMiniPublicFeed(context)
  }

  @ReactProp(name = "playerIds")
  override fun setPlayerIds(view: LucraMiniPublicFeed?, playerIds: ReadableArray?) {
    view.add
  }

  companion object {
    const val NAME = "LucraMiniPublicFeed"
  }
}
