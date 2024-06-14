package com.lucrasdk

import com.lucrasports.sdk.core.contest.SportsMatchup.RetrieveSportsMatchupResult.SportsMatchupDetailsOutput;

object LucraMapper {
  fun sportsMatchupToMap(matchup: SportsMatchupDetailsOutput): Map<String, Any> {
    val map = mutableMapOf<String, Any>()
//    map["id"] = matchup.id
    return map
  }
}
