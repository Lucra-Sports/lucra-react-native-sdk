package com.lucrasdk

import android.app.Application
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.contest.GamesMatchup
import com.lucrasports.sdk.core.style_guide.ClientTheme
import com.lucrasports.sdk.core.style_guide.ColorStyle
import com.lucrasports.sdk.core.style_guide.Font
import com.lucrasports.sdk.core.style_guide.FontFamily
import com.lucrasports.sdk.core.style_guide.FontWeight
import com.lucrasports.sdk.core.ui.LucraFlowListener
import com.lucrasports.sdk.core.ui.LucraUiProvider
import com.lucrasports.sdk.ui.LucraUi
import com.facebook.react.module.annotations.ReactModule;
import com.lucrasports.sdk.core.user.SDKUser
import com.lucrasports.sdk.core.user.SDKUserResult


@ReactModule(name = LucraClientModule.NAME)
internal class LucraClientModule(
  private val context: ReactApplicationContext
) : NativeLucraClientSpec(context) {

  private var fullAppFlowDialogFragment: DialogFragment? = null
  private var userCallback: Callback? = null

  @ReactMethod
  override fun initialize(options: ReadableMap, promise: Promise) {
    val apiURL = options.getString("apiURL")
      ?: throw Exception("LucraSDK no api passed to constructor")
    val apiKey = options.getString("apiKey")
      ?: throw Exception("LucraSDK no apiKey passed to constructor")

    val environment = options.getString("environment")

    val theme = options.getMap("theme")
    var clientTheme = ClientTheme()
    var fontFamily = FontFamily(emptyList())
    if (theme != null) {
      val colorStyle = ColorStyle(
        theme.getString("background"),
        theme.getString("surface"),
        theme.getString("primary"),
        theme.getString("secondary"),
        theme.getString("tertiary"),
        theme.getString("onBackground"),
        theme.getString("onSurface"),
        theme.getString("onPrimary"),
        theme.getString("onSecondary"),
        theme.getString("onTertiary"),
      )

      val fontFamilyObj = theme.getMap("fontFamily")
      if (fontFamilyObj != null) {
        val fontList = mutableListOf<Font>()

        val boldFamily = fontFamilyObj.getString("bold")
        if (boldFamily != null) {
          fontList.add(Font(fontName = boldFamily, weight = FontWeight.Bold))
        }

        val semiboldFamily = fontFamilyObj.getString("semibold")
        if (semiboldFamily != null) {
          fontList.add(Font(fontName = semiboldFamily, weight = FontWeight.SemiBold))
        }

        val normalFamily = fontFamilyObj.getString("normal")
        if (normalFamily != null) {
          fontList.add(Font(fontName = normalFamily, weight = FontWeight.Normal))
        }

        val mediumFamily = fontFamilyObj.getString("medium")
        if (mediumFamily != null) {
          fontList.add(Font(fontName = mediumFamily, weight = FontWeight.Normal))
        }

        fontFamily = FontFamily(fontList)
      }

      clientTheme = ClientTheme(colorStyle, fontFamily)
    }

    LucraClient.initialize(
      application = context.applicationContext as Application,
      lucraUiProvider = LucraUi(
        lucraFlowListener = object : LucraFlowListener {
          // Callback for entering Lucra permitted flow launch points.
          override fun launchNewLucraFlowEntryPoint(entryLucraFlow: LucraUiProvider.LucraFlow): Boolean {
            // TODO if RN integrators want a full screen flow, we can expose a property to consume
            //  these launch events as a new dialog fragment.
            return false
          }

          //Callback for exiting all Lucra permitted flow launch points
          override fun onFlowDismissRequested(entryLucraFlow: LucraUiProvider.LucraFlow) {
            (context.currentActivity as FragmentActivity).supportFragmentManager.findFragmentByTag(
              entryLucraFlow.toString()
            )?.let {
              (it as DialogFragment).dismiss()
            }
          }
        }
      ),
      apiUrl = apiURL,
      apiKey = apiKey,
      environment = when (environment) {
        "production" -> LucraClient.Companion.Environment.PRODUCTION
        "staging" -> LucraClient.Companion.Environment.STAGING
        else -> LucraClient.Companion.Environment.PRODUCTION
      },
      clientTheme = clientTheme,
      outputLogs = true,
    )
  }

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  override fun present(flow: String) {
    val lucraFlow = when (flow) {
      "profile" -> LucraUiProvider.LucraFlow.Profile
      "addFunds" -> LucraUiProvider.LucraFlow.AddFunds
      // TODO(osp) LucraFlow is missing MyMatchup on Android
//      "onboarding" -> LucraUiProvider.LucraFlow.Onboarding
      "verifyIdentity" -> LucraUiProvider.LucraFlow.VerifyIdentity
      "createGamesMatchup" -> LucraUiProvider.LucraFlow.CreateGamesMatchup
      "withdrawFunds" -> LucraUiProvider.LucraFlow.WithdrawFunds
      "publicFeed" -> LucraUiProvider.LucraFlow.PublicFeed
      "myMatchup" -> LucraUiProvider.LucraFlow.MyMatchup
      else -> LucraUiProvider.LucraFlow.Profile
    }

    fullAppFlowDialogFragment = LucraClient().getLucraDialogFragment(lucraFlow)

    fullAppFlowDialogFragment?.show(
      (context.currentActivity as FragmentActivity).supportFragmentManager,
      lucraFlow.toString() // this tag will be used to dismiss in onFlowDismissRequested(flow)
    )
  }

  fun throwLucraJSError(promise: Promise, failure: GamesMatchup.FailedCreateGamesMatchup) {
    val errorCode = when (failure) {
      is GamesMatchup.FailedCreateGamesMatchup.APIError ->
        "apiError"

      is GamesMatchup.FailedCreateGamesMatchup.LocationError ->
        "locationError"

      GamesMatchup.FailedCreateGamesMatchup.UserStateError.InsufficientFunds ->
        "insufficientFunds"

      GamesMatchup.FailedCreateGamesMatchup.UserStateError.NotAllowed ->
        "notAllowed"

      GamesMatchup.FailedCreateGamesMatchup.UserStateError.NotInitialized ->
        "notInitialized"

      GamesMatchup.FailedCreateGamesMatchup.UserStateError.Unverified ->
        "unverified"

      else -> {
        "unknownError"
      }
    }

    promise.reject(
      errorCode,
      failure.toString()
    )
  }

  @ReactMethod
  override fun createGamesMatchup(gameTypeId: String, atStake: Double, promise: Promise) {
    LucraClient().createContest(gameTypeId, atStake) {
      when (it) {
        is GamesMatchup.CreateGamesMatchupResult.Failure -> {
          throwLucraJSError(promise, it.failure)
        }

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
  override fun acceptGamesMatchup(matchupId: String, teamId: String, promise: Promise) {
    LucraClient().acceptGamesYouPlayContest(matchupId, teamId) {
      when (it) {
        is GamesMatchup.MatchupActionResult.Failure ->
          throwLucraJSError(promise, it.failure)

        GamesMatchup.MatchupActionResult.Success -> promise.resolve(null)
      }
    }
  }

  @ReactMethod
  override fun cancelGamesMatchup(matchupId: String, promise: Promise) {
    LucraClient().cancelGamesYouPlayContest(matchupId) {
      when (it) {
        is GamesMatchup.MatchupActionResult.Failure ->
          throwLucraJSError(promise, it.failure)

        GamesMatchup.MatchupActionResult.Success -> promise.resolve(null)
      }
    }
  }

  @ReactMethod
  override fun configureUser(user: ReadableMap, promise: Promise) {
    val newUser = SDKUser(
      address = user.getString("address"),
      addressCont = user.getString("addressCont"),
      city = user.getString("city"),
      email = user.getString("email"),
      firstName = user.getString("firstName"),
      lastName = user.getString("lastName"),
      phoneNumber = user.getString("phoneNumber"),
      state = user.getString("state"),
      username = user.getString("username"),
      zip = user.getString("zip")
    )
    LucraClient().configure(sdkUser = newUser ) {
      when(it) {
        is SDKUserResult.Success ->
          promise.resolve(null)

        is SDKUserResult.InvalidUsername ->
          promise.reject("invalid_username", "username is not valid")

        is SDKUserResult.NotLoggedIn ->
          promise.reject("not_logged_in", "not logged in")

        is SDKUserResult.Error ->
          promise.reject("unknown_error", it.toString())
      }
    }
  }

  @ReactMethod
  override fun logout(promise: Promise?) {
    LucraClient().logout(this.context)
  }

  @ReactMethod
  override fun registerUserCallback(callback: Callback) {
    userCallback = callback
//    TODO android client does not support callbacks yet when user is updated
//    LucraClient().getSDKUser {  }
  }

  companion object {
    const val NAME = "LucraClient"
  }
}
