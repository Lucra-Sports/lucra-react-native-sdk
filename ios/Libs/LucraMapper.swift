import Foundation
import LucraSDK

public func userToMap(_ user: LucraSDK.LucraUser) -> [String: Any] {
  return [
    "id": user.id,
    "socialConnectionId": user.id,
    "username": user.username,
    "avataUrl": user.avatarURL as Any,
    "loyaltyPoints": user.loyaltyPoints,
  ]
}

public func teamToMap(_ team: LucraSDK.Team?) -> [String: Any]? {
  guard let team = team else {
    return nil
  }

  return [
    "id": team.id,
    "fullName": team.fullName,
    "name": team.name,
    "sport": sportToMap(team.sport),
    "abbreviation": team.abbreviation,
  ]
}

public func scheduleToMap(_ schedule: LucraSDK.Schedule?) -> [String: Any]? {
  guard let schedule = schedule else {
    return nil
  }

  return [
    "id": schedule.id,
    "date": schedule.date.ISO8601Format(),
    "channel": schedule.channel as Any,
    "status": schedule.status.rawValue,
    "homeTeam": teamToMap(schedule.homeTeam) as Any,
    "awayTeam": teamToMap(schedule.awayTeam) as Any,
    "players": schedule.players?.map(playerToMap) as Any,
    "venue": schedule.venue,
    "roundName": schedule.roundName as Any,
    "statusDescription": schedule.statusDescription as Any,
    "homeScore": schedule.homeScore as Any,
    "awayScore": schedule.awayScore as Any,
    "sport": sportToMap(schedule.sport),
    "projectionsPending": schedule.projectionsPending as Any,
  ]
}

public func sportsIntervalToMap(interval: LucraSDK.SportsInterval) -> [String: Any] {
  return [
    "interval": interval.interval,
    "displayName": interval.displayName,
  ]
}

public func leagueToMap(_ league: LucraSDK.League?) -> [String: Any]? {
  guard let league = league else {
    return nil
  }
  return [
    "id": league.id,
    "name": league.name,
    "logoUrl": league.logoUrl,
    "priority": league.priority,
    "schedules": league.schedules?.map(scheduleToMap) as Any,
  ]
}

public func sportToMap(_ sport: LucraSDK.Sport) -> [String: Any] {
  return [
    "id": sport.id,
    "name": sport.name,
    "iconUrl": sport.iconUrl,
    "priority": sport.priority,
    "leagues": sport.leagues?.map(leagueToMap) as Any,
    "intervals": sport.intervals?.map(sportsIntervalToMap) as Any,
  ]
}

public func metricToMap(_ metric: LucraSDK.Metric?) -> [String: Any?]? {
  guard let metric = metric else {
    return nil
  }

  return [
    "id": metric.id,
    "displayName": metric.displayName,
    "pluralDisplayName": metric.pluralDisplayName,
    "shortName": metric.shortName,
    "maxValue": metric.maxValue,
    "active": metric.active,
    "comparisonType": metric.comparisonType.rawValue,
  ]
}

public func playerStatToMap(_ stat: LucraSDK.PlayerStat?) -> [String: Any]? {
  guard let stat = stat else {
    return nil
  }

  return [
    "metricId": stat.metricId,
    "value": stat.value as Any,
  ]
}

public func playerToMap(_ player: LucraSDK.Player) -> [String: Any] {
  return [
    "id": player.id,
    "firstName": player.firstName,
    "lastName": player.lastName,
    "headhostUrl": player.headshotUrl as Any,
    "lucraPosition": player.lucraPosition,
    "position": player.position,
    "positionAbbreviation": player.positionAbbreviation,
    "status": player.status,
    "isAvailable": player.isAvailable,
    "sport": sportToMap(player.sport),
    "positionMetrics": player.positionMetrics.map(metricToMap),
    "projectedStats": player.projectedStats?.map(playerStatToMap) as Any,
    "seasonAvgStats": player.seasonAvgStats?.map(playerStatToMap) as Any,
    "liveGameStats": player.liveGameStats?.map(playerStatToMap) as Any,
    "team": teamToMap(player.team) as Any,
    "league": leagueToMap(player.league) as Any,
    "ranking": player.ranking as Any,
    "schedule": scheduleToMap(player.schedule) as Any,
  ]

}

