package com.lucrasdk

import android.view.View
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.ui.LucraUiProvider

class LucraProfilePillManager(private val callerContext: ReactApplicationContext) :
    SimpleViewManager<View>() {

  private var fragment: DialogFragment? = null

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(context: ThemedReactContext): View {
    val profilePill =
        LucraClient()
            .getLucraComponent(
                context,
                LucraUiProvider.LucraComponent.ProfilePill {
                  fragment = LucraClient().getLucraDialogFragment(it)
                  fragment?.show(
                      (context.currentActivity as FragmentActivity).supportFragmentManager,
                      it.toString()
                  )
                }
            )

    return profilePill
  }

  companion object {
    const val REACT_CLASS = "LucraProfilePill"
  }
}
