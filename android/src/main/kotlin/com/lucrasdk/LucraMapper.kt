package com.lucrasdk

import com.lucrasports.LucraUser
import com.lucrasports.matchup.MatchupType
import com.lucrasports.matchup.SportsMatchupTeam
import com.lucrasports.matchup.SportsMatchupType
import com.lucrasports.matchup.sports_impl.SportsInterval
import com.lucrasports.sports_contests.LucraLeague
import com.lucrasports.sports_contests.LucraMetric
import com.lucrasports.sports_contests.LucraPlayer
import com.lucrasports.sports_contests.LucraPlayerStat
import com.lucrasports.sports_contests.LucraSchedule
import com.lucrasports.sports_contests.LucraSport
import com.lucrasports.sports_contests.LucraTeam


object LucraMapper {

  fun sportIntervalsToMap(interval: SportsInterval): Map<String, Any> {
    val map = mutableMapOf<String, Any>()
    map["interval"] = interval.interval
    map["displayName"] = interval.displayName
    return map
  }

  fun sportToMap(sport: LucraSport): Map<String, Any> {
    val map = mutableMapOf<String, Any>()
    map["id"] = sport.id
    map["name"] = sport.name
    map["iconUrl"] = sport.iconUrl
    map["priority"] = sport.priority
    map["leagues"] = sport.leagues
    map["intervals"] = sport.intervals.map(::sportIntervalsToMap) as Any
    return map
  }

  fun leagueToMap(league: LucraLeague?): Map<String, Any>? {
    if (league == null) {
      return null
    }

    val map = mutableMapOf<String, Any>()
    map["id"] = league.id
    map["name"] = league.name
    map["logoUrl"] = league.logoUrl
    map["priority"] = league.priority
    map["schedules"] = league.schedules?.map(::scheduleToMap) as Any
    return map
  }

  fun playerStatToMap(stat: LucraPlayerStat?): Map<String, Any>? {
    if (stat == null) {
      return null
    }

    val map = mutableMapOf<String, Any>()
    map["metricId"] = stat.metricId
    map["value"] = stat.value as Any
    return map
  }

  fun playerToMap(player: LucraPlayer): Map<String, Any> {
    val map = mutableMapOf<String, Any>()
    map["id"] = player.id
    map["firstName"] = player.firstName
    map["lastName"] = player.lastName
    map["headhostUrl"] = player.headshotUrl as Any
    map["lucraPosition"] = player.lucraPosition
    map["position"] = player.position
    map["positionAbbreviation"] = player.positionAbbreviation
    map["status"] = player.status
    map["isAvailable"] = player.isAvailable
    map["sport"] = sportToMap(player.sport)
    map["positionMetrics"] = player.positionMetrics?.map(::metricToMap) as Any
    map["projectedStats"] = player.projectedStats?.map(::playerStatToMap) as Any
    map["seasonAvgStats"] = player.seasonAvgStats?.map(::playerStatToMap) as Any
    map["liveGameStats"] = player.liveGameStats?.map(::playerStatToMap) as Any
    map["team"] = teamToMap(player.team) as Any
    map["league"] = leagueToMap(player.league) as Any
    map["ranking"] = player.ranking as Any
    map["schedule"] = scheduleToMap(player.schedule) as Any

    return map
  }

  fun teamToMap(team: LucraTeam?): Map<String, Any>? {
    if (team == null) {
      return null
    }

    val map = mutableMapOf<String, Any>()
    map["id"] = team.id
    map["logoUrl"] = team.logoUrl as Any
    map["fullName"] = team.fullName
    map["name"] = team.name
    map["sport"] = sportToMap(team.sport)
    map["abbreviation"] = team.abbreviation
    return map
  }

  fun scheduleToMap(schedule: LucraSchedule?): Map<String, Any>? {
    if (schedule == null) {
      return null
    }

    val map = mutableMapOf<String, Any>()
    map["id"] = schedule.id
    map["date"] = schedule.date
    map["channel"] = schedule.channel as Any
    map["status"] = schedule.status.rawValue
    map["homeTeam"] = teamToMap(schedule.homeTeam) as Any
    map["awayTeam"] = teamToMap(schedule.awayTeam) as Any
    map["players"] = schedule.players?.map(::playerToMap) as Any
    map["venue"] = schedule.venue
    map["roundName"] = schedule.roundName as Any
    map["statusDescription"] = schedule.statusDescription as Any
    map["homeScore"] = schedule.homeScore as Any
    map["awayScore"] = schedule.awayScore as Any
    map["sport"] = schedule.sport
    map["projectionsPending"] = schedule.projectionsPending as Any
    return map
  }

  fun metricToMap(metric: LucraMetric?): Map<String, Any>? {
    if (metric == null) {
      return null
    }

    val map = mutableMapOf<String, Any>()
    map["id"] = metric.id
    map["displayName"] = metric.displayName
    map["pluralDisplayName"] = metric.pluralDisplayName as Any
    map["shortName"] = metric.shortName
    map["maxValue"] = metric.maxValue
    map["active"] = metric.active
    map["comparisonType"] = metric.comparisonType.rawValue

    return map
  }

  fun userToMap(user: LucraUser): Map<String, Any> {
    val map = mutableMapOf<String, Any>()
    map["id"] = user.id
    map["socialConnectionId"] = user.socialConnectionId as Any
    map["username"] = user.username
    map["avatarUrl"] = user.avatar_url as Any
    map["loyaltyPoints"] = user.loyalty_points
    return map
  }

  fun matchupTeamUserToMap(user: MatchupType.MatchupTeamUser): Map<String, Any> {
    val map = mutableMapOf<String, Any>()
    map["id"] = user.user.id
    map["user"] = userToMap(user.user)
    map["wagerPercentage"] = user.wagerPercentage
    return map
  }

  fun sportMatchupTeamToMap(team: SportsMatchupTeam): Map<String, Any> {
    val map = mutableMapOf<String, Any>()
    map["id"] = team.id
    map["users"] = team.users.map(::matchupTeamUserToMap)
    map["outcome"] = team.outcome.toString()
    map["player"] = playerToMap(team.player)
    map["schedule"] = scheduleToMap(team.schedule) as Any
    map["metric"] = metricToMap(team.metric) as Any
    map["metricValue"] = team.metricValue as Any
    map["spread"] = team.spread
    map["wagerAmount"] = team.wagerAmount
    return map
  }

  fun sportsMatchupToMap(matchup: SportsMatchupType): Map<String, Any> {
    val map = mutableMapOf<String, Any>()
    map["id"] = matchup.id
    map["createdAt"] = matchup.createdAt
    map["updatedAt"] = matchup.updatedAt
    map["isPublic"] = matchup.isPublic
    map["status"] = matchup.status.rawValue
    map["teams"] = matchup.sportsMatchupTeams.map(::sportMatchupTeamToMap)
    return map
  }
}