public func matchupTeamUserToMap(teamUser: LucraSDK.MatchupTeamUser) -> [String: Any] {
  return [
    "id": teamUser.id,
    "user": userToMap(teamUser.user),
    "wagerPercentage": teamUser.wagerPercentage,
  ]
}

public func sportMatchupToMap(match: LucraSDK.LucraMatchup) -> [String: Any] {
    return [
        "id": match.id,
        "createdAt": match.createdAt.ISO8601Format(),
        "updatedAt": match.updatedAt.ISO8601Format(),
        "status": match.status.rawValue,
        "subType": match.subtype.rawValue,
        "participantGroups": match.participantGroups.map { participantGroupToMap(group: $0) }
    ]
}

private func participantGroupToMap(group: LucraSDK.LucraMatchupGroup) -> [String: Any?] {
    var map: [String: Any?] = [
        "id": group.id,
        "outcome": {
            switch group.outcome {
            case .loss: return "LOSS"
            case .tie: return "TIE"
            case .win: return "WIN"
            case .none: return ""
            case .some(_):
                fatalError("Unimplemented outcome case")
            }
        }()
    ]

    if let teamStats = group.professionalTeamDetails {
        let teamDetails: [String: Any?] = [
            "metric": metricToMap(teamStats.metric),
            "metricValue": Double(truncating: teamStats.stats.value as NSNumber),
            "spread": Double(truncating: teamStats.spread as NSNumber),
            "team": teamToMap(teamStats.team),
            "schedule": scheduleToMap(teamStats.schedule)
        ]
        map["professionalTeamStateDetails"] = teamDetails
    }

    if let playerStats = group.professionalPlayerDetails {
        let playerDetails: [String: Any?] = [
            "metric": metricToMap(playerStats.metric),
            "metricValue": Double(truncating: playerStats.stats.value as NSNumber),
            "spread": Double(truncating: playerStats.spread as NSNumber),
            "player": playerToMap(playerStats.player),
            "schedule": ["scheduleId": playerStats.stats.scheduleId] // Assuming schedule mapping is not detailed in stats
        ]
        
        map["professionalPlayerStatDetails"] = playerDetails
        
    }

    if let recreationalGameDetails = group.recreationalGameDetails {
        map["recreationalGameDetails"] = [
            "id": recreationalGameDetails.id,
            "createdAt": recreationalGameDetails.createdAt.ISO8601Format(),
            "game": GYPGameToMap(recreationalGameDetails.game),
            "score": recreationalGameDetails.score
        ]
    }

    map["participants"] = group.participants.map { participantToMap(participant: $0) }

    return map
}

private func participantToMap(participant: LucraSDK.LucraMatchupParticipant) -> [String: Any] {
    var map: [String: Any] = [
        "user": userToMap(participant.user)
    ]

    if let reward = participant.tenantReward {
        map["reward"] = rewardToMap(reward: reward)
    }

    return map
}


private func rewardToMap(reward: LucraSDK.LucraReward) -> [String: Any?] {
    let map: [String: Any?] = [
        "rewardId": reward.rewardId,
        "title": reward.title,
        "descriptor": reward.descriptor,
        "iconUrl": reward.iconUrl,
        "bannerIconUrl": reward.bannerIconUrl,
        "disclaimer": reward.disclaimer,
        "metadata": reward.metadata
    ]
    
    return map
}

public func gamesMatchupTeamToMap(team: LucraSDK.GamesMatchupTeam) -> [String: Any] {
  return [
    "id": team.id,
    "outcome": team.outcome?.rawValue as Any,
    "users": team.users.map { user in
      return [
        "id": user.id,
        "username": user.user.username,
      ]
    },
  ]
}

public func GYPGameToMap(_ game: LucraSDK.GYPGame) -> [String: Any] {
  return [
    "id": game.id,
    "name": game.name,
    "description": game.description as Any,
    "iconUrl": game.iconUrl as Any,
    "imageUrl": game.imageUrl as Any,
    "categoryIds": game.categoryIds,
  ]
}

public func gamesMatchupToMap(match: LucraSDK.GamesMatchup) -> [String: Any] {
  return [
    "id": match.id,
    "createdAt": match.createdAt.ISO8601Format(),
    "updatedAt": match.updatedAt.ISO8601Format(),
    "status": match.status.rawValue,
    "isArchive": match.isArchive,
    // All the values inside the teams will always be the same, so map to the first available value
    "wagerOpponentTeamIdAmount": match.teams[0].wagerAmount,
    "game": GYPGameToMap(match.game),
    "teams": match.teams.map(gamesMatchupTeamToMap),
  ]
}

