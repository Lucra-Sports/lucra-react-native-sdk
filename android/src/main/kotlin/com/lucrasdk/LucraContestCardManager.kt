package com.lucrasdk

import android.view.View
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentActivity
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.ui.LucraUiProvider

@ReactModule(name = LucraContestCardManager.NAME)
class LucraContestCardManager : LucraContestCardManagerSpec<View>() {

    private var fragment: DialogFragment? = null

    override fun getName(): String {
        return NAME
    }

    // TODO there seems to be missing a CreateContestButton on the Android SDK
    public override fun createViewInstance(context: ThemedReactContext): View {
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
        const val NAME = "LucraContestCard"
    }


}