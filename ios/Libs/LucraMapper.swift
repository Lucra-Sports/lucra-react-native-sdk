import Foundation
import LucraSDK

public func userToMap(_ user: LucraSDK.LucraUser) -> [String: Any] {
  return [
    "id": user.id,
    "socialConnectionId": user.socialConnectionId as Any,
    "username": user.username,
    "avatarUrl": user.avatarURL as Any,
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

public func sportIntervalsToMap(interval: LucraSDK.SportsInterval) -> [String: Any] {
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
    "intervals": sport.intervals?.map(sportIntervalsToMap) as Any,
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
    "headshotUrl": player.headshotUrl as Any,
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

public func lucraMatchupToMap(match: LucraSDK.LucraMatchup) -> [String: Any] {
    var map: [String: Any] = [
        "id": match.id,
        "createdAt": match.createdAt.ISO8601Format(),
        "updatedAt": match.updatedAt.ISO8601Format(),
        "creatorId": match.creatorId,
        // Swift enums are not bridgeable to [String: Any]; pass the raw value or the
        // field is silently dropped from the resolved JS object.
        "status": match.status == .unknown ? "UNKNOWN" : match.status.rawValue,
        "subtype": match.subtype == .unknown ? "UNKNOWN" : match.subtype.rawValue,
        "type": match.type == .unknown ? "UNKNOWN" : match.type.rawValue,
        "isPublic": match.isPublic,
        "creator": userToMap(match.creator)
    ]

    map["participantGroups"] = match.participantGroups.map { group in
        var groupMap: [String: Any] = [
            "id": group.id,
            "createdAt": group.createdAt.ISO8601Format(),
            "outcome": {
                switch group.outcome {
                case .loss: return "LOSS"
                case .tie: return "TIE"
                case .win: return "WIN"
                default: return "UNKNOWN"
                }
            }()
        ]

        groupMap["participants"] = group.participants.map { participant in
            var participantMap: [String: Any] = [
                "wager": participant.wager ?? 0.0,
                "user": userToMap(participant.user)
            ]

            // Only tournaments have leaderboard data; omit it elsewhere instead
            // of emitting a placeholder (parity with Android). Checking the
            // type, not tournamentDetails — the SDK populates tournamentDetails
            // with an empty object even for non-tournament matchups.
            if match.type == .tournament {
                participantMap["tournamentLeaderboard"] = tournamentLeaderboardToMap(match.tournamentDetails, participant: participant)
            }

            if let reward = participant.tenantReward {
                participantMap["reward"] = rewardToMap(reward: reward)
            }

            return participantMap
        }

        if let playerStats = group.professionalPlayerDetails {
            groupMap["professionalPlayerStatDetails"] = [
                "metric": metricToMap(playerStats.metric),
                "metricValue": Double(truncating: playerStats.metric.maxValue as NSNumber),
                "spread": Double(truncating: playerStats.spread as NSNumber),
                "player": playerToMap(playerStats.player),
                "schedule": scheduleToMap(group.professionalTeamDetails?.schedule) as Any
            ]
        }

        if let teamStats = group.professionalTeamDetails {
            groupMap["professionalTeamStatDetails"] = [
                "metric": metricToMap(teamStats.metric),
                "metricValue": Double(truncating: teamStats.metric.maxValue as NSNumber),
                "spread": Double(truncating: teamStats.spread as NSNumber),
                "team": teamToMap(teamStats.team) as Any,
                "schedule": scheduleToMap(teamStats.schedule) as Any
            ]
        }

        if let recGame = group.recreationalGameDetails {
            var recMap: [String: Any] = [
                "score": recGame.score,
                "teamName": group.name
            ]
            if let handicap = recGame.handicap {
                recMap["handicap"] = handicap
            }
            groupMap["recreationalGameStatDetails"] = recMap
        }

        return groupMap
    }

    if let winningGroup = match.winningGroup {
        map["winningGroupId"] = winningGroup.id
    }

    if let ext = match.recreationGameExtension {
        var extMap: [String: Any] = [
            "gameId": ext.gameId,
            "buyInAmount": ext.buyInAmount
        ]

        let game = ext.game
        var gameMap: [String: Any] = [
            "id": game.id,
            "name": game.name,
        ]

        if let description = game.description {
            gameMap["description"] = description
        }
        if let iconUrl = game.iconUrl {
            gameMap["iconUrl"] = iconUrl
        }
        if let imageUrl = game.imageUrl {
            gameMap["imageUrl"] = imageUrl
        }
        if let imageBgUrl = game.imageBgUrl {
            gameMap["imageBgUrl"] = imageBgUrl
        }

        gameMap["categoryIds"] = game.categoryIds

        extMap["game"] = gameMap

        map["recreationGameExtension"] = extMap
    }

    return map
}


public func lucraMatchupDetailsToMap(details: LucraSDK.LucraMatchupDetails) -> [String: Any] {
    var map: [String: Any] = [
        "matchup": lucraMatchupToMap(match: details.matchup)
    ]

    map["groups"] = details.groups.map { group in
        var groupMap: [String: Any] = [
            "id": group.id,
            "outcome": {
                switch group.outcome {
                case .loss: return "LOSS"
                case .tie: return "TIE"
                case .win: return "WIN"
                default: return "UNKNOWN"
                }
            }()
        ]

        if let name = group.name {
            groupMap["name"] = name
        }
        if let score = group.score {
            groupMap["score"] = score
        }

        groupMap["participants"] = group.participants.map { participant in
            var participantMap: [String: Any] = [
                "userId": participant.userId,
                "username": participant.username
            ]
            if let avatarUrl = participant.avatarUrl {
                participantMap["avatarUrl"] = avatarUrl
            }
            if let individualPayout = participant.individualPayout {
                participantMap["individualPayout"] = Double(truncating: individualPayout as NSNumber)
            }
            return participantMap
        }

        return groupMap
    }

    map["participantScores"] = details.participantScores.map { score in
        var scoreMap: [String: Any] = [:]
        if let userId = score.userId {
            scoreMap["userId"] = userId
        }
        if let username = score.username {
            scoreMap["username"] = username
        }
        if let avatarUrl = score.avatarUrl {
            scoreMap["avatarUrl"] = avatarUrl
        }
        if let place = score.place {
            scoreMap["place"] = place
        }
        if let scoreValue = score.score {
            scoreMap["score"] = scoreValue
        }
        if let finishedAt = score.finishedAt {
            scoreMap["finishedAt"] = finishedAt.ISO8601Format()
        }
        if let groupId = score.groupId {
            scoreMap["groupId"] = groupId
        }
        return scoreMap
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

public func tournamentLeaderboardToMap(_ tournament: LucraSDK.TournamentsMatchup?, participant: LucraSDK.LucraMatchupParticipant) -> [String: Any] {
    var map: [String: Any] = [:]
    
    let tournamentParticipant = tournament?.participants.first(where: { $0.id == participant.user.id })
    let place = tournamentParticipant?.place ?? 0
    let isTied = (tournament?.participants.filter { $0.place == place }.count ?? 0) > 1
    
    map["title"] = tournament?.title
    map["userScore"] = "" // Score is an internal only value
    map["place"] = place
    map["placeOverride"] = place
    map["rewardValue"] = tournamentParticipant?.rewardValue ?? 0.0
    map["rewardTierValue"] = tournament?.rewardStructure.first(where: { $0.position == Double(tournamentParticipant?.place ?? 0) })?.value ?? 0.0
    map["participantGroupId"] = tournamentParticipant?.id
    map["username"] = tournamentParticipant?.username
    map["isTieResult"] = isTied

    return map
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

public func tournamentsMatchupToMap(tournament: LucraSDK.TournamentsMatchup) -> [String: Any?] {
  return [
    "id": tournament.id,
    "title": tournament.title,
    "type": tournament.type,
    "fee": tournament.fee,
    "buyInAmount": tournament.buyInAmount,
    "potNetAmount": tournament.potNetAmount,
    "description": tournament.description as Any,
    "participants": tournament.participants.map(tournamentParticipantToMap),
    "status": tournament.status,
    "metadata": tournament.metadata as Any,
    "iconUrl": tournament.iconUrl as Any,
    "expiresAt": tournament.expiresAt?.ISO8601Format(),
    "potTotal": tournament.potTotal,
    "rewardType": tournament.rewardType as Any,
    "payoutStructure": tournament.payoutStructure.map(payoutStructureToMap) as Any,
  ]
}

public func payoutStructureToMap(_ payout: LucraSDK.TournamentsMatchup.PayoutStructure) -> [String: Any?] {
  return [
    "title": payout.title,
    "description": payout.description,
    "labelTitle": payout.labelTitle as Any,
    "labelDescription": payout.labelDescription as Any,
    "noPayout": payout.noPayout,
    "isPercentagePayout": payout.isPercentagePayout,
    "showAmount": payout.showAmount,
    "jackpotAmount": payout.jackpotAmount as Any,
    "jackpotDescriptor": payout.jackpotDescriptor as Any,
    "rewards": payout.rewards.map(payoutRewardToMap),
  ]
}

public func payoutRewardToMap(_ reward: LucraSDK.TournamentsMatchup.PayoutReward) -> [String: Any?] {
  return [
    "place": reward.place as Any,
    "endPlace": reward.endPlace as Any,
    "placeLabel": reward.placeLabel as Any,
    "positionLabel": reward.positionLabel as Any,
    "rewardLabel": reward.rewardLabel as Any,
    "amountLabel": reward.amountLabel as Any,
    "value": reward.value as Any,
    "catalogReward": reward.catalogReward.map(payoutCatalogRewardToMap) as Any,
  ]
}

public func payoutCatalogRewardToMap(_ reward: LucraSDK.TournamentsMatchup.CatalogReward) -> [String: Any?] {
  return [
    "id": reward.id,
    "type": reward.type,
    "title": reward.title,
    "description": reward.description as Any,
    "iconUrl": reward.iconUrl as Any,
    "bannerIconUrl": reward.bannerIconUrl as Any,
    "disclaimer": reward.disclaimer as Any,
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
      "metadata": user.metadata as Any,
    ]
  ]

  return userMap
}

public func mapToClientTheme(theme: [String: Any]) -> LucraSDK.ClientTheme {
  let primary = theme["primary"] as? String
  let secondary = theme["secondary"] as? String
  let tertiary = theme["tertiary"] as? String
  let onPrimary = theme["onPrimary"] as? String
  let onSecondary = theme["onSecondary"] as? String
  let onTertiary = theme["onTertiary"] as? String
  var fontFamily: FontFamily? = nil

  if let fontDict = theme["fontFamily"] as? [String: Any] {
    let regular = (fontDict["regular"] as? String) ?? (fontDict["normal"] as? String)
    let medium = (fontDict["medium"] as? String) ?? regular
    let semiBold = (fontDict["semibold"] as? String) ?? (fontDict["semiBold"] as? String) ?? regular
    let bold = (fontDict["bold"] as? String) ?? semiBold ?? regular

    if let regular = regular, let medium = medium, let semiBold = semiBold, let bold = bold {
      fontFamily = FontFamily(
        mediumFontName: medium,
        regularFontName: regular,
        semiBoldFontName: semiBold,
        boldFontName: bold
      )
    }
  } else if let fontBaseName = theme["fontFamily"] as? String {
    fontFamily = FontFamily(
      mediumFontName: "\(fontBaseName) Medium",
      regularFontName: "\(fontBaseName) Regular",
      semiBoldFontName: "\(fontBaseName) SemiBold",
      boldFontName: "\(fontBaseName) Bold"
    )
  }

  return ClientTheme(
    universalTheme: DynamicColorSet(
      background: nil,
      surface: nil,
      primary: primary,
      secondary: secondary,
      tertiary: tertiary,
      onBackground: nil,
      onSurface: nil,
      onPrimary: onPrimary,
      onSecondary: onSecondary,
      onTertiary: onTertiary),
    fontFamily: fontFamily
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
    dateOfBirth: user["dateOfBirth"] as? Date,
	metadata: user["metadata"] as? [String : String]
  )
}

// MARK: - Minigames Headless epic — Rewards & Achievements

public func rewardItemToMap(_ item: LucraSDK.RewardItem) -> [String: Any?] {
  var discountCode: [String: Any?]?
  if let code = item.discountCode {
    discountCode = [
      "code": code.code,
      "claimUrl": code.claimUrl,
    ]
  }

  var freeItem: [String: Any?]?
  if let free = item.freeItem {
    freeItem = [
      "itemId": free.itemId,
    ]
  }

  return [
    "id": item.id,
    "title": item.title,
    "descriptor": item.descriptor,
    "iconUrl": item.iconURL,
    "bannerIconUrl": item.bannerIconURL,
    "disclaimer": item.disclaimer,
    "discountCode": discountCode,
    "freeItem": freeItem,
  ]
}

public func earnedRewardToMap(_ reward: LucraSDK.EarnedReward) -> [String: Any?] {
  return [
    "id": reward.id,
    "place": reward.place,
    "matchupId": reward.matchupId,
    "matchupTitle": reward.matchupTitle,
    "claimedAt": reward.claimedAt?.ISO8601Format(),
    "viewedAt": reward.viewedAt?.ISO8601Format(),
    "reward": rewardItemToMap(reward.reward),
  ]
}

public func achievementCriteriaConfigToMap(_ config: LucraSDK.AchievementCriteriaConfig) -> [String: Any?] {
  return [
    "threshold": config.threshold,
    "conditionOperator": config.conditionOperator?.rawValue,
    "count": config.count,
    "place": config.place,
  ]
}

public func achievementItemToMap(_ item: LucraSDK.AchievementItem) -> [String: Any?] {
  return [
    "id": item.id,
    "title": item.title,
    "description": item.description,
    "iconUrl": item.iconUrl,
    "criteriaType": item.criteriaType.rawValue,
    "criteriaConfig": achievementCriteriaConfigToMap(item.criteriaConfig),
    "gameId": item.gameId,
    "catalogReward": item.catalogReward.map { rewardItemToMap($0) },
  ]
}

public func userAchievementToMap(_ achievement: LucraSDK.UserAchievement) -> [String: Any?] {
  return [
    "id": achievement.id,
    "userId": achievement.userId,
    "achievementId": achievement.achievementId,
    "tenantId": achievement.tenantId,
    "matchupId": achievement.matchupId,
    "userGameScoreId": achievement.userGameScoreId,
    "isEarned": achievement.isEarned,
    "earnedAt": achievement.earnedAt?.ISO8601Format(),
    "viewedAt": achievement.viewedAt?.ISO8601Format(),
    "claimedAt": achievement.claimedAt?.ISO8601Format(),
    "currentProgress": achievement.currentProgress,
    "achievement": achievement.achievement.map { achievementItemToMap($0) },
  ]
}

public func lucraFlowToMap(_ flow: LucraSDK.LucraFlow) -> [String: Any] {
  switch flow {
  case .onboarding:
    return ["flow": "onboarding"]
  case .verifyIdentity:
    return ["flow": "verifyIdentity"]
  case .addFunds:
    return ["flow": "addFunds"]
  case .withdrawFunds:
    return ["flow": "withdrawFunds"]
  case .createGamesMatchup(let gameId, let location):
    var map: [String: Any] = ["flow": "createGamesMatchup"]
    if let gameId { map["gameId"] = gameId }
    if let location { map["location"] = location }
    return map
  case .createSportsMatchup:
    return ["flow": "createSportsMatchup"]
  case .profile:
    return ["flow": "profile"]
  case .publicFeed:
    return ["flow": "publicFeed"]
  case .sportsContestDetails(let matchupId):
    return ["flow": "sportContestDetails", "matchupId": matchupId]
  case .gamesMatchupDetails(let matchupId):
    return ["flow": "gamesMatchupDetails", "matchupId": matchupId]
  case .myMatchups:
    return ["flow": "myMatchup"]
  case .matchupDetails(let matchupId):
    return ["flow": "matchupDetails", "matchupId": matchupId]
  case .tournamentDetails(let matchupId):
    return ["flow": "tournamentDetails", "matchupId": matchupId]
  case .demographicCollection:
    return ["flow": "demographicCollection"]
  case .wallet:
    return ["flow": "wallet"]
  case .homePage(let location):
    var map: [String: Any] = ["flow": "homePage"]
    if let location { map["location"] = location }
    return map
  case .achievements:
    return ["flow": "achievements"]
  case .transactionHistory:
    return ["flow": "transactionHistory"]
  case .customerSupport:
    return ["flow": "customerSupport"]
  case .responsibleGaming:
    return ["flow": "responsibleGaming"]
  case .notifications:
    return ["flow": "notifications"]
  case .miniGame(let gameId, let gameMode, let amount, let matchupId):
    // JS-facing mode strings (MiniGameMode enum), not the native rawValues
    let modeString: String
    switch gameMode {
    case .practice: modeString = "practice"
    case .oneVsOne: modeString = "1v1"
    case .freeForAll: modeString = "free_for_all"
    case .tournament: modeString = "tournament"
    @unknown default: modeString = gameMode.rawValue
    }
    var map: [String: Any] = ["flow": "miniGame", "gameMode": modeString]
    if let gameId { map["gameId"] = gameId }
    if let amount { map["amount"] = NSDecimalNumber(decimal: amount) }
    if let matchupId { map["matchupId"] = matchupId }
    return map
  @unknown default:
    return ["flow": String(describing: flow)]
  }
}
