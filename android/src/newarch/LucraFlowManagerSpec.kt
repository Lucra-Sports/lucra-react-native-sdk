package com.lucrasdk

import android.view.View

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.LucraFlowManagerDelegate
import com.facebook.react.viewmanagers.LucraFlowManagerInterface

abstract class LucraFlowManagerSpec<T : View> : SimpleViewManager<T>(), LucraFlowManagerInterface<T> {
  private val mDelegate: ViewManagerDelegate<T>

  init {
    mDelegate = LucraFlowManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<T>? {
    return mDelegate
  }
}
