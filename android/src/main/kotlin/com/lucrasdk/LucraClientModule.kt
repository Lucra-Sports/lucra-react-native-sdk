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
import com.lucrasports.sdk.core.contest.APIError
import com.lucrasports.sdk.core.contest.GameInteractions
import com.lucrasports.sdk.core.contest.LocationError
import com.lucrasports.sdk.core.contest.LucraError
import com.lucrasports.sdk.core.contest.UserStateError
import com.lucrasports.sdk.core.contest.recreational.RecreationalGameInteractions
import com.lucrasports.sdk.core.contest.tournament.PoolTournament
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
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.channels.Channel

@ReactModule(name = LucraClientModule.NAME)
class LucraClientModule(private val context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

    private var fullAppFlowDialogFragment: DialogFragment? = null

    // FIFO queue to store deep links since many can be requested at once,
    // need a way to emit as they come in
    private val deepLinkQueue =
        Channel<String>(
            capacity = Channel.UNLIMITED,
            onBufferOverflow = BufferOverflow.DROP_LATEST
        )

    private val creditConversionQueue =
        Channel<ReadableMap>(
            capacity = Channel.UNLIMITED,
            onBufferOverflow = BufferOverflow.DROP_LATEST
        )

    private val availableRewardsQueue =
        Channel<ReadableArray>(
            capacity = Channel.UNLIMITED,
            onBufferOverflow = BufferOverflow.DROP_LATEST
        )

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
                val transformedLinkFromReact = deepLinkQueue.receive()
                return@setDeeplinkTransformer transformedLinkFromReact
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
                                        "gamesMatchupCanceled",
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
                                        "sportsMatchupCanceled",
                                        Arguments.makeNativeMap(
                                            bundleOf(
                                                "id" to
                                                        event.matchupId
                                            )
                                        )
                                    )

                                is LucraEvent.GamesContest.Started ->
                                    sendEvent(
                                        context,
                                        "gamesMatchupStarted",
                                        Arguments.makeNativeMap(
                                            bundleOf("id" to event.matchupId)
                                        )
                                    )

                                is LucraEvent.Tournament.Joined ->
                                    sendEvent(
                                        context,
                                        "tournamentJoined",
                                        Arguments.makeNativeMap(
                                            bundleOf("id" to event.tournamentId)
                                        )
                                    )

                                is LucraEvent.GamesContest.StartedActive ->
                                    sendEvent(
                                        context,
                                        "gamesActiveMatchupStarted",
                                        Arguments.makeNativeMap(
                                            bundleOf("id" to event.matchupId)
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

    @ReactMethod
    fun createRecreationalGame(
        gameTypeId: String,
        atStake: ReadableMap,
        playStyle: String,
        promise: Promise
    ) {
        val parsedAtStake = try {
            when (atStake.getString("type")?.lowercase()) {
                "cash" -> RecreationalGameInteractions.RewardType.Cash(atStake.getDouble("amount"))
                "tenantreward" -> RecreationalGameInteractions.RewardType.TenantReward(
                    rewardId = atStake.getString("rewardId") ?: "",
                    title = atStake.getString("title") ?: "",
                    descriptor = atStake.getString("descriptor") ?: "",
                    iconUrl = atStake.getString("iconUrl") ?: "",
                    bannerIconUrl = atStake.getString("bannerIconUrl"),
                    disclaimer = atStake.getString("disclaimer"),
                    metadata = atStake.getMap("metadata")?.toHashMap()
                        ?.mapValues { it.value.toString() }
                )

                else -> {
                    promise.reject(
                        "invalidRewardType",
                        "Invalid RewardType: ${atStake.getString("type")}"
                    )
                    return
                }
            }
        } catch (e: Exception) {
            promise.reject("invalidAtStake", "Failed to parse atStake: ${e.message}")
            return
        }

        val parsedPlayStyle = when (playStyle.lowercase()) {
            "groupvsgroup" -> RecreationalGameInteractions.PlayStyle.GroupVsGroup
            "freeforall" -> RecreationalGameInteractions.PlayStyle.FreeForAll
            else -> {
                promise.reject("invalidPlayStyle", "Invalid PlayStyle: $playStyle")
                return
            }
        }

        LucraClient().createRecreationalGame(gameTypeId, parsedAtStake, parsedPlayStyle) {
            when (it) {
                is RecreationalGameInteractions.CreateGamesMatchupResult.Failure -> rejectLucraError(
                    promise,
                    it.failure
                )

                is RecreationalGameInteractions.CreateGamesMatchupResult.Success -> {
                    val map = Arguments.createMap()
                    map.putString("matchupId", it.matchupId)
                    promise.resolve(map)
                }
            }
        }
    }

    @ReactMethod
    fun acceptVersusRecreationalGame(matchupId: String, teamId: String, promise: Promise) {
        LucraClient().acceptVersusRecreationalGame(matchupId, teamId) {
            when (it) {
                is RecreationalGameInteractions.AcceptRecreationalGameResult.Failure -> rejectLucraError(
                    promise,
                    it.failure
                )

                is RecreationalGameInteractions.AcceptRecreationalGameResult.Success -> promise.resolve(
                    null
                )
            }
        }
    }

    @ReactMethod
    fun acceptFreeForAllRecreationalGame(matchupId: String, promise: Promise) {
        LucraClient().acceptFreeForAllRecreationalGame(matchupId) {
            when (it) {
                is RecreationalGameInteractions.AcceptRecreationalGameResult.Failure -> rejectLucraError(
                    promise,
                    it.failure
                )

                is RecreationalGameInteractions.AcceptRecreationalGameResult.Success -> promise.resolve(
                    null
                )
            }
        }
    }

    @ReactMethod
    fun cancelGamesMatchup(matchupId: String, promise: Promise) {
        LucraClient().cancelRecreationalGame(matchupId) {
            when (it) {
                is RecreationalGameInteractions.CancelGamesMatchupResult.Failure -> rejectLucraError(
                    promise,
                    it.failure
                )

                is RecreationalGameInteractions.CancelGamesMatchupResult.Success -> promise.resolve(
                    null
                )
            }
        }
    }

    @ReactMethod
    fun getMatchup(matchupId: String, promise: Promise) {
        LucraClient().getMatchup(matchupId) { result ->
            when (result) {
                is GameInteractions.GetMatchupResult.Failure -> {
                    val errorMessage = when (result.failure) {
                        is GameInteractions.FailedRetrieveMatchup.APIError -> "apiError"
                        is GameInteractions.FailedRetrieveMatchup.LocationError -> "locationError"
                    }
                    promise.reject("getMatchupFailure", errorMessage)
                }

                is GameInteractions.GetMatchupResult.Success -> {
                    val res = LucraMapper.lucraMatchupToMap(result.matchup)
                    promise.resolve(res)
                }
            }
        }
    }

    private fun rejectLucraError(promise: Promise, error: LucraError) {
        val code = when (error) {
            is APIError -> "apiError"
            is LocationError -> "locationError"
            UserStateError.InsufficientFunds -> "insufficientFunds"
            UserStateError.NotAllowed -> "notAllowed"
            UserStateError.NotInitialized -> "notInitialized"
            UserStateError.Unverified -> "unverified"
            else -> "unknownError"
        }
        promise.reject(code, error.toString())
    }

    @ReactMethod
    fun emitDeepLink(link: String) {
        // Check null because React can't guarantee non null
        link.takeIf { !it.isNullOrEmpty() }?.let {
            deepLinkQueue.trySend(it)
        }
    }

    @ReactMethod
    fun emitAvailableRewards(args: ReadableArray) {
        args.takeIf { it != null }?.let {
            availableRewardsQueue.trySend(it)
        }
    }

    @ReactMethod
    fun emitCreditConversion(args: ReadableMap) {
        args.takeIf { it != null }?.let {
            creditConversionQueue.trySend(it)
        }
    }

    @ReactMethod
    fun registerRewardProvider() {
        LucraClient()
            .setRewardProvider(
                object : LucraRewardProvider {
                    override suspend fun availableRewards(): List<LucraReward> {
                        sendEvent(context, "_availableRewards", null)
                        val rewards = availableRewardsQueue.receive()
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
                        val responseMap = creditConversionQueue.receive()
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
                // TODO: metadata map?
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

                is PoolTournament.JoinTournamentResult.Success -> {
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
