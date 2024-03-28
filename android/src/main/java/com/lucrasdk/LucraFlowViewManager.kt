package com.lucrasdk

import android.view.Choreographer
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.fragment.app.DialogFragment
import com.facebook.react.module.annotations.ReactModule
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactPropGroup
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.ui.LucraUiProvider

@ReactModule(name = LucraFlowViewManager.NAME)
class LucraFlowViewManager :
  LucraFlowViewManagerSpec<LucraFlowView>() {
  
  private var fragment: DialogFragment? = null

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): LucraFlowView {
    var parent = LucraFlowView(context)
    var component = LucraClient().getLucraFlowView(context, LucraUiProvider.LucraFlow.Profile)
    parent.addView(component)
    return parent

  }

  companion object {
    const val NAME = "LucraFlowView"
  }
}
