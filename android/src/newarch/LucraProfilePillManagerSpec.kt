package com.lucrasdk

import android.view.View

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.LucraProfilePillManagerDelegate
import com.facebook.react.viewmanagers.LucraProfilePillManagerInterface

abstract class LucraProfilePillManagerSpec<T : View> : SimpleViewManager<T>(), LucraProfilePillManagerInterface<T> {
  private val mDelegate: ViewManagerDelegate<T>

  init {
    mDelegate = LucraProfilePillManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<T>? {
    return mDelegate
  }
}
