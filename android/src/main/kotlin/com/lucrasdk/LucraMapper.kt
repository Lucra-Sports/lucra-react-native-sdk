package com.lucrasdk

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
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
import java.text.SimpleDateFormat
import java.util.Locale

object LucraMapper {

    val df = SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'", Locale.US);

    fun sportIntervalsToMap(interval: SportsInterval): WritableMap {

        val map = Arguments.createMap()
        map.putInt("interval", interval.interval)
        map.putString("displayName", interval.displayName)
        return map
    }

    fun sportToMap(sport: LucraSport): WritableMap {
        val map = Arguments.createMap()
        val leagues = Arguments.createArray()
        val intervals = Arguments.createArray()
        sport.leagues.map(::leagueToMap).forEach { leagues.pushMap(it) }
        sport.intervals.map(::sportIntervalsToMap).forEach { intervals.pushMap(it) }
        map.putString("id", sport.id)
        map.putString("name", sport.name)
        map.putString("iconUrl", sport.iconUrl)
        map.putInt("priority", sport.priority)
        map.putArray("leagues", leagues)
        map.putArray("intervals", intervals)
        return map
    }

    fun leagueToMap(league: LucraLeague?): WritableMap? {
        if (league == null) {
            return null
        }
        val schedules = Arguments.createArray()
        league.schedules?.map(::scheduleToMap)?.forEach { schedules.pushMap(it) }

        val map = Arguments.createMap()
        map.putString("id", league.id)
        map.putString("name", league.name)
        map.putString("logoUrl", league.logoUrl)
        map.putInt("priority", league.priority)
        map.putArray("schedules", schedules)
        return map
    }

    fun playerStatToMap(stat: LucraPlayerStat?): WritableMap? {
        if (stat == null) {
            return null
        }

        val map = Arguments.createMap()
        map.putString("metricId", stat.metricId)
        map.putString("value", stat.value.toString())
        return map
    }

    fun playerToMap(player: LucraPlayer): WritableMap {
        val map = Arguments.createMap()
        val positionMetrics = Arguments.createArray()
        player.positionMetrics?.map(::metricToMap)?.forEach { positionMetrics.pushMap(it) }
        val projectedStats = Arguments.createArray()
        player.projectedStats?.map(::playerStatToMap)?.forEach { projectedStats.pushMap(it) }
        val seasonAvgStats = Arguments.createArray()
        player.seasonAvgStats?.map(::playerStatToMap)?.forEach { seasonAvgStats.pushMap(it) }
        val liveGameStats = Arguments.createArray()
        player.liveGameStats?.map(::playerStatToMap)?.forEach { liveGameStats.pushMap(it) }

        map.putString("id", player.id.toString())
        map.putString("firstName", player.firstName)
        map.putString("lastName", player.lastName)
        map.putString("headshotUrl", player.headshotUrl)
        map.putString("lucraPosition", player.lucraPosition)
        map.putString("position", player.position)
        map.putString("positionAbbreviation", player.positionAbbreviation)
        map.putString("status", player.status)
        map.putBoolean("isAvailable", player.isAvailable)
        map.putMap("sport", sportToMap(player.sport))
        map.putArray("positionMetrics", positionMetrics)
        map.putArray("projectedStats", projectedStats)
        map.putArray("seasonAvgStats", seasonAvgStats)
        map.putArray("liveGameStats", liveGameStats)
        map.putMap("team", teamToMap(player.team))
        map.putMap("league", leagueToMap(player.league))
        player.ranking?.let { map.putInt("ranking", it) } ?: map.putNull("ranking")
        map.putMap("schedule", scheduleToMap(player.schedule))

        return map
    }

    fun teamToMap(team: LucraTeam?): WritableMap? {
        if (team == null) {
            return null
        }

        val map = Arguments.createMap()
        map.putString("id", team.id)
        map.putString("logoUrl", team.logoUrl)
        map.putString("fullName", team.fullName)
        map.putString("name", team.name)
        map.putMap("sport", sportToMap(team.sport))
        map.putString("abbreviation", team.abbreviation)
        return map
    }

