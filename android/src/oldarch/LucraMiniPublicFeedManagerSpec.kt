package com.lucrasdk

import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager

abstract class LucraMiniPublicFeedManagerSpec<T : View> : SimpleViewManager<T>() {
  abstract fun setPlayerIds(view: T?, value: ReadableArray?)
}
