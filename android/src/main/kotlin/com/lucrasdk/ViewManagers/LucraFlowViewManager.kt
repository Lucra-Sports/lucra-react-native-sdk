package com.lucrasdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.lucrasdk.Libs.LucraUtils
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
    if(flow == null) {
      throw Exception("Flow is required")
    }
    val lucraFlow = LucraUtils.getLucraFlow(flow, null, null, null)
    // TODO migrate this to a fragment implementation
    //  follow this approach https://github.com/appcues/appcues-react-native-module/blob/d9302d99e63ea46e6588845018aa4428b921b628/android/src/main/java/com/appcuesreactnative/AppcuesFrameViewManager.kt#L45
    val component = LucraClient().getLucraFlowView(context, lucraFlow)
    view?.addView(component)
  }

  companion object {
    const val REACT_CLASS = "LucraFlowView"
  }
}
