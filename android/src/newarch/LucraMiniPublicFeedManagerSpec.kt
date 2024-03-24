package com.lucrasdk

import android.view.View

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.LucraMiniPublicFeedManagerDelegate
import com.facebook.react.viewmanagers.LucraMiniPublicFeedManagerInterface

abstract class LucraMiniPublicFeedManagerSpec<T : View> : SimpleViewManager<T>(), LucraMiniPublicFeedManagerInterface<T> {
  private val mDelegate: ViewManagerDelegate<T>

  init {
    mDelegate = LucraMiniPublicFeedManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<T>? {
    return mDelegate
  }
}
