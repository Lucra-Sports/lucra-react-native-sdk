package com.lucrasdk

import android.view.View
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentActivity
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.ui.LucraUiProvider

@ReactModule(name = LucraRecommendedMatchupManager.NAME)
class LucraRecommendedMatchupManager : LucraRecommendedMatchupManagerSpec<View>() {

    private var fragment: DialogFragment? = null

    override fun getName(): String {
        return NAME
    }

    public override fun createViewInstance(context: ThemedReactContext): View {
        val profilePill =
            LucraClient()
                .getLucraComponent(
                    context,
                    LucraUiProvider.LucraComponent.RecommendedMatchups {
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
        const val NAME = "LucraRecommendedMatchup"
    }


}