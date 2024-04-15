package com.lucrasdk

import android.view.View

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.LucraFlowViewManagerDelegate
import com.facebook.react.viewmanagers.LucraFlowViewManagerInterface

abstract class LucraFlowViewManagerSpec<T : View> : SimpleViewManager<T>(), LucraFlowViewManagerInterface<T> {
  private val mDelegate: ViewManagerDelegate<T>

  init {
    mDelegate = LucraFlowViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<T>? {
    return mDelegate
  }
}
