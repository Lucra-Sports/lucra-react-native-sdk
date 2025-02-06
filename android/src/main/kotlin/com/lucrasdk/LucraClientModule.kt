package com.lucrasdk

import ErrorMapper.rejectJoinTournamentError
import ErrorMapper.rejectRecommendedTournamentsError
import ErrorMapper.rejectRetrieveTournamentError
import android.app.Application
import androidx.core.os.bundleOf
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.lucrasdk.Libs.LucraMapper
import com.lucrasdk.Libs.LucraMapper.readableMapToColorStyle
import com.lucrasdk.Libs.LucraMapper.readableMapToFontFamily
import com.lucrasdk.Libs.LucraMapper.rewardToMap
import com.lucrasdk.Libs.LucraMapper.sdkUserToMap
import com.lucrasdk.Libs.LucraMapper.writableNativeMapToLucraConvertToCreditWithdrawMethod
import com.lucrasdk.Libs.LucraMapper.writableNativeMapToLucraReward
import com.lucrasdk.Libs.LucraUtils
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.contest.GamesMatchup
import com.lucrasports.sdk.core.contest.PoolTournament
import com.lucrasports.sdk.core.contest.SportsMatchup
import com.lucrasports.sdk.core.convert_credit.LucraConvertToCreditProvider
import com.lucrasports.sdk.core.convert_credit.LucraConvertToCreditWithdrawMethod
import com.lucrasports.sdk.core.events.LucraEvent
import com.lucrasports.sdk.core.events.LucraEventListener
import com.lucrasports.sdk.core.reward.LucraReward
import com.lucrasports.sdk.core.reward.LucraRewardProvider
import com.lucrasports.sdk.core.style_guide.ClientTheme
import com.lucrasports.sdk.core.style_guide.FontFamily
import com.lucrasports.sdk.core.ui.LucraFlowListener
import com.lucrasports.sdk.core.ui.LucraUiProvider
import com.lucrasports.sdk.core.user.SDKUser
import com.lucrasports.sdk.core.user.SDKUserResult
import com.lucrasports.sdk.ui.LucraUi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.first

