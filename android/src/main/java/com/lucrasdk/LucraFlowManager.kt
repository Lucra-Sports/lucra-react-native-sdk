package com.lucrasdk

import com.facebook.react.module.annotations.ReactModule
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.ui.LucraUiProvider

@ReactModule(name = LucraFlowManager.NAME)
class LucraFlowManager :
  LucraFlowManagerSpec<LucraFlow>() {
  
  private var fragment: DialogFragment? = null
  private var context: ThemedReactContext? = null

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): LucraFlow {
    this.context = context
    return LucraFlow(context)
  }

  @ReactProp(name = "name")
  override fun setName(view: LucraFlow?, name: String?) {
    val lucraFlow = when (name) {
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

    var fragment = LucraClient().getLucraFragment(lucraFlow)

//    view?.addView(fragment.view)
  }

  companion object {
    const val NAME = "LucraFlow"
  }
}
