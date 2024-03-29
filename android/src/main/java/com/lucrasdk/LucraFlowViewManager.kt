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
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.annotations.ReactPropGroup
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.ui.LucraUiProvider

@ReactModule(name = LucraFlowViewManager.NAME)
class LucraFlowViewManager :
  LucraFlowViewManagerSpec<LucraFlowView>() {

    private lateinit var context: ThemedReactContext;

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): LucraFlowView {
    this.context = context
    return LucraFlowView(context)
  }

  @ReactProp(name = "flow")
  override fun setFlow(view: LucraFlowView?, flow: String?) {
    val lucraFlow = when (flow) {
      "profile" -> LucraUiProvider.LucraFlow.Profile
      "addFunds" -> LucraUiProvider.LucraFlow.AddFunds
//      "onboarding" -> LucraUiProvider.LucraFlow.Onboarding
      "verifyIdentity" -> LucraUiProvider.LucraFlow.VerifyIdentity
      "createGamesMatchup" -> LucraUiProvider.LucraFlow.CreateGamesMatchup
      "withdrawFunds" -> LucraUiProvider.LucraFlow.WithdrawFunds
      "publicFeed" -> LucraUiProvider.LucraFlow.PublicFeed
      "myMatchup" -> LucraUiProvider.LucraFlow.MyMatchup
      else -> LucraUiProvider.LucraFlow.Profile
    }

    if(flow != null) {
      val component = LucraClient().getLucraFlowView(context, lucraFlow)
      view?.addView(component)
    }
  }

  companion object {
    const val NAME = "LucraFlowView"
  }
}