@ReactModule(name = LucraClientModule.NAME)
class LucraClientModule(private val context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

    private var fullAppFlowDialogFragment: DialogFragment? = null
    private var _deepLinkEmitter = MutableStateFlow<String>("")
    private var _deepLinkState: SharedFlow<String> = _deepLinkEmitter.asSharedFlow()

    private var _creditConversionEmitter = MutableStateFlow<ReadableMap?>(null)
    private var _creditConversionEmitterState: SharedFlow<ReadableMap?> =
        _creditConversionEmitter.asSharedFlow()

    private var _availableRewardsEmitter = MutableStateFlow<ReadableArray?>(null)
    private var _availableRewardsEmitterState: SharedFlow<ReadableArray?> =
        _availableRewardsEmitter.asSharedFlow()

    private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun initialize(options: ReadableMap, promise: Promise) {
        val apiURL =
            options.getString("apiURL")
                ?: throw Exception("LucraSDK no api URL passed to constructor")
        val apiKey =
            options.getString("apiKey")
                ?: throw Exception("LucraSDK no apiKey passed to constructor")
        val environment =
            options.getString("environment")
                ?: throw Exception("LucraSDK no environment passed to constructor")

        val theme = options.getMap("theme")
        var clientTheme = ClientTheme()
        var fontFamily: FontFamily? = null
        if (theme != null) {
            val colorStyle = readableMapToColorStyle(theme)

            val fontFamilyObj = theme.getMap("fontFamily")
            if (fontFamilyObj != null) {
                fontFamily = readableMapToFontFamily(fontFamilyObj)
            }

            clientTheme = ClientTheme(colorStyle, fontFamily)
        }

        try {
            LucraClient.initialize(
                application = context.applicationContext as Application,
                lucraUiProvider = buildLucraUIInstance(),
                apiUrl = apiURL,
                apiKey = apiKey,
                environment = LucraUtils.getLucraEnvironment(environment),
                clientTheme = clientTheme,
                outputLogs = true,
            )

            LucraClient().setDeeplinkTransformer { lucraLink ->
                val linkMap = Arguments.createMap()
                linkMap.putString("link", lucraLink)
                sendEvent(context, "_deepLink", linkMap)
                val transformedLink = _deepLinkState.first { it != "" }
                transformedLink
            }

            LucraClient()
                .setEventListener(
                    object : LucraEventListener {
                        override fun onEvent(event: LucraEvent) {
                            when (event) {
                                is LucraEvent.GamesContest.Created -> {
                                    sendEvent(
                                        context,
                                        "gamesMatchupCreated",
                                        Arguments.makeNativeMap(
                                            bundleOf("id" to event.contestId)
                                        )
                                    )
                                }

                                is LucraEvent.SportsContest.Created -> {
                                    sendEvent(
                                        context,
                                        "sportsMatchupCreated",
                                        Arguments.makeNativeMap(
                                            bundleOf("id" to event.contestId)
                                        )
                                    )
                                }

                                is LucraEvent.GamesContest.Accepted ->
                                    sendEvent(
                                        context,
                                        "gamesMatchupAccepted",
                                        Arguments.makeNativeMap(
                                            bundleOf(
                                                "id" to
                                                        event.contestId
                                            )
                                        )
                                    )

                                is LucraEvent.SportsContest.Accepted ->
                                    sendEvent(
                                        context,
                                        "sportsMatchupAccepted",
                                        Arguments.makeNativeMap(
                                            bundleOf(
                                                "id" to
                                                        event.contestId
                                            )
                                        )
                                    )

                                is LucraEvent.GamesContest.Canceled ->
                                    sendEvent(
                                        context,
                                        "gamesMatchupCancelled",
                                        Arguments.makeNativeMap(
                                            bundleOf(
                                                "id" to
                                                        event.matchupId
                                            )
                                        )
                                    )

                                is LucraEvent.SportsContest.Canceled ->
                                    sendEvent(
                                        context,
                                        "sportsMatchupCancelled",
                                        Arguments.makeNativeMap(
                                            bundleOf(
                                                "id" to
                                                        event.matchupId
                                            )
                                        )
                                    )
                            }
                        }
                    }
                )

            LucraClient().observeSDKUser { user ->
                when (user) {
                    is SDKUserResult.Error -> {
                        val res = Arguments.createMap()
                        res.putString("error", user.error.toString())
                        sendEvent(context, "user", res)
                    }

                    SDKUserResult.InvalidUsername -> {
                        // intentionally left blank
                    }

                    SDKUserResult.Loading -> {
                        // intentionally left blank
                    }

                    SDKUserResult.NotLoggedIn -> {
                        val res = Arguments.createMap()
                        res.putNull("user")
                        sendEvent(context, "user", res)
                    }

                    is SDKUserResult.Success -> {
                        sendEvent(context, "user", sdkUserToMap(user.sdkUser))
                    }

                    SDKUserResult.WaitingForLogin -> {
                        // intentionally left blank
                    }
                }
            }
        } catch (e: Exception) {
            promise.reject(e.toString(), e.toString())
        }

        promise.resolve(null)
    }

    private fun buildLucraUIInstance() =
        LucraUi(
            lucraFlowListener =
            object : LucraFlowListener {
                // Callback for entering Lucra permitted flow launch points.
                override fun launchNewLucraFlowEntryPoint(
                    entryLucraFlow: LucraUiProvider.LucraFlow
                ): Boolean {
                    LucraClient().getLucraDialogFragment(entryLucraFlow).also {
                        it.show(
                            (context.currentActivity as FragmentActivity)
                                .supportFragmentManager,
                            entryLucraFlow.toString()
                        )
                    }
                    return true
                }

                // Callback for exiting all Lucra permitted flow launch points
                override fun onFlowDismissRequested(
                    entryLucraFlow: LucraUiProvider.LucraFlow
                ) {
                    sendEvent(context, "lucraFlowDismissed", Arguments.createMap().apply {
                        putString("lucraFlow", entryLucraFlow.toString())
                    })
                    (context.currentActivity as FragmentActivity)
                        .supportFragmentManager.findFragmentByTag(
                            entryLucraFlow.toString()
                        )
                        ?.let { (it as DialogFragment).dismiss() }
                }
            }
        )

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun present(args: ReadableMap) {
        val flowName = args.getString("name")!!
        val matchupId = args.getString("matchupId")
        val teaminviteId = args.getString("teaminviteId")
        val gameTypeId = args.getString("gameId")

        val flow = LucraUtils.getLucraFlow(flowName, matchupId, teaminviteId, gameTypeId)

        fullAppFlowDialogFragment = LucraClient().getLucraDialogFragment(flow)

        fullAppFlowDialogFragment?.show(
            (context.currentActivity as FragmentActivity).supportFragmentManager,
            flow.toString() // this tag will be used to dismiss in
            // onFlowDismissRequested(flow)
        )
    }

    private fun throwMatchUpError(
        promise: Promise,
        failure: GamesMatchup.FailedCreateGamesMatchup
    ) {
        val errorCode =
            when (failure) {
                is GamesMatchup.FailedCreateGamesMatchup.APIError -> "apiError"
                is GamesMatchup.FailedCreateGamesMatchup.LocationError -> "locationError"
                GamesMatchup.FailedCreateGamesMatchup.UserStateError.InsufficientFunds ->
                    "insufficientFunds"

                GamesMatchup.FailedCreateGamesMatchup.UserStateError.NotAllowed -> "notAllowed"
                GamesMatchup.FailedCreateGamesMatchup.UserStateError.NotInitialized ->
                    "notInitialized"

                GamesMatchup.FailedCreateGamesMatchup.UserStateError.Unverified -> "unverified"
                else -> {
                    "unknownError"
                }
            }
        promise.reject(errorCode, failure.toString())
    }

    @ReactMethod
    fun createGamesMatchup(gameTypeId: String, atStake: Double, promise: Promise) {
        LucraClient().createContest(gameTypeId, atStake) {
            when (it) {
                is GamesMatchup.CreateGamesMatchupResult.Failure -> {
                    throwMatchUpError(promise, it.failure)
                }

                is GamesMatchup.CreateGamesMatchupResult.GYPCreatedMatchupOutput -> {
                    val map = Arguments.createMap()

                    map.putString("matchupId", it.matchupId)
                    map.putString("ownerTeamId", it.ownerTeamId)
                    map.putString("opponentTeamId", it.opponentTeamId)

                    promise.resolve(map)
                }
            }
        }
    }

    @ReactMethod
    fun acceptGamesMatchup(matchupId: String, teamId: String, promise: Promise) {
        LucraClient().acceptGamesYouPlayContest(matchupId, teamId) {
            when (it) {
                is GamesMatchup.MatchupActionResult.Failure ->
                    throwMatchUpError(promise, it.failure)

                GamesMatchup.MatchupActionResult.Success -> promise.resolve(null)
            }
        }
    }

    @ReactMethod
    fun cancelGamesMatchup(matchupId: String, promise: Promise) {
        LucraClient().cancelGamesYouPlayContest(matchupId) {
            when (it) {
                is GamesMatchup.MatchupActionResult.Failure ->
                    throwMatchUpError(promise, it.failure)

                GamesMatchup.MatchupActionResult.Success -> promise.resolve(null)
            }
        }
    }

    @ReactMethod
    fun getGamesMatchup(matchupId: String, promise: Promise) {
        LucraClient().getGamesMatchup(matchupId) { result ->
            when (result) {
                is GamesMatchup.RetrieveGamesMatchupResult.Failure ->
                    promise.reject(result.failure.toString(), result.failure.toString())

                is GamesMatchup.RetrieveGamesMatchupResult.GYPMatchupDetailsOutput -> {
                    val res = LucraMapper.gamesMatchupToMap(result)

                    promise.resolve(res)
                }
            }
        }
    }

    @ReactMethod
    fun emitDeepLink(link: String) {
        _deepLinkEmitter.tryEmit(link)
    }

    @ReactMethod
    fun emitAvailableRewards(args: ReadableArray) {
        _availableRewardsEmitter.tryEmit(args)
    }

    @ReactMethod
    fun emitCreditConversion(args: ReadableMap) {
        _creditConversionEmitter.tryEmit(args)
    }

    @ReactMethod
    fun registerRewardProvider() {
        LucraClient()
            .setRewardProvider(
                object : LucraRewardProvider {
                    override suspend fun availableRewards(): List<LucraReward> {
                        sendEvent(context, "_availableRewards", null)
                        val rewards = _availableRewardsEmitterState.first { it != null }!!
                        return rewards.toArrayList().map {
                            @Suppress("UNCHECKED_CAST") val rewardMap =
                                Arguments.makeNativeMap(it as Map<String, Any>)
                            writableNativeMapToLucraReward(rewardMap)
                        }
                    }

                    override fun claimReward(reward: LucraReward) {
                        sendEvent(context, "_claimReward", rewardToMap(reward))
                    }

                    override fun viewRewards() {
                        sendEvent(context, "_viewRewards", null)
                    }
                }
            )
    }

    @ReactMethod
    fun registerConvertToCreditProvider() {
        LucraClient()
            .setConvertToCreditProvider(
                object : LucraConvertToCreditProvider {
                    override suspend fun getCreditAmount(
                        cashAmount: Double
                    ): LucraConvertToCreditWithdrawMethod {
                        val linkMap = Arguments.createMap()
                        linkMap.putDouble("amount", cashAmount)
                        sendEvent(context, "_creditConversion", linkMap)
                        val responseMap =
                            _creditConversionEmitterState.first { it != null }!!
                        return writableNativeMapToLucraConvertToCreditWithdrawMethod(
                            responseMap,
                            cashAmount
                        )
                    }
                }
            )
    }

    @ReactMethod
    fun handleLucraLink(lucraLink: String, promise: Promise) {
        val lucraFlow = LucraClient().getLucraFlowForDeeplinkUri(lucraLink)
        if (lucraFlow != null) {
            fullAppFlowDialogFragment = LucraClient().getLucraDialogFragment(lucraFlow)
            fullAppFlowDialogFragment?.show(
                (context.currentActivity as FragmentActivity).supportFragmentManager,
                lucraFlow.toString() // this tag will be used to dismiss in
                // onFlowDismissRequested(flow)
            )
            promise.resolve(true)
        } else {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun configureUser(user: ReadableMap, promise: Promise) {
        // small trick to simplify code a bit
        val addressJS = if (user.hasKey("address")) user.getMap("address")!! else user
        val newUser =
            SDKUser(
                address = addressJS.getString("address"),
                addressCont = addressJS.getString("addressCont"),
                city = addressJS.getString("city"),
                email = user.getString("email"),
                firstName = user.getString("firstName"),
                lastName = user.getString("lastName"),
                phoneNumber = user.getString("phoneNumber"),
                state = addressJS.getString("state"),
                username = user.getString("username"),
                zip = addressJS.getString("zip"),
                avatarUrl = user.getString("avatarURL")
            )
        LucraClient().configure(sdkUser = newUser) {
            when (it) {
                is SDKUserResult.Success -> promise.resolve(null)
                is SDKUserResult.InvalidUsername ->
                    promise.reject("invalid_username", "username is not valid")

                is SDKUserResult.NotLoggedIn -> promise.reject("not_logged_in", "not logged in")
                is SDKUserResult.Error -> promise.reject("unknown_error", it.error)
                SDKUserResult.Loading -> {
                    // Should not happen in this context
                }

                SDKUserResult.WaitingForLogin -> {
                    // Intentionally left blank
                }
            }
        }
    }

    @ReactMethod()
    fun getUser(promise: Promise) {
        LucraClient().getSDKUser {
            when (it) {
                is SDKUserResult.Error -> promise.reject("not_logged_in", it.error)
                SDKUserResult.InvalidUsername ->
                    promise.reject("invalid_username", "username is not valid")

                SDKUserResult.NotLoggedIn -> promise.reject("not_logged_in", "not logged in")
                is SDKUserResult.Success -> {
                    promise.resolve(sdkUserToMap(it.sdkUser))
                }

                SDKUserResult.Loading -> promise.reject("loading", "User is still loading")
                SDKUserResult.WaitingForLogin -> {
                    // intentionally blank
                }
            }
        }
    }

    @ReactMethod
    fun getSportsMatchup(contestId: String, promise: Promise) {
        LucraClient().getSportsMatchup(
            matchupId = contestId,
        ) { result ->
            when (result) {
                is SportsMatchup.RetrieveSportsMatchupResult.Failure -> {
                    when (val failure = result.failure) {
                        is SportsMatchup.FailedRetrieveSportsMatchup.APIError ->
                            promise.reject("could_not_resolve_sports_matchup", failure.message)

                        is SportsMatchup.FailedRetrieveSportsMatchup.LocationError ->
                            promise.reject("could_not_resolve_sports_matchup", failure.message)
                    }
                }

                is SportsMatchup.RetrieveSportsMatchupResult.MatchupDetailsOutput -> {
                    promise.resolve(LucraMapper.topLevelMatchupToMap(result.topLevelMatchupType))
                }
            }
        }
    }

    @ReactMethod
    fun getRecommendedTournaments(params: ReadableMap, promise: Promise) {
        val includeClosed = params.getBoolean("includeClosed")
        val limit = params.getInt(
            "limit"
        )
        LucraClient().queryRecommendedTournaments(
            limit = limit,
            offset = 0,
            includeCompletedTournaments = includeClosed
        ) { result ->
            when (result) {
                is PoolTournament.QueryRecommendedTournamentsResult.Failure -> {
                    rejectRecommendedTournamentsError(promise, result)
                }

                is PoolTournament.QueryRecommendedTournamentsResult.RecommendedTournamentsOutput -> {
                    val writableArray = Arguments.createArray()
                    result.recommendedTournaments.forEach {
                        writableArray.pushMap(
                            LucraMapper.tournamentsMatchupToMap(
                                it
                            )
                        )
                    }
                    promise.resolve(writableArray)
                }
            }
        }
    }

    @ReactMethod
    fun tournamentMatchup(id: String, promise: Promise) {
        LucraClient().retrieveTournament(tournamentId = id) { result ->
            when (result) {
                is PoolTournament.RetrieveTournamentResult.Failure -> {
                    rejectRetrieveTournamentError(promise, result)
                }

                is PoolTournament.RetrieveTournamentResult.RetrieveTournamentOutput -> {
                    promise.resolve(LucraMapper.tournamentsMatchupToMap(result.tournament))
                }

            }
        }
    }

    @ReactMethod
    fun joinTournament(id: String, promise: Promise) {
        LucraClient().joinTournament(tournamentId = id) { result ->
            when (result) {
                is PoolTournament.JoinTournamentResult.Failure -> {
                    rejectJoinTournamentError(promise, result)
                }

                is PoolTournament.JoinTournamentResult.JoinTournamentOutput -> {
                    promise.resolve(null)
                }
            }
        }
    }

    @ReactMethod
    fun logout(promise: Promise?) {
        LucraClient().logout(this.context)
        promise?.resolve(null)
    }

    @ReactMethod
    fun closeFullScreenLucraFlows(promise: Promise?) {
        require(context.currentActivity is FragmentActivity) {
            "Current activity is not a FragmentActivity"
        }
        try {
            LucraClient().closeFullScreenLucraFlows((context.currentActivity as FragmentActivity).supportFragmentManager)
            promise?.resolve(null)
        } catch (e: Exception) {
            promise?.reject(e.toString(), e.toString())
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // intentionally left blank
    }

    @ReactMethod
    fun removeListeners(count: Double) {
        // intentionally left blank
    }

    companion object {
        const val NAME = "LucraClient"
    }
}
