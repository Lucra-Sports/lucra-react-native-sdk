package com.lucrasdk

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.lucrasports.LucraUser
import com.lucrasports.matchup.MatchupType
import com.lucrasports.matchup.SportsMatchupTeam
import com.lucrasports.matchup.SportsMatchupType
import com.lucrasports.matchup.sports_impl.SportsInterval
import com.lucrasports.sdk.core.contest.GYPGame
import com.lucrasports.sdk.core.contest.GamesMatchup
import com.lucrasports.sdk.core.contest.Participant
import com.lucrasports.sdk.core.contest.PoolTournament
import com.lucrasports.sdk.core.contest.Tournament
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

    val df = SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'", Locale.US)

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
        map.putString("avatarUrl", user.avatarUrl)
        map.putInt("loyaltyPoints", user.loyaltyPoints as Int)
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

    fun GYPGameToMap(game: GYPGame): WritableMap {
        val map = Arguments.createMap()
        map.putString("id", game.id)
        map.putString("name", game.name)
        map.putString("description", game.description)
        map.putString("iconUrl", game.iconUrl)
        map.putString("imageUrl", game.imageUrl)
        val categoriesArray = Arguments.createArray()
        game.categoryIds.forEach { category ->
            categoriesArray.pushString(category)
        }
        map.putArray("categoriesIds", categoriesArray)
        return map
    }

    fun gamesMatchupToMap(match: GamesMatchup.RetrieveGamesMatchupResult.GYPMatchupDetailsOutput): WritableMap {
        val map = Arguments.createMap()

        map.putString("gameType", match.gameType)
        map.putString("createdAt", match.createdAt)
        map.putString("ownerId", match.ownerId)
        map.putString("status", match.status)
        map.putString("updatedAt", match.updatedAt)
        map.putDouble("wagerAmount", match.wagerAmount)
        map.putMap("game", GYPGameToMap(match.game))

        val teamArray = Arguments.createArray()
        match.teams.forEach { team ->
            val teamRes = Arguments.createMap()
            teamRes.putString("id", team.id)
            teamRes.putString("outcome", team.outcome)

            val userArr = Arguments.createArray()
            team.users.forEach { user ->
                val userRes = Arguments.createMap()
                userRes.putString("id", user.id)
                userRes.putString("username", user.username)

                userArr.pushMap(userRes)
            }
            teamArray.pushMap(teamRes)
        }

        map.putArray("teams", teamArray)
        return map
    }

    fun tournamentsParticipantToMap(participant: Participant): WritableMap {
        val map = Arguments.createMap()
        map.putString("id", participant.userId)
        map.putString("username", participant.username)
        participant.place?.let { map.putInt("place", it ) }
        participant.rewardValue?.let { map.putDouble("rewardValue", it)}
        return map
    }


    fun tournamentsMatchupToMap(matchup: Tournament): WritableMap {
        val map = Arguments.createMap()
        map.putString("id", matchup.tournamentId)
        map.putString("title", matchup.title)
        map.putString("type", matchup.type)
        map.putDouble("buyInAmount", matchup.buyInAmount)
//        map.putString("createdAt", matchup.createdAt)
//        map.putString("updatedAt", matchup.updatedAt)
        map.putString("expiresAt", matchup.expiresAt.toString())
        map.putString("description", matchup.description)

        val participants = Arguments.createArray()
        matchup.participants.forEach {
            participants.pushMap(tournamentsParticipantToMap(it))
        }
        map.putArray("participants", participants)

        map.putString("status", matchup.status)
        map.putDouble("fee", matchup.fee)
        map.putDouble("pot", matchup.poolTotalAmount)

        return map
    }
}
