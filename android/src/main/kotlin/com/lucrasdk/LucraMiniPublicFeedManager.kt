package com.lucrasdk

import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.ui.LucraUiProvider

class LucraMiniPublicFeedManager(private val callerContext: ReactApplicationContext) :
    SimpleViewManager<LucraMiniPublicFeed>() {

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
    fun setPlayerIds(view: LucraMiniPublicFeed?, playerIds: ReadableArray?) {

        val feedComponent =
            LucraUiProvider.LucraComponent.MiniPublicFeed(
                playerIds?.toArrayList()?.map { it.toString() } ?: emptyList()
            ) {
                fragment = LucraClient().getLucraDialogFragment(it)
                fragment?.show(
                    (context!!.currentActivity as FragmentActivity).supportFragmentManager,
                    it.toString()
                )
            }

        val miniPublicFeed = LucraClient().getLucraComponent(context!!, feedComponent)

        view?.addView(miniPublicFeed)
    }

    companion object {
        const val NAME = "LucraMiniPublicFeed"
    }
}
