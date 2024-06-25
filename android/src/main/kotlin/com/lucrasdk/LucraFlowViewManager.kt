package com.lucrasdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.lucrasports.sdk.core.LucraClient

class LucraFlowViewManager(private val callerContext: ReactApplicationContext) :
  SimpleViewManager<LucraFlowView>() {

  private lateinit var context: ThemedReactContext

  override fun getName(): String {
    return REACT_CLASS
  }
  
  override fun createViewInstance(context: ThemedReactContext): LucraFlowView {
    this.context = context
    return LucraFlowView(context)
  }

  @Throws(Exception::class)
  @ReactProp(name = "flow")
  fun setFlow(view: LucraFlowView?, flow: String?) {
    val flow = flow ?: throw Exception("Flow is required")
    val lucraFlow = LucraUtils.getLucraFlow(flow)
    val component = LucraClient().getLucraFlowView(context, lucraFlow)
    view?.addView(component)
  }

  companion object {
    const val REACT_CLASS = "LucraFlowView"
  }
}
