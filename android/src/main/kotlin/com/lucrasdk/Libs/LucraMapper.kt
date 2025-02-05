package com.lucrasdk.Libs

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.lucrasdk.Libs.LucraUtils.Companion.convertReadableMapToStringMap
import com.lucrasdk.Libs.LucraUtils.Companion.convertStringMapToWritableMap
import com.lucrasports.LucraUser
import com.lucrasports.matchup.ParticipantGroup
import com.lucrasports.matchup.ParticipantGroupOutcome
import com.lucrasports.matchup.TopLevelMatchupType
import com.lucrasports.matchup.sports_impl.SportsInterval
import com.lucrasports.sdk.core.contest.GYPGame
import com.lucrasports.sdk.core.contest.GamesMatchup
import com.lucrasports.sdk.core.contest.Participant
import com.lucrasports.sdk.core.contest.Tournament
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
        val userMap = Arguments.createMap()
        userMap.putString("username", user.username)
        userMap.putString("email", user.email)
        userMap.putString("firstName", user.firstName)
        userMap.putString("lastName", user.lastName)
        userMap.putString("phoneNumber", user.phoneNumber)

        val address = Arguments.createMap()
        address.putString("address", user.address)
        address.putString("addressCont", user.addressCont)
        address.putString("city", user.city)
        address.putString("state", user.state)
        address.putString("zip", user.zip)

        userMap.putMap("address", address)

        return userMap
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

    fun topLevelMatchupToMap(matchup: TopLevelMatchupType): WritableMap {
        val map = Arguments.createMap()
        map.putString("id", matchup.id)
        map.putString("status", matchup.status.rawValue)
        map.putString("subType", matchup.subtype.name)
        map.putArray(
            "participantGroups", participantGroupsToArray(matchup)
        )
        return map
    }

    private fun participantGroupsToArray(matchup: TopLevelMatchupType) =
        Arguments.createArray().apply {
            matchup.participantGroups.forEach { group ->
                pushMap(
                    participantGroupToMap(group)
                )
            }
        }

    private fun participantGroupToMap(group: ParticipantGroup) = Arguments.createMap().apply {
        putString("id", group.id)
        putString(
            "outcome", when (group.outcome) {
                ParticipantGroupOutcome.Loss -> "LOSS"
                ParticipantGroupOutcome.Tie -> "TIE"
                ParticipantGroupOutcome.Unknown -> "UNKNOWN"
                ParticipantGroupOutcome.Win -> "WIN"
                null -> ""
            }
        )
        group.professionalTeamStatDetails?.let { teamStats ->
            putMap("professionalTeamStateDetails", Arguments.createMap().apply {
                putMap("metric", metricToMap(teamStats.metric))
                putDouble("metricValue", teamStats.metricValue)
                putDouble("spread", teamStats.spread)
                putMap("team", teamToMap(teamStats.team))
                putMap("schedule", scheduleToMap(teamStats.schedule))
            })
        }
        group.professionalPlayerStatDetails?.let { playerStats ->
            putMap("professionalPlayerStatDetails", Arguments.createMap().apply {
                putMap("metric", metricToMap(playerStats.metric))
                putDouble("metricValue", playerStats.metricValue)
                putDouble("spread", playerStats.spread)
                putMap("player", playerToMap(playerStats.player))
                putMap("schedule", scheduleToMap(playerStats.schedule))
            })
        }
        putArray(
            "participants",
            participantsToArray(group)
        )
    }


    private fun participantsToArray(group: ParticipantGroup) = Arguments.createArray().apply {
        group.participants.forEach { participant ->
            pushMap(Arguments.createMap().apply {
                putMap("user", userToMap(participant.user))
                participant.reward?.toLucraReward()?.let(::rewardToMap)
                    ?.let { putMap("reward", it) }
            })
        }
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
