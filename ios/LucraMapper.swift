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

public func metricToMap(_ metric: LucraSDK.Metric?) -> [String: Any]? {
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

public func sportMatchupTeamToMap(team: LucraSDK.SportsMatchupTeam) -> [String: Any] {
  return [
    "id": team.id,
    "users": team.users.map(matchupTeamUserToMap),
    "outcome": team.outcome?.rawValue as Any,
    "player": playerToMap(team.player),
    "schedule": scheduleToMap(team.schedule) as Any,
    "metric": metricToMap(team.metric) as Any,
    "metricValue": team.metricValue as Any,
    "spread": team.spread,
    "wagerAmount": team.wagerAmount,
  ]

}

public func sportMatchupToMap(match: LucraSDK.SportsMatchup) -> [String: Any] {
  return [
    "id": match.id,
    "createdAt": match.createdAt.ISO8601Format(),
    "updatedAt": match.updatedAt.ISO8601Format(),
    "isPublic": match.isPublic,
    "status": match.status.rawValue,
    "teams": match.teams.map(sportMatchupTeamToMap),
  ]
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

public func GYPGameToMap(game: LucraSDK.GYPGame) -> [String: Any] {
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
    "createdAt": match.createdAt.toString(),
    "updatedAt": match.updatedAt.toString(),
    "status": match.status.rawValue,
    "isArchive": match.isArchive,
    // All the values inside the teams will always be the same, so map to the first available value
    "wagerOpponentTeamIdAmount": match.teams[0].wagerAmount,
    "game": GYPGameToMap(game: match.game),
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

public func tournametsMatchupToMap(tournament: LucraSDK.TournamentsMatchup) -> [String: Any] {
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
    "expiresAt": tournament.expiresAt.toString(),
    "pot": tournament.potTotal,
  ]

}
