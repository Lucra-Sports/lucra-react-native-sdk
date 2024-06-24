package com.lucrasdk

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

    fun getLucraFlow(flow: String): LucraUiProvider.LucraFlow {
      return when (flow) {
        // TODO ios uses onboarding, Android uses Login
        "onboarding" -> LucraUiProvider.LucraFlow.Login
        "login" -> LucraUiProvider.LucraFlow.Login
        "profile" -> LucraUiProvider.LucraFlow.Profile
        "addFunds" -> LucraUiProvider.LucraFlow.AddFunds
        "verifyIdentity" -> LucraUiProvider.LucraFlow.VerifyIdentity
        "createGamesMatchup" -> LucraUiProvider.LucraFlow.CreateGamesMatchup
        "createSportsMatchup" -> LucraUiProvider.LucraFlow.CreateSportsMatchup
        "withdrawFunds" -> LucraUiProvider.LucraFlow.WithdrawFunds
        "publicFeed" -> LucraUiProvider.LucraFlow.PublicFeed
        "myMatchup" -> LucraUiProvider.LucraFlow.MyMatchup
        else -> throw IllegalArgumentException("Invalid flow: $flow")
      }
    }
  }
}
