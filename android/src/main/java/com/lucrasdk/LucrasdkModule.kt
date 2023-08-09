package com.lucrasdk

import android.app.Application
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.lucrasports.sdk.core.LucraCoreSdk
import com.lucrasports.sdk.ui.LucraUi

class LucrasdkModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  /**
   * Auto lazily initialize the SDK at runtime. Can also be a manual function call.
   */
  private val sdk: LucraCoreSdk by lazy {
    LucraCoreSdk.initialize(
      application = reactContext.applicationContext as Application,
      lucraUiProvider = LucraUi()
    )
  }

  override fun getName(): String {
    return NAME
  }

  /**
   * This is just a method that does not accept any parameter right now.
   * This is because we have only single point of entry that takes no argument to Android SDK.
   * Once we expand entry point to multiple points, we can either start accepting parameters,
   * or have discrete functions for each.
   */
  @ReactMethod
  fun launchFullAppFlow() {
    val fullAppFlowDialogFragment: DialogFragment = sdk.getLucraFragment()

    fullAppFlowDialogFragment.show(
      /* manager = */ (reactContext.currentActivity as FragmentActivity).supportFragmentManager,
      /* tag = */"FULL_APP_FLOW"
    )
  }

  companion object {
    const val NAME = "LucraAndroidSdk"
  }
}
