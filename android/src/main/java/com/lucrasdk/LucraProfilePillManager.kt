package com.lucrasdk

import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentActivity
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.ui.LucraUiProvider

@ReactModule(name = LucraProfilePillManager.NAME)
class LucraProfilePillManager :
  LucraProfilePillManagerSpec<LucraProfilePill>() {
  private var fragment: DialogFragment? = null

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): LucraProfilePill {
    var parent = LucraProfilePill(context)
    var profilePill = LucraClient().getLucraComponent(context, LucraUiProvider.LucraComponent.ProfilePill {
      fragment = LucraClient().getLucraDialogFragment(it)
      fragment?.show(
        (context.currentActivity as FragmentActivity).supportFragmentManager,
        it.toString()
      )
    })

    parent.addView(profilePill)
    return parent
  }

  companion object {
    const val NAME = "LucraProfilePill"
  }
}
