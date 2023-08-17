package com.lucrasdk

import android.app.Application
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.ui.LucraUiProvider
import com.lucrasports.sdk.ui.LucraUi

class LucraClientModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  private var fullAppFlowDialogFragment: DialogFragment? = null

  @ReactMethod
  fun createInstance(authenticationClientId: String, environment: String) {
    LucraClient.initialize(
      application = reactContext.applicationContext as Application,
      lucraUiProvider = LucraUi(),
      authClientId = authenticationClientId,
      environment = when (environment) {
        "production" -> LucraClient.Companion.Environment.PRODUCTION
        "staging" -> LucraClient.Companion.Environment.STAGING
        else -> LucraClient.Companion.Environment.PRODUCTION
      },
      lucraClientListener = object : LucraClient.LucraClientListener {
        override fun onLucraExit() {
          fullAppFlowDialogFragment?.dismiss()
        }
      },
      outputLogs = true,
    )
  }

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun present(flow: String) {
    val lucraFlow = when (flow) {
      "profile" -> LucraUiProvider.LucraFlow.Profile
      "addFunds" -> LucraUiProvider.LucraFlow.AddFunds
      else -> LucraUiProvider.LucraFlow.Profile
    }
    fullAppFlowDialogFragment = LucraClient().getLucraDialogFragment(lucraFlow)

    fullAppFlowDialogFragment?.show(
      (reactContext.currentActivity as FragmentActivity).supportFragmentManager,
      "LUCRA_ANDROID_DIALOG_FRAGMENT"
    )
  }

  companion object {
    const val NAME = "LucraClient"
  }
}
