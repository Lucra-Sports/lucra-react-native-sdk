package com.lucrasdk

import android.view.Choreographer
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.facebook.react.module.annotations.ReactModule
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactPropGroup
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.ui.LucraUiProvider

@ReactModule(name = LucraFlowViewManager.NAME)
class LucraFlowViewManager :
  LucraFlowViewManagerSpec<FrameLayout>() {
  private var context: ThemedReactContext? = null
  private var propWidth: Int? = null
  private var propHeight: Int? = null
  private var propFlex: Int? = null

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): FrameLayout {
    this.context = context
    return FrameLayout(context)
  }

  override fun getCommandsMap() = mapOf("create" to COMMAND_CREATE)

  override fun receiveCommand(
    root: FrameLayout,
    commandId: String,
    args: ReadableArray?
  ) {
    super.receiveCommand(root, commandId, args)
    val reactNativeViewId = requireNotNull(args).getInt(0)
    val flowName = args.getString(1)

    when (commandId.toInt()) {
      COMMAND_CREATE -> createFragment(root, reactNativeViewId, flowName)
    }
  }

  @ReactPropGroup(names = ["width", "height", "flex"], customType = "Style")
  fun setStyle(view: FrameLayout, index: Int, value: Int) {
    if (index == 0) propWidth = value
    if (index == 1) propHeight = value
    if (index == 2) propFlex = value
  }

  private fun createFragment(root: FrameLayout, reactNativeViewId: Int, flowName: String) {
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

    val parentView = root.findViewById<ViewGroup>(reactNativeViewId)
    setupLayout(parentView)

    val myFragment = LucraClient().getLucraFragment(lucraFlow)
    val activity = context?.currentActivity as FragmentActivity
    activity.supportFragmentManager
      .beginTransaction()
      .replace(reactNativeViewId, myFragment, reactNativeViewId.toString())
      .commit()
  }

  private fun setupLayout(view: View) {
    Choreographer.getInstance().postFrameCallback(object: Choreographer.FrameCallback {
      override fun doFrame(frameTimeNanos: Long) {
        manuallyLayoutChildren(view)
        view.viewTreeObserver.dispatchOnGlobalLayout()
        Choreographer.getInstance().postFrameCallback(this)
      }
    })
  }

  private fun manuallyLayoutChildren(view: View) {
    // propWidth and propHeight coming from react-native props
    if(propFlex != null) {
      // one should properly implement different flex numbers but for now occupying full parent
      val width = view.width
      val height = view.height

      view.measure(
        View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
        View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY))

      view.layout(0, 0, width, height)
    } else {
      val l = view.left
      val t = view.top
      val width = propWidth ?: view.width
      val height = requireNotNull(propHeight)

      view.measure(
        View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.AT_MOST),
        View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.AT_MOST))

      view.layout(0, view.top, width, height)
    }

  }

  companion object {
    const val NAME = "LucraFlowView"
    const val COMMAND_CREATE = 1
  }
}
