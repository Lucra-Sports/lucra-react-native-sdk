package com.lucrasdk.Libs

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.lucrasports.sdk.core.LucraClient
import com.lucrasports.sdk.core.ui.LucraUiProvider

class LucraUtils {

    companion object {
        fun getLucraEnvironment(environment: String): LucraClient.Companion.Environment {
            return when (environment) {
                "production" -> LucraClient.Companion.Environment.PRODUCTION
                "staging" -> LucraClient.Companion.Environment.STAGING
                "develop" -> LucraClient.Companion.Environment.DEVELOPMENT
                "sandbox" -> LucraClient.Companion.Environment.SANDBOX
                else -> throw IllegalArgumentException("Invalid environment: $environment")
            }
        }

        fun getLucraFlow(
            flow: String,
            matchupId: String?,
            teaminviteId: String?,
            gameTypeId: String?
        ): LucraUiProvider.LucraFlow {
            return when (flow) {
                // TODO ios uses onboarding, Android uses Login
                "onboarding" -> LucraUiProvider.LucraFlow.Login
                "login" -> LucraUiProvider.LucraFlow.Login
                "profile" -> LucraUiProvider.LucraFlow.Profile
                "addFunds" -> LucraUiProvider.LucraFlow.AddFunds
                "verifyIdentity" -> LucraUiProvider.LucraFlow.VerifyIdentity
                "createGamesMatchup" -> {
                    if (gameTypeId != null) {
                        return LucraUiProvider.LucraFlow.CreateGamesMatchupById(gameTypeId)
                    } else {
                        return LucraUiProvider.LucraFlow.CreateGamesMatchup()
                    }
                }

                "createSportsMatchup" -> LucraUiProvider.LucraFlow.CreateSportsMatchup
                "withdrawFunds" -> LucraUiProvider.LucraFlow.WithdrawFunds
                "publicFeed" -> LucraUiProvider.LucraFlow.PublicFeed
                "myMatchup" -> LucraUiProvider.LucraFlow.MyMatchup
                "gamesMatchupDetails" -> LucraUiProvider.LucraFlow.GamesMatchupDetails(matchupId!!)
                "matchupDetails" -> LucraUiProvider.LucraFlow.MatchupDetails(matchupId!!)
                "demographicCollection" -> LucraUiProvider.LucraFlow.DemographicForm
                // TODO not yet publicly available within Android SDK
//        "sportsContestDetails" -> LucraUiProvider.LucraFlow.SportsContestDetails
                else -> throw IllegalArgumentException("Invalid flow: $flow")
            }
        }

        fun convertReadableMapToStringMap(readableMap: ReadableMap?): Map<String, String> {
            if (readableMap == null) {
                return emptyMap()
            }

            val map = mutableMapOf<String, String>()
            val iterator = readableMap.keySetIterator()
            while (iterator.hasNextKey()) {
                val key = iterator.nextKey()
                val value = readableMap.getString(key)
                if (value != null) {
                    map[key] = value
                }
            }
            return map
        }

        fun convertStringMapToWritableMap(map: Map<String, String>?): WritableMap {
            val writableMap = Arguments.createMap()
            if (map == null) {
                return writableMap
            }
            for ((key, value) in map) {
                writableMap.putString(key, value)
            }
            return writableMap
        }
    }
}