    fun scheduleToMap(schedule: LucraSchedule?): WritableMap? {
        if (schedule == null) {
            return null
        }

        val players = Arguments.createArray()
        schedule.players?.map(::playerToMap)?.forEach { players.pushMap(it) }


        val map = Arguments.createMap()
        map.putString("id", schedule.id)
        map.putString("date", df.format(schedule.date))
        map.putString("channel", schedule.channel)
        map.putString("status", schedule.status.rawValue)
        map.putMap("homeTeam", teamToMap(schedule.homeTeam))
        map.putMap("awayTeam", teamToMap(schedule.awayTeam))
        map.putArray("players", players)
        map.putString("venue", schedule.venue)
        map.putString("roundName", schedule.roundName)
        map.putString("statusDescription", schedule.statusDescription)
        map.putString("homeScore", schedule.homeScore)
        map.putString("awayScore", schedule.awayScore)
        map.putMap("sport", sportToMap(schedule.sport))
        schedule.projectionsPending?.let { map.putBoolean("projectionsPending", it) }
            ?: map.putNull("projectionsPending")
        return map
    }

    fun metricToMap(metric: LucraMetric?): WritableMap? {
        if (metric == null) {
            return null
        }

        val map = Arguments.createMap()
        map.putString("id", metric.id)
        map.putString("displayName", metric.displayName)
        map.putString("pluralDisplayName", metric.pluralDisplayName)
        map.putString("shortName", metric.shortName)
        map.putDouble("maxValue", metric.maxValue)
        map.putBoolean("active", metric.active)
        map.putString("comparisonType", metric.comparisonType.rawValue)

        return map
    }

    fun userToMap(user: LucraUser): WritableMap {
        val map = Arguments.createMap()
        map.putString("id", user.idString)
        map.putString("socialConnectionId", user.socialConnectionId)
        map.putString("username", user.username)
        map.putString("avatarUrl", user.avatar_url)
        map.putInt("loyaltyPoints", user.loyalty_points as Int)
        return map
    }

    fun matchupTeamUserToMap(user: MatchupType.MatchupTeamUser): WritableMap {
        val map = Arguments.createMap()
        map.putString("id", user.user.idString)
        map.putMap("user", userToMap(user.user))
        map.putDouble("wagerPercentage", user.wagerPercentage)
        return map
    }

    fun sportMatchupTeamToMap(team: SportsMatchupTeam): WritableMap {
        val map = Arguments.createMap()
        val usersArray = Arguments.createArray()
        team.users.map(::matchupTeamUserToMap).forEach { usersArray.pushMap(it) }

        map.putString("id", team.id)
        map.putArray("users", usersArray)
        map.putString("outcome", team.outcome.toString())
        map.putMap("player", playerToMap(team.player))
        map.putMap("schedule", scheduleToMap(team.schedule))
        map.putMap("metric", metricToMap(team.metric))
        team.metricValue?.let { map.putDouble("metricValue", it) } ?: map.putNull("metricValue")
        map.putDouble("spread", team.spread)
        map.putDouble("wagerAmount", team.wagerAmount)
        return map
    }

    fun sportsMatchupToMap(matchup: SportsMatchupType): WritableMap {
        val map = Arguments.createMap()

        val teamsArray = Arguments.createArray()
        matchup.sportsMatchupTeams.map(::sportMatchupTeamToMap).forEach { teamsArray.pushMap(it) }

        map.putString("id", matchup.id)
        map.putString("createdAt", matchup.createdAt)
        map.putString("updatedAt", matchup.updatedAt)
        map.putBoolean("isPublic", matchup.isPublic)
        map.putString("status", matchup.status.rawValue)
        map.putArray("teams", teamsArray)
        return map
    }
}
