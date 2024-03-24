package com.lucrasdk

import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager

abstract class LucraFlowManagerSpec<T : View> : SimpleViewManager<T>() {
  abstract fun setName(view: T?, value: String?)
}
