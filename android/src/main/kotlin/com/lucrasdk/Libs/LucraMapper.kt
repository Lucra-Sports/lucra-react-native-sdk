package com.lucrasdk.Libs

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.lucrasdk.Libs.LucraUtils.Companion.convertReadableMapToStringMap
import com.lucrasdk.Libs.LucraUtils.Companion.convertStringMapToWritableMap
import com.lucrasports.LucraUser
import com.lucrasports.matchup.ParticipantGroupOutcome
import com.lucrasports.matchup.TournamentLeaderboard
import com.lucrasports.matchup.sports_impl.SportsInterval
import com.lucrasports.sdk.core.contest.LucraMatchup
import com.lucrasports.sdk.core.contest.tournament.Participant
import com.lucrasports.sdk.core.contest.tournament.Tournament
import com.lucrasports.sdk.core.convert_credit.LucraConvertToCreditWithdrawMethod
import com.lucrasports.sdk.core.convert_credit.LucraWithdrawCardTheme
import com.lucrasports.sdk.core.reward.LucraReward
import com.lucrasports.sdk.core.reward.toLucraReward
import com.lucrasports.sdk.core.style_guide.ColorStyle
import com.lucrasports.sdk.core.style_guide.Font
import com.lucrasports.sdk.core.style_guide.FontFamily
import com.lucrasports.sdk.core.user.SDKUser
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

    fun readableMapToColorStyle(params: ReadableMap): ColorStyle {
        return ColorStyle(
            params.getString("background"),
            params.getString("surface"),
            params.getString("primary"),
            params.getString("secondary"),
            params.getString("tertiary"),
            params.getString("onBackground"),
            params.getString("onSurface"),
            params.getString("onPrimary"),
            params.getString("onSecondary"),
            params.getString("onTertiary")
        )
    }

    fun readableMapToFontFamily(params: ReadableMap): FontFamily {
        if (!params.hasKey("medium") ||
            !params.hasKey("normal") ||
            !params.hasKey("semibold") ||
            !params.hasKey("bold")
        ) {
            throw Exception(
                "LucraSDK all keys are required when setting a font: medium, normal, semibold and bold"
            )
        }

        return FontFamily(
            Font(params.getString("medium")!!),
            Font(params.getString("normal")!!),
            Font(params.getString("semibold")!!),
            Font(params.getString("bold")!!)
        )
    }

    fun sdkUserToMap(user: SDKUser): WritableMap {
        val addressMap = Arguments.createMap()

        // Will assume all is null if address is null to keep an empty map like ios
        if (user.address != null) {
            addressMap.putString("address", user.address)
            addressMap.putString("addressCont", user.addressCont)
            addressMap.putString("city", user.city)
            addressMap.putString("state", user.state)
            addressMap.putString("zip", user.zip)
        }

        val userMap = Arguments.createMap()
        userMap.putString("id", user.userId)
        userMap.putString("username", user.username)
        userMap.putString("avatarURL", user.avatarUrl)
        userMap.putString("phoneNumber", user.phoneNumber)
        userMap.putString("email", user.email)
        userMap.putString("firstName", user.firstName)
        userMap.putString("lastName", user.lastName)
        userMap.putMap("address", addressMap)
        userMap.putDouble("balance", user.balance ?: 0.0)
        userMap.putString("accountStatus", user.accountStatus)

        val resultMap = Arguments.createMap()
        resultMap.putMap("user", userMap)

        return resultMap
    }


    fun rewardToMap(reward: LucraReward): WritableMap {
        val map = Arguments.createMap()
        map.putString("rewardId", reward.rewardId)
        map.putString("title", reward.title)
        map.putString("descriptor", reward.descriptor)
        map.putString("iconUrl", reward.iconUrl)
        map.putString("bannerIconUrl", reward.bannerIconUrl)
        map.putString("disclaimer", reward.disclaimer)
        map.putMap("metadata", convertStringMapToWritableMap(reward.metadata))
        return map
    }

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
        sport.leagues.map(LucraMapper::leagueToMap).forEach { leagues.pushMap(it) }
        sport.intervals.map(LucraMapper::sportIntervalsToMap).forEach { intervals.pushMap(it) }
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
        league.schedules?.map(LucraMapper::scheduleToMap)?.forEach { schedules.pushMap(it) }

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
        player.positionMetrics?.map(LucraMapper::metricToMap)
            ?.forEach { positionMetrics.pushMap(it) }
        val projectedStats = Arguments.createArray()
        player.projectedStats?.map(LucraMapper::playerStatToMap)
            ?.forEach { projectedStats.pushMap(it) }
        val seasonAvgStats = Arguments.createArray()
        player.seasonAvgStats?.map(LucraMapper::playerStatToMap)
            ?.forEach { seasonAvgStats.pushMap(it) }
        val liveGameStats = Arguments.createArray()
        player.liveGameStats?.map(LucraMapper::playerStatToMap)
            ?.forEach { liveGameStats.pushMap(it) }

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
        schedule.players?.map(LucraMapper::playerToMap)?.forEach { players.pushMap(it) }

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
        map.putInt("loyaltyPoints", user.loyaltyPoints as? Int ?: 0)
        return map
    }

    fun lucraMatchupToMap(match: LucraMatchup): WritableMap {
        val map = Arguments.createMap()
        map.putString("id", match.id)
        map.putString("updatedAt", match.updatedAt)
        map.putString("createdAt", match.createdAt)
        map.putString("creatorId", match.creatorId)
        map.putString("status", match.status.rawValue)
        map.putString("subtype", match.subtype.name)
        map.putString("type", match.type.name)
        map.putBoolean("isPublic", match.isPublic)

        match.creator?.let { map.putMap("creator", userToMap(it)) }

        val groupsArray = Arguments.createArray()
        match.participantGroups.forEach { group ->
            val groupMap = Arguments.createMap()
            groupMap.putString("id", group.id)
            groupMap.putString("createdAt", group.createdAt)
            groupMap.putString(
                "outcome", when (group.outcome) {
                    ParticipantGroupOutcome.Loss -> "LOSS"
                    ParticipantGroupOutcome.Tie -> "TIE"
                    ParticipantGroupOutcome.Win -> "WIN"
                    else -> "UNKNOWN"
                }
            )

            val participantsArray = Arguments.createArray()
            group.participants.forEach { participant ->
                val participantMap = Arguments.createMap()
                participantMap.putDouble("wager", participant.wager ?: 0.0)
                participantMap.putMap("user", userToMap(participant.user))

                participant.tenantReward?.toLucraReward()?.let {
                    participantMap.putMap("reward", rewardToMap(it))
                }

                participant.tournamentLeaderboard?.let {
                    participantMap.putMap("tournamentLeaderboard", tournamentLeaderboardToMap(it))
                }

                participantsArray.pushMap(participantMap)
            }

            groupMap.putArray("participants", participantsArray)

            group.professionalPlayerStatDetails?.let { playerStats ->
                groupMap.putMap("professionalPlayerStatDetails", Arguments.createMap().apply {
                    putMap("metric", metricToMap(playerStats.metric))
                    putDouble("metricValue", playerStats.metricValue)
                    putDouble("spread", playerStats.spread)
                    putMap("player", playerToMap(playerStats.player))
                    putMap("schedule", scheduleToMap(playerStats.schedule))
                })
            }

            group.professionalTeamStatDetails?.let { teamStats ->
                groupMap.putMap(
                    "professionalTeamStatDetails",
                    Arguments.createMap().apply {
                        putMap("metric", metricToMap(teamStats.metric))
                        putDouble("metricValue", teamStats.metricValue)
                        putDouble("spread", teamStats.spread)
                        putMap("team", teamToMap(teamStats.team))
                        putMap("schedule", scheduleToMap(teamStats.schedule))
                    })
            }

            group.recreationalGameStatDetails?.let {
                groupMap.putMap("recreationalGameStatDetails", Arguments.createMap().apply {
                    putString("score", it.score)
                    putString("teamName", it.teamName)
                    it.handicap?.let { h -> putInt("handicap", h) }
                })
            }

            groupsArray.pushMap(groupMap)
        }

        map.putArray("participantGroups", groupsArray)

        match.winningGroup?.let {
            map.putString("winningGroupId", it.id)
        }

        match.recreationGameExtension?.let { ext ->
            val extMap = Arguments.createMap()
            extMap.putString("gameId", ext.gameId)
            extMap.putInt("buyInAmount", ext.buyInAmount.toInt())

            ext.game?.let { game ->
                val gameMap = Arguments.createMap()
                gameMap.putString("id", game.id)
                gameMap.putString("name", game.name)
                game.description?.let { gameMap.putString("description", it) }
                game.iconUrl?.let { gameMap.putString("iconUrl", it) }
                game.imageUrl?.let { gameMap.putString("imageUrl", it) }
                game.imageBgUrl?.let { gameMap.putString("imageBgUrl", it) }

                val categoriesArray = Arguments.createArray()
                game.categoryIds.forEach { categoriesArray.pushString(it) }
                gameMap.putArray("categoryIds", categoriesArray)
                extMap.putMap("game", gameMap)
            }

            map.putMap("recreationGameExtension", extMap)
        }

        return map
    }

    fun tournamentLeaderboardToMap(leaderboard: TournamentLeaderboard): WritableMap {
        return Arguments.createMap().apply {
            leaderboard.title?.let { putString("title", it) }
            leaderboard.userScore?.let { putString("userScore", it) }
            leaderboard.place?.let { putInt("place", it) }
            leaderboard.placeOverride?.let { putInt("placeOverride", it) }
            putBoolean("isTieResult", leaderboard.isTieResult)
            leaderboard.rewardValue?.let { putDouble("rewardValue", it) }
            leaderboard.rewardTierValue?.let { putDouble("rewardTierValue", it) }
            leaderboard.participantGroupId?.let { putString("participantGroupId", it) }
            leaderboard.username?.let { putString("username", it) }
        }
    }

    fun tournamentsParticipantToMap(participant: Participant): WritableMap {
        val map = Arguments.createMap()
        map.putString("id", participant.id)
        map.putString("username", participant.username)
        participant.place?.let { map.putInt("place", it) }
        participant.rewardValue?.let { map.putDouble("rewardValue", it) }
        return map
    }


    fun tournamentsMatchupToMap(matchup: Tournament): WritableMap {
        val map = Arguments.createMap()
        map.putString("id", matchup.id)
        map.putString("title", matchup.title)
        map.putString("type", matchup.type)
        map.putDouble("fee", matchup.fee)
        map.putDouble("buyInAmount", matchup.buyInAmount)
        matchup.description?.let { map.putString("description", it) }
        val participants = Arguments.createArray()
        matchup.participants.forEach {
            participants.pushMap(tournamentsParticipantToMap(it))
        }
        map.putArray("participants", participants)
        map.putString("status", matchup.status)
        matchup.metadata?.let { map.putString("metadata", it) }
        matchup.iconUrl?.let { map.putString("iconUrl", it) }
        matchup.expiresAt?.let { map.putString("expiresAt", it.toString()) }
        map.putDouble("potTotal", matchup.potTotal)
        map.putDouble("potNetAmount", matchup.potNetAmount)

        return map
    }

    fun writableNativeMapToLucraReward(map: WritableNativeMap): LucraReward {
        return LucraReward(
            rewardId = map.getString("rewardId")!!,
            title = map.getString("title")!!,
            descriptor = map.getString("descriptor")!!,
            iconUrl = map.getString("iconUrl")!!,
            bannerIconUrl = map.getString("bannerIconUrl")!!,
            disclaimer = map.getString("disclaimer")!!,
            metadata = convertReadableMapToStringMap(map.getMap("metadata"))
        )
    }

    fun writableNativeMapToLucraConvertToCreditWithdrawMethod(
        map: ReadableMap,
        cashAmount: Double
    ): LucraConvertToCreditWithdrawMethod {
        return LucraConvertToCreditWithdrawMethod(
            id = map.getString("id")!!,
            title = map.getString("title")!!,
            conversionTerms =
                map.getString("conversionTerms")!!,
            amount = cashAmount,
            convertedAmount = map.getDouble("convertedAmount"),
            iconUrl = map.getString("iconUrl"),
            convertedAmountDisplay =
                map.getString("convertedAmountDisplay")!!,
            shortDescription =
                map.getString("shortDescription")!!,
            longDescription =
                map.getString("longDescription")!!,
            metaData =
                map.getMap("metaData")?.let {
                    convertReadableMapToStringMap(it)
                },
            theme =
                LucraWithdrawCardTheme(
                    cardColor =
                        map.getString(
                            "cardColor"
                        )!!,
                    cardTextColor =
                        map.getString(
                            "cardTextColor"
                        )!!,
                    pillColor =
                        map.getString(
                            "pillColor"
                        )!!,
                    pillTextColor =
                        map.getString(
                            "pillTextColor"
                        )!!,
                )
        )
    }
}
