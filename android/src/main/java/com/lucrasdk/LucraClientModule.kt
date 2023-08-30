package com.lucrasdk

import android.app.Application
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.contest.GamesMatchup
import com.lucrasports.sdk.core.ui.LucraUiProvider
import com.lucrasports.sdk.ui.LucraUi


class LucraClientModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  private var fullAppFlowDialogFragment: DialogFragment? = null

  @ReactMethod
  fun initialize(authenticationClientId: String, environment: String) {
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

  @ReactMethod
  fun createGamesMatchup(gameTypeId: String, atStake: Double, promise: Promise) {
    LucraClient().createContest(gameTypeId, atStake) {
      when(it) {
        is GamesMatchup.CreateGamesMatchupResult.Failure -> promise.reject("Lucra SDK Error - createGamesMatchup Error", it.failure.toString())
        is GamesMatchup.CreateGamesMatchupResult.GYPCreatedMatchupOutput -> {
          val map = Arguments.createMap()

          map.putString("matchupId", it.matchupId)
          map.putString("ownerTeamId", it.ownerTeamId)
          map.putString("oponnentTeamId", it.opponentTeamId)

          promise.resolve(map)
        }
      }
    }
  }

  @ReactMethod
  fun acceptGamesMatchup(matchupId: String, teamId: String, promise: Promise) {
    LucraClient().acceptGamesYouPlayContest(matchupId, teamId) {
      when(it) {
        is GamesMatchup.MatchupActionResult.Failure -> promise.reject("Lucra SDK Error - acceptGamesMatchup Error", it.failure.toString())
        GamesMatchup.MatchupActionResult.Success -> promise.resolve(null)
      }
    }
  }

  @ReactMethod
  fun cancelGamesMatchup(matchupId: String, promise: Promise) {
    LucraClient().cancelGamesYouPlayContest(matchupId) {
      when(it) {
        is GamesMatchup.MatchupActionResult.Failure -> promise.reject("Lucra SDK Error - cancelGamesMatchup Error", it.failure.toString())
        GamesMatchup.MatchupActionResult.Success -> promise.resolve(null)
      }
    }
  }

  companion object {
    const val NAME = "LucraClient"
  }
}
