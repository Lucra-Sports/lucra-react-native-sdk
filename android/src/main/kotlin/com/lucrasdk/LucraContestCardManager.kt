package com.lucrasdk

import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.ui.LucraUiProvider


class LucraContestCardManager(private val callerContext: ReactApplicationContext) :
    SimpleViewManager<LucraContestCard>() {

    private var fragment: DialogFragment? = null
    private var context: ThemedReactContext? = null

    override fun getName(): String {
        return NAME
    }

    public override fun createViewInstance(context: ThemedReactContext): LucraContestCard {
        this.context = context
        return LucraContestCard(context)
    }

    @ReactProp(name = "contestId")
    fun setContestId(view: LucraContestCard?, contestId: String?) {
        val component =
            LucraClient()
                .getLucraComponent(
                    context!!,
                    LucraUiProvider.LucraComponent.ContestCard(
                        contestId = contestId
                            ?: throw IllegalStateException("contestId is required for LucraContestCard")
                    ) {
                        fragment = LucraClient().getLucraDialogFragment(it)
                        fragment?.show(
                            (context!!.currentActivity as FragmentActivity).supportFragmentManager,
                            it.toString()
                        )
                    }
                )

        view?.addView(component)
    }

    companion object {
        const val NAME = "LucraContestCard"
    }
}