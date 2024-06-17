package com.lucrasdk

import com.lucrasports.sdk.core.contest.SportsMatchup.RetrieveSportsMatchupResult.SportsMatchupDetailsOutput;

object LucraMapper {
  fun sportsMatchupToMap(output: SportsMatchupDetailsOutput): Map<String, Any> {
    val sportsMatchup = output.sportsMatchup
    return mutableMapOf<String, Any>(
      "id" to sportsMatchup.id,
      "createdAt" to sportsMatchup.createdAt,
      "updatedAt" to sportsMatchup.updatedAt,
      "status" to sportsMatchup.status,
      "teams" to sportsMatchup.sportsMatchupTeams // TODO will need the similar mapping calls as created in ios PR
    )
  }
}