public func tournamentParticipantToMap(participant: LucraSDK.TournamentsMatchup.Participant)
  -> [String: Any]
{
  return [
    "id": participant.id,
    "username": participant.username,
    "place": participant.place as Any,
    "rewardValue": participant.rewardValue as Any,
  ]
}

public func tournamentLeaderboardToMap(leaderboard: LucraSDK.TournamentsMatchup.Leaderboard)
  -> [String: Any]
{
  return [
    "id": leaderboard.id,
    "username": leaderboard.username as Any,
    "rewardValue": leaderboard.rewardValue as Any,
  ]
}

public func tournametsMatchupToMap(tournament: LucraSDK.TournamentsMatchup) -> [String: Any?] {
  return [
    "id": tournament.id,
    "title": tournament.title,
    "type": tournament.type,
    "fee": tournament.fee,
    "buyInAmount": tournament.buyInAmount,
    "description": tournament.description as Any,
    "participants": tournament.participants.map(tournamentParticipantToMap),
    "leaderboards": tournament.leaderboards.map(tournamentLeaderboardToMap),
    "status": tournament.status,
    "metadata": tournament.metadata as Any,
    "iconUrl": tournament.iconUrl as Any,
    "expiresAt": tournament.expiresAt?.ISO8601Format(),
    "potTotal": tournament.potTotal,
  ]
}

public func sdkUserToMap(user: LucraSDK.SDKUser) -> [String: Any] {
  var addressMap: [String: String?]? = nil
  if let address = user.address {
    addressMap = [
      "address": address.address,
      "addressCont": address.addressCont,
      "city": address.city,
      "state": address.state,
      "zip": address.zip,
    ]
  }

  let userMap = [
    "user": [
      "id": user.id as Any,
      "username": user.username as Any,
      "avatarURL": user.avatarURL as Any,
      "phoneNumber": user.phoneNumber as Any,
      "email": user.email as Any,
      "firstName": user.firstName as Any,
      "lastName": user.lastName as Any,
      "address": addressMap as Any,
      "balance": user.balance,
      "accountStatus": user.accountStatus.rawValue,
      "dateOfBirth": user.dateOfBirth as Any,
    ]
  ]

  return userMap
}

public func mapToClientTheme(theme: [String: Any]) -> LucraSDK.ClientTheme {
  let background = theme["background"] as? String
  let surface = theme["surface"] as? String
  let primary = theme["primary"] as? String
  let secondary = theme["secondary"] as? String
  let tertiary = theme["tertiary"] as? String
  let onBackground = theme["onBackground"] as? String
  let onSurface = theme["onSurface"] as? String
  let onPrimary = theme["onPrimary"] as? String
  let onSecondary = theme["onSecondary"] as? String
  let onTertiary = theme["onTertiary"] as? String
  let fontFamilyName = theme["fontFamily"] as? String

  return ClientTheme(
    universalTheme: DynamicColorSet(
      background: background,
      surface: surface,
      primary: primary,
      secondary: secondary,
      tertiary: tertiary,
      onBackground: onBackground,
      onSurface: onSurface,
      onPrimary: onPrimary,
      onSecondary: onSecondary,
      onTertiary: onTertiary),
    fontFamilyName: fontFamilyName
  )
}

public func mapToSDKUser(user: [String: Any]) -> LucraSDK.SDKUser {
  var sdkAddress: LucraSDK.Address?
  if let address = user["address"] as? [String: Any] {
    sdkAddress = LucraSDK.Address(
      address: address["address"] as? String,
      addressCont: address["addressCont"] as? String,
      city: address["city"] as? String,
      state: address["state"] as? String,
      zip: address["zip"] as? String
    )
  }
  return SDKUser(
    username: user["username"] as? String,
    avatarURL: user["avatarURL"] as? String,
    phoneNumber: user["phoneNumber"] as? String,
    email: user["email"] as? String,
    firstName: user["firstName"] as? String,
    lastName: user["lastName"] as? String,
    address: sdkAddress,
    dateOfBirth: user["dateOfBirth"] as? Date
  )
}

public func gypCreatedMatchupOutputTopMap(output: GYPCreatedMatchupOutput) -> [String: Any] {
  return [
    "matchupId": output.matchupId,
    "ownerTeamId": output.ownerTeamId,
    "opponentTeamId": output.opponentTeamId,
  ]
}
