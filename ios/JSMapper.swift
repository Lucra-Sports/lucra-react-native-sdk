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
    "logoUrl": team.logoUrl as Any,
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
    "date": schedule.date,
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
  var res: [String: Any] = [
    "id": teamUser.id,
    "user": userToMap(teamUser.user),
    "wagerPercentage": teamUser.wagerPercentage,
  ]
  return res
}

public func sportMatchupTeamToMap(team: LucraSDK.SportsMatchupTeam) -> [String: Any] {
  var res: [String: Any] = [
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
  return res
}

public func sportMatchupToMap(match: LucraSDK.SportsMatchup) -> [String: Any] {
  var res: [String: Any] = [
    "id": match.id,
    "createdAt": match.createdAt,
    "updatedAt": match.updatedAt,
    "status": match.status.rawValue,
    "isPublic": match.isPublic,
    "teams": match.teams.map(sportMatchupTeamToMap),
  ]
  return res
}
