package com.lucrasdk

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.lucrasports.sdk.core.LucraClient

@ReactModule(name = LucraFlowViewManager.NAME)
class LucraFlowViewManager : LucraFlowViewManagerSpec<LucraFlowView>() {

  private lateinit var context: ThemedReactContext

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): LucraFlowView {
    this.context = context
    return LucraFlowView(context)
  }

  @Throws(Exception::class)
  @ReactProp(name = "flow")
  override fun setFlow(view: LucraFlowView?, flow: String?) {
    val flow = flow ?: throw Exception("Flow is required")
    val lucraFlow = LucraUtils.getLucraFlow(flow)
    val component = LucraClient().getLucraFlowView(context, lucraFlow)
    view?.addView(component)
  }

  companion object {
    const val NAME = "LucraFlowView"
  }
}
