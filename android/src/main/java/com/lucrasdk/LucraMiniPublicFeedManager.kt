package com.lucrasdk

import com.facebook.react.module.annotations.ReactModule
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.ui.LucraUiProvider

@ReactModule(name = LucraMiniPublicFeedManager.NAME)
class LucraMiniPublicFeedManager :
  LucraMiniPublicFeedManagerSpec<LucraMiniPublicFeed>() {
    
  private var fragment: DialogFragment? = null
  private var context: ThemedReactContext? = null

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): LucraMiniPublicFeed {
    this.context = context
    return LucraMiniPublicFeed(context)
  }

  @ReactProp(name = "playerIds")
  override fun setPlayerIds(view: LucraMiniPublicFeed?, playerIds: ReadableArray?) {
    var player1 = ""
    var player2 = ""

    if (playerIds != null) {
      if(playerIds.size() > 0) {
        player1 = playerIds.getString(0).orEmpty()
      }
      if (playerIds.size() > 1) {
        player2 = playerIds.getString(1).orEmpty()
      }
    }

    var feedFragment = LucraUiProvider.LucraComponent.MiniPublicFeed(player1, player2) {
      fragment = LucraClient().getLucraDialogFragment(it)
      fragment?.show(
        (context!!.currentActivity as FragmentActivity).supportFragmentManager,
        it.toString()
      )
    }
    
    var miniPublicFeed = LucraClient().getLucraComponent(context!!, feedFragment)

    view?.addView(miniPublicFeed)
  }

  companion object {
    const val NAME = "LucraMiniPublicFeed"
  }
}
